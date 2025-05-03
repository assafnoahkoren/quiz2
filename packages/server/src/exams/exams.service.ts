import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { QuestionStatus } from '@prisma/client';
import { GetRandomQuestionsDto } from './dto/get-random-questions.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto, userId: string) {
    const { govExamId } = createExamDto;

    // 1. Fetch GovExam and its subject IDs
    const govExam = await this.prisma.govExam.findUnique({
      where: { id: govExamId },
      include: {
        Subject: { // Assuming relation name is 'Subject' (capitalized) based on error
          select: { id: true },
        },
      },
    });

    if (!govExam) {
      throw new NotFoundException(`Government exam with ID ${govExamId} not found.`);
    }

    const subjectIds = govExam.Subject.map((subject) => subject.id); // Use capitalized 'Subject'

    if (subjectIds.length === 0) {
        // Handle cases where the gov exam has no subjects, maybe throw an error or return?
        // For now, let's throw an error. Adjust as needed.
        throw new Error(`Government exam with ID ${govExamId} has no associated subjects.`);
    }

    // 2. Get 100 random question IDs for those subjects
    const questionIds = await this.getRandomQuestions({
      count: 100, // Get 100 questions
      subjectIds,
    });

    // 3. Create UserExam and link questions in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the UserExam
      const userExam = await tx.userExam.create({
        data: {
          userId: userId,
          govExamId: govExamId,
          startedAt: new Date(),
          completedAt: null,
        },
      });

      // Prepare data for UserExamQuestion creation
      const userExamQuestionsData = questionIds.map((questionId) => ({
        userExamId: userExam.id,
        questionId: questionId,
        userId: userId, // Add the missing userId
        // Add other default fields for UserExamQuestion if necessary, e.g., status
        // status: QuestionStatus.NOT_ANSWERED // Example, adjust based on your schema
      }));

      // Create UserExamQuestion entries
      if (userExamQuestionsData.length > 0) {
          await tx.userExamQuestion.createMany({ // Assuming model name is 'userExamQuestion'
            data: userExamQuestionsData,
          });
      }


      return userExam; // Return the created UserExam
    });
  }

  async getRandomQuestions(dto: GetRandomQuestionsDto): Promise<string[]> {
    const { count, subjectIds } = dto;

    // Fetch only the IDs of published questions for the given subjects
    const allQuestionIds = await this.prisma.question.findMany({
      where: {
        subjectId: {
          in: subjectIds,
        },
        status: QuestionStatus.PUBLISHED,
      },
      select: { // Select only the ID
        id: true,
      },
    });

    // Shuffle the objects containing IDs
    const shuffledQuestionIds = allQuestionIds
      .sort(() => 0.5 - Math.random()); // Basic shuffle
    
    // Slice the array and map to return only the IDs string array
    return shuffledQuestionIds.slice(0, count).map(question => question.id);
  }

  async findCurrentRunningExam(userId: string, maxDurationMinutes: number) {

    // Calculate the time threshold based on the provided minutes
    const thresholdTime = new Date();
    thresholdTime.setMinutes(thresholdTime.getMinutes() - maxDurationMinutes);

    // Find the first exam for the user that hasn't been completed and started within the allowed duration
    const runningExam = await this.prisma.userExam.findFirst({
      where: {
        userId: userId,
        completedAt: null, // Indicates the exam is ongoing
        // startedAt: {
        //   gte: thresholdTime, // Exam started within the specified duration
        // },
      },
      orderBy: {
        startedAt: 'desc', // Get the most recently started one if multiple exist
      },
    });


    return runningExam; // Returns the exam or null if none is found
  }

  async findOne(userExamId: string, userId: string) {
    const userExam = await this.prisma.userExam.findUnique({
      where: {
        id: userExamId,
        userId: userId, // Ensure the exam belongs to the user
      },
      include: {
        UserExamQuestions: {
			orderBy: {
				id: 'asc',
			},
			include: {
				Question: {
					include: {
						Options: true,
					},
				},
			},
		},
      }
    });

    if (!userExam) {
      throw new NotFoundException(`Exam with ID ${userExamId} not found or does not belong to the user.`);
    }

    return userExam;
  }

  async endExam(userExamId: string, userId: string, score: number) {
    // First, verify the exam exists and belongs to the user
    const existingExam = await this.prisma.userExam.findUnique({
      where: {
        id: userExamId,
        userId: userId,
      },
    });

    if (!existingExam) {
      throw new NotFoundException(`Exam with ID ${userExamId} not found or does not belong to the user.`);
    }

    if (existingExam.completedAt) {
        // Optionally handle cases where the exam is already completed
        // e.g., throw new Error('Exam is already completed.');
        console.warn(`Exam with ID ${userExamId} was already completed at ${existingExam.completedAt}. Overwriting completion date and score.`);
    }

    // Update the exam record with the completion date and score
    const updatedExam = await this.prisma.userExam.update({
      where: {
        id: userExamId,
        // We already verified userId, but including it again ensures atomicity if needed
        // However, id is unique, so technically not required here for the update itself
      },
      data: {
        completedAt: new Date(),
        score: score, // Assuming a 'score' field exists on the UserExam model
      },
    });

    return updatedExam;
  }

  async findUserExams(userId: string) {
    return this.prisma.userExam.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        startedAt: 'desc', // Order by most recent first
      },
      // Optionally include related data if needed, e.g., GovExam details
      // include: { GovExam: true }
    });
  }

  async setUserExamQuestionAnswer(
    userExamQuestionId: string,
    chosenOptionId: string | null, // Allow null to clear the answer
    userId: string,
  ) {
    // 1. Verify the UserExamQuestion exists and belongs to the user
    const userExamQuestion = await this.prisma.userExamQuestion.findUnique({
      where: {
        id: userExamQuestionId,
        userId: userId, // Ensure the question is associated with this user
      },
    });

    if (!userExamQuestion) {
      throw new NotFoundException(
        `User exam question with ID ${userExamQuestionId} not found or does not belong to the user.`,
      );
    }

    // 2. Update the UserExamQuestion with the chosen option
    const updatedUserExamQuestion = await this.prisma.userExamQuestion.update({
      where: {
        id: userExamQuestionId,
        // Redundant userId check here as findUnique already verified it,
        // but good for clarity or if logic changes.
      },
      data: {
        chosenOptionId: chosenOptionId,
        // answeredAt: new Date(), // Optionally track when the answer was submitted - Removed as it doesn't exist
      },
    });

    return updatedUserExamQuestion;
  }
} 