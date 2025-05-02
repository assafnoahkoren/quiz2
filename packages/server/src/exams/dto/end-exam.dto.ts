import { IsNotEmpty, IsNumber } from 'class-validator';

export class EndExamDto {
  @IsNotEmpty()
  @IsNumber()
  score: number;
} 