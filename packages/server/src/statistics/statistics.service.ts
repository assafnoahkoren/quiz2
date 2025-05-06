import { Injectable } from '@nestjs/common';
// Assuming you have these services and DTOs, adjust imports as necessary
// import { UserService } from '../user/user.service'; // Example
// import { UserExamQuestionService } from '../user-exam-question/user-exam-question.service'; // Example
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { UserRole } from '@prisma/client'; // Import UserRole enum

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {} // Inject PrismaService

  async getModelCounts(): Promise<{
    nonAdminUsersWithActiveSubscription: number;
    nonAdminUsersWithoutActiveSubscription: number;
    userExamQuestionsWithExamId: number;
    userExamQuestionsWithoutExamId: number;
  }> {
    const [nonAdminUsersWithActiveSubscription, nonAdminUsersWithoutActiveSubscription, userExamQuestionsWithExamId, userExamQuestionsWithoutExamId] = await Promise.all([
      this.prisma.user.count({
        where: { 
          role: { not: UserRole.ADMIN }, 
          Subscriptions: { 
            some: { 
              expiresAt: { gt: new Date() } // Active if expiresAt is in the future
            }
          }
        },
      }),
      this.prisma.user.count({
        where: { 
          role: { not: UserRole.ADMIN }, 
          NOT: {
            Subscriptions: { 
              some: { 
                expiresAt: { gt: new Date() } 
              }
            }
          }
        }, 
      }),
      this.prisma.userExamQuestion.count({
        where: { userExamId: { not: null } }, 
      }),
      this.prisma.userExamQuestion.count({
        where: { userExamId: null }, 
      })
    ]);

    return {
      nonAdminUsersWithActiveSubscription,
      nonAdminUsersWithoutActiveSubscription,
      userExamQuestionsWithExamId,
      userExamQuestionsWithoutExamId,
    };
  }

  async getNonAdminUserCreationCountsByDay(): Promise<Record<string, number>> {
    // Assuming PostgreSQL for timezone conversion and date formatting syntax.
    // The 'User' table name is Prisma's default for the User model.
    // UserRole.ADMIN corresponds to the string 'ADMIN'.
    const rawQuery = `
      SELECT
        TO_CHAR(T."createdAt" AT TIME ZONE 'Asia/Jerusalem', 'YYYY-MM-DD') AS "creationDate",
        CAST(COUNT(*) AS INTEGER) AS "count"
      FROM
        "User" AS T
      WHERE
        T.role != 'ADMIN' /* Corresponds to UserRole.ADMIN */
      GROUP BY
        "creationDate"
      ORDER BY
        "creationDate" ASC
    `;

    // Define a type for the items in the raw query result array
    // This helps with type safety when processing the results.
    type QueryResultItem = {
      creationDate: string; // Format: YYYY-MM-DD
      count: number;
    };

    // Execute the raw SQL query.
    // Note: $queryRawUnsafe is used here because the query structure is static.
    // For queries with dynamic user inputs, prefer $queryRaw with Prisma.sql for parameterization.
    const results = await this.prisma.$queryRawUnsafe<QueryResultItem[]>(rawQuery);

    const countsByDay: Record<string, number> = {};
    for (const item of results) {
      countsByDay[item.creationDate] = item.count;
    }

    return countsByDay;
  }

  async getUserExamQuestionCreationCountsByDay(): Promise<Record<string, number>> {
    // Assuming PostgreSQL for timezone conversion and date formatting syntax.
    // The table name is Prisma's default for the UserExamQuestion model.
    const rawQuery = `
      SELECT
        TO_CHAR(T."createdAt" AT TIME ZONE 'Asia/Jerusalem', 'YYYY-MM-DD') AS "creationDate",
        CAST(COUNT(*) AS INTEGER) AS "count"
      FROM
        "UserExamQuestion" AS T /* Prisma default table name */
      GROUP BY
        "creationDate"
      ORDER BY
        "creationDate" ASC
    `;

    type QueryResultItem = {
      creationDate: string; // Format: YYYY-MM-DD
      count: number;
    };

    const results = await this.prisma.$queryRawUnsafe<QueryResultItem[]>(rawQuery);

    const countsByDay: Record<string, number> = {};
    for (const item of results) {
      countsByDay[item.creationDate] = item.count;
    }

    return countsByDay;
  }
} 