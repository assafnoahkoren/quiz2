import { Module } from '@nestjs/common';
import { GovExamController } from './gov-exam.controller';
import { GovExamService } from './gov-exam.service';

@Module({
  controllers: [GovExamController],
  providers: [GovExamService],
})
export class GovExamModule {} 