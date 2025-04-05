import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectTreeItemDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  // Create a new subject
  async create(createSubjectDto: CreateSubjectDto) {
    // Check if the examId exists
    const examExists = await this.prisma.govExam.findUnique({
      where: { id: createSubjectDto.examId },
    });

    if (!examExists) {
      throw new NotFoundException(`Exam with ID ${createSubjectDto.examId} not found`);
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
  async findByGovExamId(examId: string): Promise<SubjectTreeItemDto[]> {
    // Check if exam exists
    const examExists = await this.prisma.govExam.findUnique({
      where: { id: examId },
    });

    if (!examExists) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    // Get all subjects for this exam
    const subjects = await this.prisma.subject.findMany({
      where: { examId },
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
          examId,
        },
      },
    });

    // Create a map of subject ID to question count
    const questionCountMap = new Map<string, number>();
    questionCounts.forEach(count => {
      questionCountMap.set(count.subjectId, count._count._all);
    });

    // Build the tree structure
    return this.buildSubjectTree(subjects, null, questionCountMap);
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
} 