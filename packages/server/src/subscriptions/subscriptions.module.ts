import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuestionsModule } from '../questions/questions.module';
import { MySubscriptionController } from './my-subscription.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    forwardRef(() => QuestionsModule),
  ],
  providers: [SubscriptionsService],
  controllers: [
    MySubscriptionController,
    SubscriptionsController,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
