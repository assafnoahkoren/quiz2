export interface Subscription {
  id: string;
  userId: string;
  govExamId: string;
  currency: string;
  price: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING'
}

export interface CreateSubscriptionDto {
  userId: string;
  govExamId: string;
  currency: string;
  price: number;
  expiresAt: string;
}

export interface UpdateSubscriptionDto {
  govExamId?: string;
  currency?: string;
  price?: number;
  expiresAt?: string;
}

// Add the DTO for subscription status
export interface SubscriptionStatusDto {
  type: 'demo' | 'paid';
  freeQuestionsLeft: number | null;
  expirationDate: string | null; // Use string for dates in DTOs typically
} 