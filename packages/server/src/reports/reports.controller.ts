import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportDto } from './dto/report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';

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
  @UseGuards(AuthGuard)
  @UseGuards(AdminGuard)
  async findAll(): Promise<ReportDto[]> {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AdminGuard)
  async findOne(@Param('id') id: string): Promise<ReportDto> {
    return this.reportsService.findOne(id);
  }
}