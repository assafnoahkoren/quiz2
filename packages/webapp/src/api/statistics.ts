import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

// Define the expected response structure for model counts
export interface ModelCountsResponse {
  nonAdminUsersWithActiveSubscription: number;
  nonAdminUsersWithoutActiveSubscription: number;
  userExamQuestionsWithExamId: number;
  userExamQuestionsWithoutExamId: number;
}

// Define the expected response structure for creation counts by day
export type CreationCountsResponse = Record<string, number>;

// Query keys for statistics
export const statisticsKeys = {
  all: ['statistics'] as const,
  counts: () => [...statisticsKeys.all, 'counts'] as const,
  userCreationCounts: () => [...statisticsKeys.all, 'user-creation-counts'] as const,
  userExamQuestionCreationCounts: () => [...statisticsKeys.all, 'user-exam-question-creation-counts'] as const,
};

// Fetch model counts
export const fetchModelCounts = async (): Promise<ModelCountsResponse> => {
  const response = await apiClient.get<ModelCountsResponse>('/api/statistics/counts');
  return response.data;
};

// React Query hook to get model counts
export const useModelCounts = () => {
  return useQuery<ModelCountsResponse, Error>({
    queryKey: statisticsKeys.counts(),
    queryFn: fetchModelCounts,
    // Add any other options like staleTime, cacheTime, enabled, etc. as needed
    // For example, if this data doesn't change often, you might want to set a longer staleTime.
    // staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch non-admin user creation counts by day
export const fetchUserCreationCounts = async (): Promise<CreationCountsResponse> => {
  const response = await apiClient.get<CreationCountsResponse>('/api/statistics/user-creation-counts');
  return response.data;
};

// React Query hook to get non-admin user creation counts by day
export const useUserCreationCounts = () => {
  return useQuery<CreationCountsResponse, Error>({
    queryKey: statisticsKeys.userCreationCounts(),
    queryFn: fetchUserCreationCounts,
  });
};

// Fetch user exam question creation counts by day
export const fetchUserExamQuestionCreationCounts = async (): Promise<CreationCountsResponse> => {
  const response = await apiClient.get<CreationCountsResponse>('/api/statistics/user-exam-question-creation-counts');
  return response.data;
};

// React Query hook to get user exam question creation counts by day
export const useUserExamQuestionCreationCounts = () => {
  return useQuery<CreationCountsResponse, Error>({
    queryKey: statisticsKeys.userExamQuestionCreationCounts(),
    queryFn: fetchUserExamQuestionCreationCounts,
  });
}; 