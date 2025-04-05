import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from './types';

// Login mutation
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    }
  });
};

// Register mutation
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    }
  });
};

// Refresh token mutation
export const useRefreshTokenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/auth/refresh');
      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // You can optionally invalidate or update queries that depend on auth state
      // For example, if you have a user profile query
      queryClient.setQueryData(['user'], data.user);
    }
  });
}; 