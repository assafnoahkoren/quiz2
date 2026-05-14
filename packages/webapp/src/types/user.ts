// Based on backend User entity and DTOs

// Assuming a basic structure for Subscription
// Adjust if your actual Subscription model differs
export interface Subscription {
  id: string;
  userId: string;
  govExamId: string;
  expiresAt: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  correctnessThreshold?: number | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// A user with subscription data included
export interface EnrichedUser extends User {
  Subscriptions: Subscription[];
}

// DTO for creating a user (matches backend CreateUserDto)
export interface CreateUserDto {
  email: string;
  password?: string; // Optional on frontend, required on backend
  name?: string | null;
}

// DTO for updating a user (matches backend UpdateUserDto)
// All fields are optional
export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string | null;
  role?: UserRole;
  correctnessThreshold?: number | null;
}

// Type for the delete response
export interface DeleteUserResponse {
  message: string;
}

export type UserSortBy = 'name' | 'email' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type SubscriptionStatusFilter = 'active' | 'inactive';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  subscriptionStatus?: SubscriptionStatusFilter;
  sortBy?: UserSortBy;
  sortOrder?: SortOrder;
}

export interface PaginatedUsersResponse {
  data: EnrichedUser[];
  total: number;
  page: number;
  pageSize: number;
} 