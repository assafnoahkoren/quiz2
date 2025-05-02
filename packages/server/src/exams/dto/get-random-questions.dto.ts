import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetRandomQuestionsDto {
  @IsNumber()
  count: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  subjectIds: string[];
} 