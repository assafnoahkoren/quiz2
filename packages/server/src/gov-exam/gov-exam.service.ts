import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GovExamService {
  constructor(private prisma: PrismaService) {}

  // Get all government exams
  async getAll() {
    return this.prisma.govExam.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
} 