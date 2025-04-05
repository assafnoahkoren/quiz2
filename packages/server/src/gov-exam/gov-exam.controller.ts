import { Controller, Get } from '@nestjs/common';
import { GovExamService } from './gov-exam.service';

@Controller('api/gov-exams')
export class GovExamController {
  constructor(private readonly govExamService: GovExamService) {}

  @Get()
  getAll() {
    return this.govExamService.getAll();
  }
} 