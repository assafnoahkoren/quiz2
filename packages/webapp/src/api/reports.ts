import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import apiClient from './client';

// Types
export enum ReportType {
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  CONTENT_ERROR = 'CONTENT_ERROR',
  OTHER = 'OTHER',
}

export interface CreateReportData {
  type: ReportType;
  message: string;
  phoneNumber: string;
  questionId?: string;
  govExamId: string;
  questionData: any;
}

export interface Report {
  id: string;
  type: ReportType;
  reporterId: string;
  message: string;
  phoneNumber: string;
  questionId?: string | null;
  govExamId: string;
  questionData: any;
  createdAt: string;
  updatedAt: string;
}

// API endpoint
const REPORTS_ENDPOINT = '/api/reports';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
};

// API functions
export const createReport = async (data: CreateReportData): Promise<Report> => {
  const response = await apiClient.post<Report>(REPORTS_ENDPOINT, data);
  return response.data;
};

// React Query hooks
export const useCreateReport = (
  options?: UseMutationOptions<Report, Error, CreateReportData>
) => {
  return useMutation({
    mutationFn: createReport,
    ...options,
  });
};