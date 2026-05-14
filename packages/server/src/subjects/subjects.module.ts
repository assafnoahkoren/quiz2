import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { QuestionsModule } from '../questions/questions.module';
import { UserModule } from '../users/users.module';

@Module({
  imports: [QuestionsModule, UserModule],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}