import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetAnswerDto {
  @IsString()
  @IsOptional() // Allow null or a string ID
  chosenOptionId: string | null;
} 