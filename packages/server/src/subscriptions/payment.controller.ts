import { Controller, Post, Body, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { UseProviderGuard } from '../common/decorators/use-provider-guard.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from './subscriptions.service';
import { User, GovExam } from '@prisma/client';

// File-level cache for the GovExam promise
let requiredGovExamPromise: Promise<GovExam | null> | null = null;
const examName = 'קלינאות תקשורת'; // Define exam name here for consistency

@Controller('api/subscriptions/payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name); // Logger for initialization info

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {
    // Initiate the fetch only if it hasn't been started yet
    if (requiredGovExamPromise === null) {
        this.logger.log(`Initiating fetch for required GovExam "${examName}"...`);
        requiredGovExamPromise = this.prisma.govExam.findFirst({ where: { name: examName } });
        // Optionally add a .catch here to log critical failure during startup
        requiredGovExamPromise.catch(err => {
            this.logger.error(`CRITICAL: Failed to initiate fetch for GovExam "${examName}"!`, err);
        });
    }
  }

  @Post('webhook')
//   @HttpCode(HttpStatus.OK)
//   @UseProviderGuard('grow') // makes sure the request is coming from grow.co.il
  async handlePaymentWebhook(
    @Body() paymentWebhookDto: any,
  ): Promise<{ message: string; userId?: string }> {
    try {
      // 1. Extract Email
      const emailField = paymentWebhookDto.data?.dynamicFields?.find(
        (field) => field.label === 'מייל',
      );
      const email = emailField?.field_value;
      if (!email) {
        throw new BadRequestException('Email not found in webhook dynamic fields.');
      }

      // 2. Find User
      const userPromise = this.prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
	  
      // 3. Await the required GovExam (uses cached promise)
      const govExam = await requiredGovExamPromise;
	  
      // Await the user lookup result
      const user = await userPromise;
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found.`);
      }

      const price = parseFloat(paymentWebhookDto.data.sum);
      const currency = 'ILS'; // Assuming ILS
      const now = new Date();
      const expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));

      // 5. Create Subscription
      await this.subscriptionsService.create({
        userId: user.id,
        govExamId: govExam.id, // Use the resolved exam ID
        expiresAt: expiresAt,
        price: price,
        currency: currency,
      });


      // Success Case
      return {
        message: 'Webhook processed successfully and subscription created.',
        userId: user.id,
      };

    } catch (error) {
      // Centralized Error Handling
      console.error('Error processing payment webhook:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while processing the payment webhook.');
    }
  }
} 