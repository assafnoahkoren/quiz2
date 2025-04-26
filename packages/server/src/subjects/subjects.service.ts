import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectTreeItemDto } from './dto/subject.dto';
import { QuestionsService } from '../questions/questions.service';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class SubjectsService {
  constructor(
    private prisma: PrismaService,
    private questionsService: QuestionsService,
    private appConfigService: AppConfigService
  ) {}

  // Create a new subject
  async create(createSubjectDto: CreateSubjectDto) {
    // Check if the exam exists using govExamId
    const examExists = await this.prisma.govExam.findUnique({
      where: { id: createSubjectDto.govExamId },
    });

    if (!examExists) {
      throw new NotFoundException(`Exam with ID ${createSubjectDto.govExamId} not found`);
    }

    // Check if parent subject exists when provided
    if (createSubjectDto.parentSubjectId) {
      const parentExists = await this.prisma.subject.findUnique({
        where: { id: createSubjectDto.parentSubjectId },
      });

      if (!parentExists) {
        throw new NotFoundException(`Parent subject with ID ${createSubjectDto.parentSubjectId} not found`);
      }
    }

    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  // Update a subject by id
  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    // Check if subject exists
    const subjectExists = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subjectExists) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Check if parent subject exists when provided
    if (updateSubjectDto.parentSubjectId) {
      const parentExists = await this.prisma.subject.findUnique({
        where: { id: updateSubjectDto.parentSubjectId },
      });

      if (!parentExists) {
        throw new NotFoundException(`Parent subject with ID ${updateSubjectDto.parentSubjectId} not found`);
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  // Delete a subject
  async remove(id: string) {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { childrenSubjects: true },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Check if subject has children
    if (subject.childrenSubjects.length > 0) {
      throw new NotFoundException(`Cannot delete subject with children. Remove children first.`);
    }

    return this.prisma.subject.delete({
      where: { id },
    });
  }

  // Find subjects by exam id and return as tree
  async findByGovExamId(examId: string): Promise<{
    examId: string;
    examName: string;
    subjects: SubjectTreeItemDto[];
  }> {
    // Check if exam exists
    const exam = await this.prisma.govExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    // Get all subjects for this exam - using govExamId field
    const subjects = await this.prisma.subject.findMany({
      where: { govExamId: examId }, // Must use govExamId, not examId
      include: {
        _count: {
          select: { Questions: true },
        },
      },
    });

    // Get question counts separately
    const questionCounts = await this.prisma.question.groupBy({
      by: ['subjectId'],
      _count: {
        _all: true,
      },
      where: {
        Subject: {
          govExamId: examId, // Must use govExamId, not examId
        },
      },
    });

    // Create a map of subject ID to question count
    const questionCountMap = new Map<string, number>();
    questionCounts.forEach(count => {
      questionCountMap.set(count.subjectId, count._count._all);
    });

    // Build the tree structure
    const subjectTree = this.buildSubjectTree(subjects, null, questionCountMap);

    return {
      examId: exam.id,
      examName: exam.name,
      subjects: subjectTree
    };
  }

  // Helper method to build the subject tree
  private buildSubjectTree(
    subjects: any[],
    parentId: string | null,
    questionCountMap: Map<string, number>,
  ): SubjectTreeItemDto[] {
    return subjects
      .filter(subject => subject.parentSubjectId === parentId)
      .map(subject => ({
        id: subject.id,
        name: subject.name,
        questionCount: questionCountMap.get(subject.id) || 0,
        children: this.buildSubjectTree(subjects, subject.id, questionCountMap),
      }));
  }

  // Calculate the percentage of questions answered correctly >= N times for a user in a subject
  async getCorrectScore(userId: string, subjectId: string): Promise<number> {
    try {
      // 1. & 2. Fetch total questions and grouped answers in parallel
      const [totalQuestions, groupedAnswers] = await Promise.all([
        this.prisma.question.count({
          where: { subjectId: subjectId },
        }),
        this.questionsService.getGroupedAnswers(userId, subjectId)
      ]);

      if (totalQuestions === 0) {
        return 0; // No questions in the subject, so score is 0%
      }
      // If no answers yet, return 0%
      if (Object.keys(groupedAnswers).length === 0) {
        return 0;
      }

      // 3. Count questions answered correctly at least N times
      let correctlyAnsweredCount = 0;
      for (const questionId in groupedAnswers) {
        if (groupedAnswers[questionId].correct >= this.appConfigService.CORRECTNESS_THRESHOLD) {
          correctlyAnsweredCount++;
        }
      }

      // 4. Calculate the percentage
      const percentage = (correctlyAnsweredCount / totalQuestions) * 100;

      // Return rounded percentage
      return Math.round(percentage);

    } catch (error) {
      // Check for specific errors if needed, e.g., NotFoundException from getGroupedAnswers
      if (error instanceof NotFoundException) {
        // Handle case where subjectId might be invalid for groupedAnswers (though checked earlier)
        console.error(`Subject not found for score calculation: ${subjectId}`, error);
        throw error; // Re-throw specific error
      }
      // Log generic error appropriately
      console.error(`Error calculating correct score for user ${userId} in subject ${subjectId}:`, error);
      // Re-throw or handle as appropriate for your application error strategy
      throw new Error('Failed to calculate correct score');
    }
  }
}