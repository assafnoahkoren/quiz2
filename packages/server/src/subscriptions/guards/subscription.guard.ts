import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException } from '@nestjs/common';
import { QuestionsService } from '../../questions/questions.service';
import { SubscriptionsService } from '../subscriptions.service';
import { Observable } from 'rxjs';
import { AuthedRequest } from '../../auth/types/authed-request.interface';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @Inject(QuestionsService) private readonly questionsService: QuestionsService,
    @Inject(SubscriptionsService) private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthedRequest = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      // Or handle as appropriate if user should always be present
      throw new UnauthorizedException('User not found in request'); 
    }

    const userId = user.id;

    // Check for a valid subscription first
    const hasValidSubscription = await this.subscriptionsService.hasValidSubscription(userId);

    if (hasValidSubscription) {
      return true; // Allow access if user has a valid subscription
    }

    // If no valid subscription, check answer count
    const answerCount = await this.questionsService.countAnswers(userId);

    if (answerCount <= 20) {
      return true; // Allow access if answer count is within limit
    }

    // If neither condition is met, deny access
    throw new UnauthorizedException('User requires an active subscription or must have less than 20 answers.');
  }
} 