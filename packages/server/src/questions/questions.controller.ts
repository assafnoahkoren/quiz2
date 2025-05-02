import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto, GetRandomQuestionDto } from './dto/question.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/role.guard';
import { AuthedRequest } from '../auth/types/authed-request.interface';
import { SubscriptionGuard } from 'src/subscriptions/guards/subscription.guard';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseGuards(AdminGuard)
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Req() request: AuthedRequest
  ): Promise<QuestionResponseDto> {
    return this.questionsService.create(createQuestionDto);
  }

  @Post('generate')
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard)
  generateQuestion(
    @Body() data: { text: string; subjectId: string },
    @Req() request: AuthedRequest
  ): Promise<QuestionResponseDto> {
    return this.questionsService.generateQuestion(data.text, data.subjectId);
  }

  @Post(':id/solve')
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard)
  solveQuestion(
    @Param('id') id: string,
    @Req() request: AuthedRequest
  ): Promise<{ correctOption: any, explanation: string }> {
    return this.questionsService.solveQuestion(id);
  }

  @Post(':id/answer')
  @UseGuards(SubscriptionGuard)
  @UseGuards(AuthGuard)
  answerExercise(
    @Param('id') questionId: string,
    @Body() data: { chosenOption: string, isCorrect: boolean },
    @Req() request: AuthedRequest
  ): Promise<any> {
    return this.questionsService.answerExercise(questionId, data.chosenOption, data.isCorrect, request.user.id);
  }

  @Post('random')
  @UseGuards(SubscriptionGuard)
  @UseGuards(AuthGuard)
  getRandomQuestion(
    @Body() body: GetRandomQuestionDto,
    @Req() request: AuthedRequest
  ): Promise<QuestionResponseDto> {
    const userId = request.user.id ?? null;
    return this.questionsService.getRandomQuestion(body.subjectIds, body.skipAnswered, userId);
  }

  @Get('subject/:subjectId')
  findBySubjectId(
    @Param('subjectId') subjectId: string,
    @Req() request: AuthedRequest
  ): Promise<QuestionResponseDto[]> {
    return this.questionsService.findBySubjectId(subjectId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthedRequest
  ): Promise<QuestionResponseDto> {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Req() request: AuthedRequest
  ): Promise<QuestionResponseDto> {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard)
  remove(
    @Param('id') id: string,
    @Req() request: AuthedRequest
  ): Promise<void> {
    return this.questionsService.remove(id);
  }
} 