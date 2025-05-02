import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { QuestionsModule } from '../questions/questions.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [QuestionsModule, SubscriptionsModule],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {} 