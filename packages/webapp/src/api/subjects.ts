import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { CreateSubjectDto, Subject, SubjectTreeItem, UpdateSubjectDto, GovExamResponse } from './types';
import { govExamKeys } from './gov-exam';

// Query keys
export const subjectKeys = {
  all: ['subjects'] as const,
  lists: () => [...subjectKeys.all, 'list'] as const,
  list: (filters: { examId?: string }) => 
    [...subjectKeys.lists(), { ...filters }] as const,
  details: () => [...subjectKeys.all, 'detail'] as const,
  detail: (id: string) => [...subjectKeys.details(), id] as const,
};

// Fetch subjects by gov exam id
export const fetchSubjectsByExamId = async (examId: string): Promise<GovExamResponse> => {
  const response = await apiClient.get<GovExamResponse>(`/api/subjects/exam/${examId}`);
  return response.data;
};

// Create a new subject
export const createSubject = async (data: CreateSubjectDto): Promise<Subject> => {
  const response = await apiClient.post<Subject>('/api/subjects', data);
  return response.data;
};

// Update a subject
export const updateSubject = async ({ id, ...data }: UpdateSubjectDto & { id: string }): Promise<Subject> => {
  const response = await apiClient.patch<Subject>(`/api/subjects/${id}`, data);
  return response.data;
};

// Delete a subject
export const deleteSubject = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/subjects/${id}`);
};

// React Query hooks
export const useSubjectsByExamId = (examId: string) => {
  return useQuery({
    queryKey: subjectKeys.list({ examId }),
    queryFn: () => fetchSubjectsByExamId(examId),
    enabled: !!examId,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSubject,
    onSuccess: (data) => {
      // Invalidate subjects list for the exam
      queryClient.invalidateQueries({ 
        queryKey: subjectKeys.list({ examId: data.govExamId }) 
      });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSubject,
    onSuccess: (data) => {
      // Invalidate the specific subject and its exam's subject list
      queryClient.invalidateQueries({ queryKey: subjectKeys.detail(data.id) });
      queryClient.invalidateQueries({ 
        queryKey: subjectKeys.list({ examId: data.govExamId }) 
      });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: (_data, variables) => {
      // We don't know the examId after deletion, so invalidate all subject lists
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
}; 