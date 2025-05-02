import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionStatus, QuestionType } from '@prisma/client';

export class OptionDto {
  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNotEmpty()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @IsEnum(QuestionStatus)
  @IsOptional()
  status?: QuestionStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options?: OptionDto[];
}

export class QuestionResponseDto {
  id: string;
  subjectId: string;
  question: string;
  imageUrl?: string;
  explanation?: string;
  type: QuestionType;
  status: QuestionStatus;
  createdAt: Date;
  updatedAt: Date;
  options: {
    id: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

// DTO for the random question request body
export class GetRandomQuestionDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  subjectIds: string[];

  @IsBoolean()
  @IsOptional()
  skipAnswered?: boolean;
} 