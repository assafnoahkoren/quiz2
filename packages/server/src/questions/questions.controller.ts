import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto } from './dto/question.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto> {
    return this.questionsService.create(createQuestionDto);
  }

  @Post('generate')
  @UseGuards(AuthGuard, AdminGuard)
  generateQuestion(
    @Body() data: { text: string; subjectId: string }
  ): Promise<QuestionResponseDto> {
    return this.questionsService.generateQuestion(data.text, data.subjectId);
  }

  @Get('subject/:subjectId')
  findBySubjectId(@Param('subjectId') subjectId: string): Promise<QuestionResponseDto[]> {
    return this.questionsService.findBySubjectId(subjectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<QuestionResponseDto> {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(
    @Param('id') id: string, 
    @Body() updateQuestionDto: UpdateQuestionDto
  ): Promise<QuestionResponseDto> {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.questionsService.remove(id);
  }
} 