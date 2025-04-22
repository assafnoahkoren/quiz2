import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto } from './dto/question.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';

@Controller('api/questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto> {
    return this.questionsService.create(createQuestionDto);
  }

  @Post('generate')
  @UseGuards(AdminGuard)
  generateQuestion(
    @Body() data: { text: string; subjectId: string }
  ): Promise<QuestionResponseDto> {
    return this.questionsService.generateQuestion(data.text, data.subjectId);
  }

  @Post(':id/solve')
  @UseGuards(AdminGuard)
  solveQuestion(@Param('id') id: string): Promise<{ correctOption: any, explanation: string }> {
    return this.questionsService.solveQuestion(id);
  }

  @Post(':id/answer')
  answerExercise(
    @Param('id') questionId: string,
    @Body() data: { chosenOption: string, isCorrect: boolean },
    @Req() req
  ): Promise<any> {
    return this.questionsService.answerExercise(questionId, data.chosenOption, data.isCorrect, req.user.id);
  }

  @Post('random')
  getRandomQuestion(@Body() body: { subjectIds: string[] }): Promise<QuestionResponseDto> {
    return this.questionsService.getRandomQuestion(body.subjectIds);
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