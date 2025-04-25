export class SubscriptionStatusDto {
  type: 'demo' | 'paid';
  freeQuestionsLeft: number | null;
  expirationDate: Date | null;
} 