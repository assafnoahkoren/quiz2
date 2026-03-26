import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';

@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('counts')
  @UseGuards(AuthGuard, AdminGuard)
  async getModelCounts(@Query('from') from?: string, @Query('to') to?: string) {
    return this.statisticsService.getModelCounts(from, to);
  }

  @Get('user-creation-counts')
  @UseGuards(AuthGuard, AdminGuard)
  async getNonAdminUserCreationCountsByDay(@Query('from') from?: string, @Query('to') to?: string) {
    return this.statisticsService.getNonAdminUserCreationCountsByDay(from, to);
  }

  @Get('user-exam-question-creation-counts')
  @UseGuards(AuthGuard, AdminGuard)
  async getUserExamQuestionCreationCountsByDay(@Query('from') from?: string, @Query('to') to?: string) {
    return this.statisticsService.getUserExamQuestionCreationCountsByDay(from, to);
  }
} 