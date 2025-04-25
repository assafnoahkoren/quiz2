import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthedRequest } from '../auth/types/authed-request.interface'; // Assuming path
import { SubscriptionStatusDto } from './dto/subscription-status.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('api/subscriptions/mine')
@UseGuards(AuthGuard)
export class MySubscriptionController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getMySubscriptionStatus(
    @Req() request: AuthedRequest,
  ): Promise<SubscriptionStatusDto> {
    const userId = request.user.id;
    return this.subscriptionsService.getSubscriptionStatus(userId);
  }
} 