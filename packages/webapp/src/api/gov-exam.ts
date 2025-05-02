import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { GovExam } from './types';

// Query keys
export const govExamKeys = {
  all: ['govExams'] as const,
  list: () => [...govExamKeys.all, 'list'] as const,
  detail: (id: string) => [...govExamKeys.all, 'detail', id] as const,
};

// Fetch all gov exams
export const fetchGovExams = async (): Promise<GovExam[]> => {
  const response = await apiClient.get<GovExam[]>('/api/gov-exams');
  return response.data;
};

// React Query hooks
export const useGovExams = () => {
  return useQuery({
    queryKey: govExamKeys.list(),
    queryFn: fetchGovExams,
  });
};