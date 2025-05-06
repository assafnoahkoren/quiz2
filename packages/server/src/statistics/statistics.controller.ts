import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';

@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('counts')
  @UseGuards(AuthGuard, AdminGuard)
  async getModelCounts() {
    return this.statisticsService.getModelCounts();
  }

  @Get('user-creation-counts')
  @UseGuards(AuthGuard, AdminGuard)
  async getNonAdminUserCreationCountsByDay() {
    return this.statisticsService.getNonAdminUserCreationCountsByDay();
  }

  @Get('user-exam-question-creation-counts')
  @UseGuards(AuthGuard, AdminGuard)
  async getUserExamQuestionCreationCountsByDay() {
    return this.statisticsService.getUserExamQuestionCreationCountsByDay();
  }
} 