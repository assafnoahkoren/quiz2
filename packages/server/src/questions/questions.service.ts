import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto } from './dto/question.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // Create a new question
  async create(createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto> {
    // Check if subject exists
    const subjectExists = await this.prisma.subject.findUnique({
      where: { id: createQuestionDto.subjectId },
    });

    if (!subjectExists) {
      throw new NotFoundException(`Subject with ID ${createQuestionDto.subjectId} not found`);
    }

    try {
      // Extract options from DTO to create separately
      const { options, ...questionData } = createQuestionDto;

      // Create question first
      const question = await this.prisma.question.create({
        data: questionData,
      });

      // Create options if provided
      if (options && options.length > 0) {
        await this.prisma.options.createMany({
          data: options.map(option => ({
            questionId: question.id,
            answer: option.answer,
            isCorrect: option.isCorrect,
          })),
        });
      }

      // Return the newly created question with options
      return this.findOne(question.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Error creating question');
      }
      throw error;
    }
  }

  // Find all questions
  async findAll(): Promise<QuestionResponseDto[]> {
    const questions = await this.prisma.question.findMany({
      include: {
        Options: true,
      },
    });

    return questions.map(q => this.mapToResponseDto(q));
  }

  // Find questions by subject ID
  async findBySubjectId(subjectId: string): Promise<QuestionResponseDto[]> {
    // Check if subject exists
    const subjectExists = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subjectExists) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const questions = await this.prisma.question.findMany({
      where: { subjectId },
      include: {
        Options: true,
      },
    });

    return questions.map(q => this.mapToResponseDto(q));
  }

  // Find a single question by ID
  async findOne(id: string): Promise<QuestionResponseDto> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        Options: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return this.mapToResponseDto(question);
  }

  // Update a question
  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<QuestionResponseDto> {
    // Check if question exists
    const questionExists = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!questionExists) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Check if subject exists if subjectId is being updated
    if (updateQuestionDto.subjectId) {
      const subjectExists = await this.prisma.subject.findUnique({
        where: { id: updateQuestionDto.subjectId },
      });

      if (!subjectExists) {
        throw new NotFoundException(`Subject with ID ${updateQuestionDto.subjectId} not found`);
      }
    }

    try {
      // Extract options from DTO
      const { options, ...questionData } = updateQuestionDto;

      // Update question data
      const updatedQuestion = await this.prisma.question.update({
        where: { id },
        data: questionData,
      });

      // Update options if provided
      if (options && options.length > 0) {
        // Delete existing options
        await this.prisma.options.deleteMany({
          where: { questionId: id },
        });

        // Create new options
        await this.prisma.options.createMany({
          data: options.map(option => ({
            questionId: id,
            answer: option.answer,
            isCorrect: option.isCorrect,
          })),
        });
      }

      // Return the updated question with options
      return this.findOne(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Error updating question');
      }
      throw error;
    }
  }

  // Delete a question
  async remove(id: string): Promise<void> {
    // Check if question exists
    const questionExists = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!questionExists) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    try {
      // Delete related options first
      await this.prisma.options.deleteMany({
        where: { questionId: id },
      });

      // Then delete the question
      await this.prisma.question.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Error deleting question');
      }
      throw error;
    }
  }

  // Helper method to map prisma question to response DTO
  private mapToResponseDto(question: any): QuestionResponseDto {
    return {
      id: question.id,
      subjectId: question.subjectId,
      question: question.question,
      imageUrl: question.imageUrl,
      explanation: question.explanation,
      type: question.type,
      status: question.status,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      options: question.Options.map(option => ({
        id: option.id,
        answer: option.answer,
        isCorrect: option.isCorrect,
      })),
    };
  }
} 