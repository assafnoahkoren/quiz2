import { useMutation } from '@tanstack/react-query';
import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from './types';

// Login mutation
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response.data;
    }
  });
};

// Register mutation
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    }
  });
}; 