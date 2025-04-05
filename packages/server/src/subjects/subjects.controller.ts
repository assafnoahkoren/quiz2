import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto, SubjectTreeItemDto } from './dto/subject.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';

@Controller('api/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get('exam/:examId')
  findByGovExamId(@Param('examId') examId: string): Promise<SubjectTreeItemDto[]> {
    return this.subjectsService.findByGovExamId(examId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
} 