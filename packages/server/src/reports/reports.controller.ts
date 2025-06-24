import { Controller, Post, Get, Param, Body, UseGuards, Req, Patch, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportDto } from './dto/report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';
import { ReportStatus } from '@prisma/client';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() request: AuthedRequest,
    @Body() createReportDto: CreateReportDto
  ): Promise<ReportDto> {
    return this.reportsService.create(request.user.id, createReportDto);
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  async findAll(@Query('status') status?: ReportStatus): Promise<ReportDto[]> {
    return this.reportsService.findAll(status);
  }

  @Get('pending-count')
  @UseGuards(AuthGuard, AdminGuard)
  async getPendingCount(): Promise<{ count: number }> {
    const count = await this.reportsService.getPendingCount();
    return { count };
  }

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async findOne(@Param('id') id: string): Promise<ReportDto> {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto
  ): Promise<ReportDto> {
    return this.reportsService.updateStatus(id, updateStatusDto);
  }
}