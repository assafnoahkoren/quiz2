export class SubscriptionEntity {
  id: string;
  userId: string;
  govExamId: string;
  expiresAt: Date;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
