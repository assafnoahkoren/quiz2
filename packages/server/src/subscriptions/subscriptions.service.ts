import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto/update-subscription.dto';
import { QuestionsService } from '../questions/questions.service';
import { SubscriptionStatusDto } from './dto/subscription-status.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(QuestionsService) private questionsService: QuestionsService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        userId: createSubscriptionDto.userId,
        govExamId: createSubscriptionDto.govExamId,
        expiresAt: createSubscriptionDto.expiresAt,
        price: createSubscriptionDto.price,
        currency: createSubscriptionDto.currency,
      },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        GovExam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findByUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: {
        GovExam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
  }

  async remove(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  // Check if a user has a valid subscription
  async hasValidSubscription(userId: string): Promise<boolean> {
    const now = new Date();
    const count = await this.prisma.subscription.count({
      where: {
        userId: userId,
        expiresAt: {
          gt: now, // Greater than the current time
        },
      },
    });

    return count > 0;
  }

  // Get subscription status for a user
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusDto> {
    const now = new Date();

    // Find the latest active subscription
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: userId,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        expiresAt: 'desc',
      },
    });

    if (activeSubscription) {
      // User has a paid subscription
      return {
        type: 'paid',
        freeQuestionsLeft: null,
        expirationDate: activeSubscription.expiresAt,
      };
    } else {
      // User is in demo mode, check answer count
      const answerCount = await this.questionsService.countAnswers(userId);
      const freeQuestionsLeft = Math.max(0, 20 - answerCount);

      return {
        type: 'demo',
        freeQuestionsLeft: freeQuestionsLeft,
        expirationDate: null,
      };
    }
  }
}
