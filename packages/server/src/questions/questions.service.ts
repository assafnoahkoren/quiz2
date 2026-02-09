import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto } from './dto/question.dto';
import { Prisma, QuestionStatus, QuestionType } from '@prisma/client';
import { AppConfigService } from 'src/config/config.service';
import { Anthropic } from '@anthropic-ai/sdk';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService, private appConfigService: AppConfigService) {}

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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return questions.map(q => this.mapToResponseDto(q));
  }

  // Get a random question from an array of subject IDs
  async getRandomQuestion(subjectIds: string[], skipAnswered: boolean = false, userId: string | null): Promise<QuestionResponseDto | null> {
    if (!subjectIds || subjectIds.length === 0) {
      throw new BadRequestException('At least one subject ID must be provided');
    }

    const correctnessThreshold = Number(this.appConfigService.CORRECTNESS_THRESHOLD);
    const isPublished = QuestionStatus.PUBLISHED.toString();

    let query;

    if (skipAnswered && userId && correctnessThreshold > 0) {
      // If skipAnswered is true, userId is provided, and threshold is valid, filter out questions
      // the user has answered correctly >= correctnessThreshold times.
      query = Prisma.sql`
        SELECT q.id
        FROM "Question" q
        LEFT JOIN "UserExamQuestion" ueq ON q.id = ueq."questionId" AND ueq."userId" = ${userId}
        WHERE q."subjectId" IN (${Prisma.join(subjectIds)})
        AND q."status"::text = ${isPublished}
        GROUP BY q.id
        HAVING COUNT(CASE WHEN ueq."isCorrect" = TRUE THEN 1 END) < ${correctnessThreshold}
        ORDER BY RANDOM()
        LIMIT 1
      `;
    } else {
      // Otherwise, get any random question matching the subject IDs and not in DRAFT status.
      query = Prisma.sql`
        SELECT q.id
        FROM "Question" q
        WHERE q."subjectId" IN (${Prisma.join(subjectIds)})
        AND q."status"::text = ${isPublished}
        ORDER BY RANDOM()
        LIMIT 1
      `;
    }

    try {
      // Use Prisma's raw query to get a random question ID
      const randomQuestionResult = await this.prisma.$queryRaw<{ id: string }[]>(query);

      if (!randomQuestionResult || randomQuestionResult.length === 0) {
        return null;
      }

      // Get the question with its options
      const questionId = randomQuestionResult[0].id;

      const questionWithOptions = await this.prisma.question.findUnique({
        where: { id: questionId },
        include: {
          Options: true,
        },
      });

      if (!questionWithOptions) {
        throw new NotFoundException(`Question with ID ${questionId} not found`);
      }

      return this.mapToResponseDto(questionWithOptions);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error retrieving random question: ${error.message}`);
    }
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

  async generateQuestion(text: string, subjectId: string): Promise<QuestionResponseDto> {
    const anthropic = new Anthropic({
      apiKey: this.appConfigService.ANTHROPIC_API_KEY,
    });

    try {
      // Check if subject exists
      const subjectExists = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subjectExists) {
        throw new NotFoundException(`Subject with ID ${subjectId} not found`);
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 6000,
        messages: [{ role: 'user', content: `
          I have a question with answer options. Please analyze it, identify the correct answer,
          and return a structured response.

          The question text is: ${text}

          Instructions:
          1. Determine the most accurate answer among the options
          2. Translate the question and all answers to Hebrew (keep technical terms in English if needed)
          3. Provide a brief explanation in Hebrew for why the selected answer is correct
          4. Please ensure only ONE option has isCorrect set to true.
          ` }],
        tools: [{
          name: 'save_question',
          description: 'Save the analyzed and translated question data',
          input_schema: {
            type: 'object' as const,
            properties: {
              question: { type: 'string', description: 'Hebrew translated question text' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    answer: { type: 'string', description: 'Hebrew translated answer option' },
                    isCorrect: { type: 'boolean', description: 'Whether this option is the correct answer' },
                  },
                  required: ['answer', 'isCorrect'],
                },
              },
              explanation: { type: 'string', description: 'Hebrew explanation of the correct answer' },
            },
            required: ['question', 'options', 'explanation'],
          },
        }],
        tool_choice: { type: 'tool', name: 'save_question' },
        temperature: 0.2,
      });

      // Extract the structured JSON from the tool use response
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');
      const parsedResponse = toolUseBlock['input'] as { question: string; options: { answer: string; isCorrect: boolean }[]; explanation: string };

      // Create question in database
      const newQuestion = await this.prisma.question.create({
        data: {
          subjectId,
          question: parsedResponse.question,
          explanation: parsedResponse.explanation,
          type: QuestionType.MCQ,
          status: QuestionStatus.DRAFT,
        },
      });

      // Create options for the question
      if (parsedResponse.options && parsedResponse.options.length > 0) {
        await this.prisma.options.createMany({
          data: parsedResponse.options.map(option => ({
            questionId: newQuestion.id,
            answer: option.answer,
            isCorrect: option.isCorrect,
          })),
        });
      }

      // Return the newly created question with options
      return this.findOne(newQuestion.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Error creating AI-generated question');
      }
      throw new BadRequestException(`Error generating question: ${error.message}`);
    }
  }

  async solveQuestion(questionId: string): Promise<{ correctOption: any, explanation: string }> {
    const anthropic = new Anthropic({
      apiKey: this.appConfigService.ANTHROPIC_API_KEY,
    });

    try {
      // Fetch the question with its options
      const question = await this.prisma.question.findUnique({
        where: { id: questionId },
        include: {
          Options: true,
        },
      });

      if (!question) {
        throw new NotFoundException(`Question with ID ${questionId} not found`);
      }

      // Format the question and options for the AI
      const optionsFormatted = question.Options.map((opt, idx) => 
        `${String.fromCharCode(65 + idx)}. ${opt.answer}`
      ).join('\n');

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4000,
        messages: [{ role: 'user', content: `
          Please solve this multiple-choice question:

          Question: ${question.question}

          Options:
          ${optionsFormatted}

          Instructions:
          1. Determine the correct answer option
          2. Provide a detailed explanation of why this answer is correct. The explanation should be in Hebrew (keep technical terms in English if needed). Add line breaks to the explanation for better readability.
          3. When explaining the correct answer, make sure to mention the correct option by its full text and do not use the letter.
        ` }],
        tools: [{
          name: 'submit_answer',
          description: 'Submit the solved answer with explanation',
          input_schema: {
            type: 'object' as const,
            properties: {
              correctOption: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The option ID' },
                  letter: { type: 'string', description: 'The letter of the correct option (A/B/C/D)' },
                  text: { type: 'string', description: 'The correct answer text' },
                },
                required: ['id', 'letter', 'text'],
              },
              explanation: { type: 'string', description: 'Detailed explanation of why this answer is correct' },
            },
            required: ['correctOption', 'explanation'],
          },
        }],
        tool_choice: { type: 'tool', name: 'submit_answer' },
        temperature: 0.2,
      });

      // Extract the structured JSON from the tool use response
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');
      const parsedResponse = toolUseBlock['input'] as { correctOption: { id: string; letter: string; text: string }; explanation: string };
      
      // Find the option ID based on the letter or text
      const correctOption = question.Options.find((opt, idx) => {
        const optionLetter = String.fromCharCode(65 + idx);
        return parsedResponse.correctOption.letter === optionLetter || 
               parsedResponse.correctOption.text === opt.answer;
      });

      return {
        correctOption: correctOption || parsedResponse.correctOption,
        explanation: parsedResponse.explanation
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Error solving question');
      }
      throw new BadRequestException(`Error solving question: ${error.message}`);
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
      Options: question.Options.map(option => ({
        id: option.id,
        answer: option.answer,
        isCorrect: option.isCorrect,
      })),
    };
  }

  // Create a UserExamQuestion for a standalone exercise (not part of an exam)
  async answerExercise(questionId: string, chosenOption: string, isCorrect: boolean, userId: string): Promise<any> {
    // Check if question exists
    const questionExists = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!questionExists) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    try {
      // Create the UserExamQuestion with userId
      const userExamQuestion = await this.prisma.userExamQuestion.create({
        data: {
          questionId,
          answer: chosenOption,
          isCorrect,
          userId
        },
      });

      return userExamQuestion;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error);
      }
      throw error;
    }
  }

  // Count answers for a specific user
  async countAnswers(userId: string): Promise<number> {
    try {
      const count = await this.prisma.userExamQuestion.count({
        where: { userId },
      });
      return count;
    } catch (error) {
      // Log the error or handle it as needed
      console.error(`Error counting answers for user ${userId}:`, error);
      throw new BadRequestException('Error counting user answers');
    }
  }

  // Get grouped answers by question for a specific user and subject
  async getGroupedAnswers(userId: string, subjectId: string): Promise<Record<string, { correct: number; wrong: number }>> {
    try {
      // Fetch and group user answers using Prisma's groupBy
      const groupedData = await this.prisma.userExamQuestion.groupBy({
        by: ['questionId', 'isCorrect'],
        where: {
          userId: userId,
          Question: { // Ensure relation name casing is correct
            subjectId: subjectId,
          },
        },
        _count: {
          _all: true, // Count all records in each group
        },
      });

      // Process the grouped data into the desired format
      const groupedAnswers: Record<string, { correct: number; wrong: number }> = {};

      groupedData.forEach(group => {
        const { questionId, isCorrect } = group;
        const count = group._count._all;

        if (!groupedAnswers[questionId]) {
          groupedAnswers[questionId] = { correct: 0, wrong: 0 };
        }

        if (isCorrect) {
          groupedAnswers[questionId].correct = count;
        } else {
          groupedAnswers[questionId].wrong = count;
        }
      });

      return groupedAnswers;
    } catch (error) {
      // Removed NotFoundException check as user deleted it previously
      console.error(`Error getting grouped answers for user ${userId} and subject ${subjectId}:`, error);
      throw new BadRequestException('Error retrieving grouped answers');
    }
  }
} 