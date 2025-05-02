import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateExamDto {
  @IsUUID()
  @IsNotEmpty()
  govExamId: string;
} 