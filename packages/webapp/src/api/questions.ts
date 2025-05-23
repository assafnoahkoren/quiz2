import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { CreateQuestionDto, Question, UpdateQuestionDto } from './types';
import { subjectKeys } from './subjects';
import { useMySubscriptionStatus, subscriptionKeys } from './subscriptions';
import { SubscriptionStatusDto } from '../types/subscription';

// Query keys
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: { subjectId?: string }) => 
    [...questionKeys.lists(), { ...filters }] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
};

// Fetch questions by subject id
export const fetchQuestionsBySubjectId = async (subjectId: string): Promise<Question[]> => {
  const response = await apiClient.get<Question[]>(`/api/questions/subject/${subjectId}`);
  return response.data;
};

// Fetch a question by id
export const fetchQuestionById = async (id: string): Promise<Question> => {
  const response = await apiClient.get<Question>(`/api/questions/${id}`);
  return response.data;
};

// Create a new question
export const createQuestion = async (data: CreateQuestionDto): Promise<Question> => {
  const response = await apiClient.post<Question>('/api/questions', data);
  return response.data;
};

// Update a question
export const updateQuestion = async ({ id, ...data }: UpdateQuestionDto & { id: string }): Promise<Question> => {
  const response = await apiClient.patch<Question>(`/api/questions/${id}`, data);
  return response.data;
};

// Delete a question
export const deleteQuestion = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/questions/${id}`);
};

// Generate a question using AI
export const generateQuestion = async (data: { text: string; subjectId: string }): Promise<Question> => {
  const response = await apiClient.post<Question>('/api/questions/generate', data);
  return response.data;
};

// Solve a question using AI
export const solveQuestion = async (id: string): Promise<{ correctOption: any, explanation: string }> => {
  const response = await apiClient.post<{ correctOption: any, explanation: string }>(`/api/questions/${id}/solve`);
  return response.data;
};

// Get a random question from specified subjects
export const getRandomQuestion = async (params: { subjectIds: string[], skipAnswered: boolean }): Promise<Question> => {
  const response = await apiClient.post<Question>('/api/questions/random', params);
  return response.data;
};

// Answer a standalone exercise
export const answerExercise = async (
  questionId: string, 
  data: { chosenOption: string, isCorrect: boolean }
): Promise<any> => {
  const response = await apiClient.post(`/api/questions/${questionId}/answer`, data);
  return response.data;
};

// React Query hooks
export const useQuestionsBySubjectId = (subjectId: string) => {
  return useQuery({
    queryKey: questionKeys.list({ subjectId }),
    queryFn: () => fetchQuestionsBySubjectId(subjectId),
    enabled: !!subjectId,
  });
};

export const useQuestion = (id?: string) => { 
  return useQuery({
    queryKey: questionKeys.detail(id!),
    queryFn: () => fetchQuestionById(id!),
    enabled: !!id,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (data) => {
      // Invalidate questions list for the subject
      queryClient.invalidateQueries({ 
        queryKey: questionKeys.list({ subjectId: data.subjectId }) 
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: (data) => {
      // Invalidate the specific question and its subject's question list
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(data.id) });
      queryClient.invalidateQueries({ 
        queryKey: questionKeys.list({ subjectId: data.subjectId }) 
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_data, variables, context) => {
      // We need the subjectId to properly invalidate, so pass it in the context
      // For now, invalidate all question lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
};

export const useGenerateQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: generateQuestion,
    onSuccess: (data) => {
      // Invalidate questions list for the subject
      queryClient.invalidateQueries({ 
        queryKey: questionKeys.list({ subjectId: data.subjectId }) 
      });
    },
  });
};

export const useSolveQuestion = () => {
  return useMutation({
    mutationFn: solveQuestion
  });
};

export const useRandomQuestion = () => {
  return useMutation({
    mutationFn: getRandomQuestion
  });
};

export const useAnswerExercise = () => {
  const { data: subscriptionStatus } = useMySubscriptionStatus();
  const isFreeUser = subscriptionStatus?.type === 'demo';
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, chosenOption, isCorrect, subjectId }: {
      questionId: string;
      chosenOption: string;
      isCorrect: boolean;
      subjectId?: string;
    }) => answerExercise(questionId, { chosenOption, isCorrect }),
    onSuccess: (data, variables) => {
      if (variables.subjectId) {
        queryClient.invalidateQueries({ queryKey: subjectKeys.score(variables.subjectId) });
      } else {
        queryClient.invalidateQueries({ queryKey: subjectKeys.scores() });
      }

      if (isFreeUser) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.myStatus() });
      }
    },
  });
}; 