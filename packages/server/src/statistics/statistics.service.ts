import { Injectable } from '@nestjs/common';
// Assuming you have these services and DTOs, adjust imports as necessary
// import { UserService } from '../user/user.service'; // Example
// import { UserExamQuestionService } from '../user-exam-question/user-exam-question.service'; // Example
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService
import { UserRole } from '@prisma/client'; // Import UserRole enum

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {} // Inject PrismaService

  async getModelCounts(from?: string, to?: string): Promise<{
    nonAdminUsersWithActiveSubscription: number;
    nonAdminUsersWithoutActiveSubscription: number;
    userExamQuestionsWithExamId: number;
    userExamQuestionsWithoutExamId: number;
  }> {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      dateFilter.lte = toDate;
    }
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const userCreatedAtFilter = hasDateFilter ? { createdAt: dateFilter } : {};
    const questionCreatedAtFilter = hasDateFilter ? { createdAt: dateFilter } : {};

    const [nonAdminUsersWithActiveSubscription, nonAdminUsersWithoutActiveSubscription, userExamQuestionsWithExamId, userExamQuestionsWithoutExamId] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: { not: UserRole.ADMIN },
          ...userCreatedAtFilter,
          Subscriptions: {
            some: {
              expiresAt: { gt: new Date() }
            }
          }
        },
      }),
      this.prisma.user.count({
        where: {
          role: { not: UserRole.ADMIN },
          ...userCreatedAtFilter,
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
        where: { userExamId: { not: null }, ...questionCreatedAtFilter },
      }),
      this.prisma.userExamQuestion.count({
        where: { userExamId: null, ...questionCreatedAtFilter },
      })
    ]);

    return {
      nonAdminUsersWithActiveSubscription,
      nonAdminUsersWithoutActiveSubscription,
      userExamQuestionsWithExamId,
      userExamQuestionsWithoutExamId,
    };
  }

  async getNonAdminUserCreationCountsByDay(from?: string, to?: string): Promise<Record<string, number>> {
    const params: string[] = [];
    let whereClause = `T.role != 'ADMIN'`;

    if (from) {
      params.push(from);
      whereClause += ` AND T."createdAt" >= $${params.length}::date`;
    }
    if (to) {
      params.push(to);
      whereClause += ` AND T."createdAt" < ($${params.length}::date + interval '1 day')`;
    }

    const rawQuery = `
      SELECT
        TO_CHAR(T."createdAt" AT TIME ZONE 'Asia/Jerusalem', 'YYYY-MM-DD') AS "creationDate",
        CAST(COUNT(*) AS INTEGER) AS "count"
      FROM
        "User" AS T
      WHERE
        ${whereClause}
      GROUP BY
        "creationDate"
      ORDER BY
        "creationDate" ASC
    `;

    type QueryResultItem = { creationDate: string; count: number };
    const results = await this.prisma.$queryRawUnsafe<QueryResultItem[]>(rawQuery, ...params);

    const countsByDay: Record<string, number> = {};
    for (const item of results) {
      countsByDay[item.creationDate] = item.count;
    }

    return countsByDay;
  }

  async getUserExamQuestionCreationCountsByDay(from?: string, to?: string): Promise<Record<string, number>> {
    const params: string[] = [];
    let whereClause = '1=1';

    if (from) {
      params.push(from);
      whereClause += ` AND T."createdAt" >= $${params.length}::date`;
    }
    if (to) {
      params.push(to);
      whereClause += ` AND T."createdAt" < ($${params.length}::date + interval '1 day')`;
    }

    const rawQuery = `
      SELECT
        TO_CHAR(T."createdAt" AT TIME ZONE 'Asia/Jerusalem', 'YYYY-MM-DD') AS "creationDate",
        CAST(COUNT(*) AS INTEGER) AS "count"
      FROM
        "UserExamQuestion" AS T
      WHERE
        ${whereClause}
      GROUP BY
        "creationDate"
      ORDER BY
        "creationDate" ASC
    `;

    type QueryResultItem = { creationDate: string; count: number };
    const results = await this.prisma.$queryRawUnsafe<QueryResultItem[]>(rawQuery, ...params);

    const countsByDay: Record<string, number> = {};
    for (const item of results) {
      countsByDay[item.creationDate] = item.count;
    }

    return countsByDay;
  }
} 