// Based on backend User entity and DTOs

// Assuming a basic structure for Subscription
// Adjust if your actual Subscription model differs
export interface Subscription {
  id: string;
  type: string; // e.g., 'FREE', 'PRO', 'ENTERPRISE'
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
  userId: string;
  // Add other relevant subscription fields
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  Subscriptions?: Subscription[]; // Included in findOne response
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
}

// Type for the delete response
export interface DeleteUserResponse {
  message: string;
} 