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

export interface DateRange {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

// Query keys for statistics
export const statisticsKeys = {
  all: ['statistics'] as const,
  counts: (range?: DateRange) => [...statisticsKeys.all, 'counts', range] as const,
  userCreationCounts: (range?: DateRange) => [...statisticsKeys.all, 'user-creation-counts', range] as const,
  userExamQuestionCreationCounts: (range?: DateRange) => [...statisticsKeys.all, 'user-exam-question-creation-counts', range] as const,
};

// Fetch model counts
export const fetchModelCounts = async (range?: DateRange): Promise<ModelCountsResponse> => {
  const response = await apiClient.get<ModelCountsResponse>('/api/statistics/counts', { params: range });
  return response.data;
};

// React Query hook to get model counts
export const useModelCounts = (range?: DateRange) => {
  return useQuery<ModelCountsResponse, Error>({
    queryKey: statisticsKeys.counts(range),
    queryFn: () => fetchModelCounts(range),
  });
};

// Fetch non-admin user creation counts by day
export const fetchUserCreationCounts = async (range?: DateRange): Promise<CreationCountsResponse> => {
  const response = await apiClient.get<CreationCountsResponse>('/api/statistics/user-creation-counts', { params: range });
  return response.data;
};

// React Query hook to get non-admin user creation counts by day
export const useUserCreationCounts = (range?: DateRange) => {
  return useQuery<CreationCountsResponse, Error>({
    queryKey: statisticsKeys.userCreationCounts(range),
    queryFn: () => fetchUserCreationCounts(range),
  });
};

// Fetch user exam question creation counts by day
export const fetchUserExamQuestionCreationCounts = async (range?: DateRange): Promise<CreationCountsResponse> => {
  const response = await apiClient.get<CreationCountsResponse>('/api/statistics/user-exam-question-creation-counts', { params: range });
  return response.data;
};

// React Query hook to get user exam question creation counts by day
export const useUserExamQuestionCreationCounts = (range?: DateRange) => {
  return useQuery<CreationCountsResponse, Error>({
    queryKey: statisticsKeys.userExamQuestionCreationCounts(range),
    queryFn: () => fetchUserExamQuestionCreationCounts(range),
  });
}; 