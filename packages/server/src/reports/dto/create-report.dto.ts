import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsUUID()
  questionId?: string;

  @IsUUID()
  @IsNotEmpty()
  govExamId: string;

  @IsObject()
  @IsNotEmpty()
  questionData: any;
}