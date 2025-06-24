import { ReportType } from '@prisma/client';

export class ReportDto {
  id: string;
  type: ReportType;
  reporterId: string;
  message: string;
  phoneNumber: string;
  questionId?: string | null;
  govExamId: string;
  questionData: any;
  createdAt: Date;
  updatedAt: Date;
}