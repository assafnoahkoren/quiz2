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