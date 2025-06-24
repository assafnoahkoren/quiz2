import { useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';

// Types
export enum ReportType {
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  CONTENT_ERROR = 'CONTENT_ERROR',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
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
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReportStatusData {
  status: ReportStatus;
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

export const getReports = async (status?: ReportStatus): Promise<Report[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<Report[]>(REPORTS_ENDPOINT, { params });
  return response.data;
};

export const getPendingReportsCount = async (): Promise<number> => {
  const response = await apiClient.get<{ count: number }>(`${REPORTS_ENDPOINT}/pending-count`);
  return response.data.count;
};

export const updateReportStatus = async (id: string, data: UpdateReportStatusData): Promise<Report> => {
  const response = await apiClient.patch<Report>(`${REPORTS_ENDPOINT}/${id}/status`, data);
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

export const useReports = (status?: ReportStatus) => {
  return useQuery({
    queryKey: status ? [...reportKeys.lists(), status] : reportKeys.lists(),
    queryFn: () => getReports(status),
  });
};

export const usePendingReportsCount = () => {
  return useQuery({
    queryKey: [...reportKeys.all, 'pending-count'],
    queryFn: getPendingReportsCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportStatusData }) => 
      updateReportStatus(id, data),
    onSuccess: () => {
      // Invalidate all report queries to refresh the data
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};