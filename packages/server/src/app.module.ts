import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SubjectsModule } from './subjects/subjects.module';
import { GovExamModule } from './gov-exam/gov-exam.module';
import { QuestionsModule } from './questions/questions.module';
import { AppConfigModule } from './config/config.module';
import { UserModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ExamsModule } from './exams/exams.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    SubjectsModule,
    GovExamModule,
    QuestionsModule,
    UserModule,
    SubscriptionsModule,
    ExamsModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 