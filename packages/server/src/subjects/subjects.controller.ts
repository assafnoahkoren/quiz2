import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { UserService } from '../users/users.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectTreeItemDto } from './dto/subject.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';

@Controller('api/subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(
    @Body() createSubjectDto: CreateSubjectDto,
    @Req() request: AuthedRequest
  ) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get('exam/:examId')
  findByGovExamId(@Param('examId') examId: string): Promise<{
    examId: string;
    examName: string;
    subjects: SubjectTreeItemDto[];
  }> {
    return this.subjectsService.findByGovExamId(examId);
  }

  @Get(':subjectId/score')
  @UseGuards(AuthGuard)
  async getCorrectScore(
    @Param('subjectId') subjectId: string,
    @Req() request: AuthedRequest,
  ): Promise<number> {
    const threshold = await this.userService.getCorrectnessThreshold(request.user.id);
    return this.subjectsService.getCorrectScore(request.user.id, subjectId, threshold);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Req() request: AuthedRequest
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(
    @Param('id') id: string,
    @Req() request: AuthedRequest
  ) {
    return this.subjectsService.remove(id);
  }
} 