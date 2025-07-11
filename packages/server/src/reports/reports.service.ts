import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportDto } from './dto/report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, createReportDto: CreateReportDto): Promise<ReportDto> {
    // Verify that the question exists and belongs to the specified govExam
    if (createReportDto.questionId) {
      const question = await this.prisma.question.findUnique({
        where: { id: createReportDto.questionId },
        include: { Subject: true },
      });

      if (!question) {
        throw new NotFoundException(`Question with ID "${createReportDto.questionId}" not found`);
      }

      if (question.Subject.govExamId !== createReportDto.govExamId) {
        throw new NotFoundException(
          `Question does not belong to the specified government exam`
        );
      }
    }

    // Verify that the govExam exists
    const govExam = await this.prisma.govExam.findUnique({
      where: { id: createReportDto.govExamId },
    });

    if (!govExam) {
      throw new NotFoundException(`Government exam with ID "${createReportDto.govExamId}" not found`);
    }

    const report = await this.prisma.report.create({
      data: {
        type: createReportDto.type,
        reporterId,
        message: createReportDto.message,
        phoneNumber: createReportDto.phoneNumber,
        questionId: createReportDto.questionId || null,
        govExamId: createReportDto.govExamId,
        questionData: createReportDto.questionData,
      },
    });

    return report;
  }

  async findAll(status?: ReportStatus): Promise<ReportDto[]> {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<ReportDto> {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    return report;
  }

  async updateStatus(id: string, updateStatusDto: UpdateReportStatusDto): Promise<ReportDto> {
    const report = await this.findOne(id);

    return this.prisma.report.update({
      where: { id },
      data: { status: updateStatusDto.status },
    });
  }

  async getPendingCount(): Promise<number> {
    return this.prisma.report.count({
      where: { status: ReportStatus.PENDING },
    });
  }
}