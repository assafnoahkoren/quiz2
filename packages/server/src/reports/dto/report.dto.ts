import { ReportType, ReportStatus } from '@prisma/client';

export class ReportDto {
  id: string;
  type: ReportType;
  reporterId: string;
  message: string;
  phoneNumber: string;
  questionId?: string | null;
  govExamId: string;
  questionData: any;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}