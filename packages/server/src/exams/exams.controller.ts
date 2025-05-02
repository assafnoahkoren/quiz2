import { Controller, Post, Body, UseGuards, Req, Get, Param, Query, ParseIntPipe, DefaultValuePipe, Patch } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';
import { EndExamDto } from './dto/end-exam.dto';

@Controller('api/exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createExamDto: CreateExamDto,
    @Req() request: AuthedRequest,
  ) {
    const userId = request.user.id;
    return this.examsService.create(createExamDto, userId);
  }

  
  @Get('current')
  @UseGuards(AuthGuard)
  findCurrentRunning(
    @Req() request: AuthedRequest,
    @Query('duration', new DefaultValuePipe(210), ParseIntPipe) durationMinutes: number,
  ) {
    const userId = request.user.id;
    return this.examsService.findCurrentRunningExam(userId, durationMinutes);
  }

  @Patch(':id/end')
  @UseGuards(AuthGuard)
  endExam(
    @Param('id') userExamId: string,
    @Body() endExamDto: EndExamDto,
    @Req() request: AuthedRequest,
  ) {
    const userId = request.user.id;
    return this.examsService.endExam(userExamId, userId, endExamDto.score);
  }
  
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @Req() request: AuthedRequest) {
    const userId = request.user.id;
    return this.examsService.findOne(id, userId);
  }

} 