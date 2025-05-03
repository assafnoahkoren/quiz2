import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { Question } from './types';

// Define types based on backend DTOs and expected return values
// Adjust these based on your actual Prisma schema/API response
export interface CreateExamDto {
  govExamId: string;
}

export interface UserExam {
  id: string;
  userId: string;
  govExamId: string;
  startedAt: string; // Dates are often serialized as strings
  completedAt: string | null;
  score: number | null; // Add the score field
  UserExamQuestions: EnrichedUserExamQuestion[]; // Add related questions
  // Include other fields returned by your API if necessary
}

// Define the UserExamQuestion type based on likely schema
export interface UserExamQuestion {
  id: string;
  questionId: string;
  userExamId: string;
  userId: string;
  status: string; // Adjust type if using an enum (e.g., QuestionStatus)
  userAnswerId: string | null;
  // Add other relevant fields from your UserExamQuestion model
}

// Enriched type including nested Question details and Options
export interface EnrichedUserExamQuestion extends UserExamQuestion {
  Question: Question; // Embed the full Question details
}

// Query keys for exams
export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  details: () => [...examKeys.all, 'detail'] as const, // Key for single items
  detail: (id: string) => [...examKeys.details(), id] as const, // Key for specific item
  current: () => [...examKeys.all, 'current'] as const, // Key for current running exam
  // Add more specific keys as needed, e.g., for fetching user's exams
  userExams: () => [...examKeys.lists(), 'user'] as const, // Key for user's exams list
};

// API call function to create an exam
export const createExam = async (data: CreateExamDto): Promise<UserExam> => {
  const response = await apiClient.post<UserExam>('/api/exams', data);
  return response.data;
};

// API call function to get the current running exam
export const getCurrentRunningExam = async (durationMinutes?: number): Promise<UserExam | null> => {
  // Construct the URL, adding the duration parameter if provided
  const url = durationMinutes ? `/api/exams/current?duration=${durationMinutes}` : '/api/exams/current';
  const response = await apiClient.get<UserExam | null>(url); // Expect UserExam or null if none found
  return response.data;
};

// API call function to get an exam by ID
export const getExamById = async (examId: string): Promise<UserExam> => {
  const response = await apiClient.get<UserExam>(`/api/exams/${examId}`);
  return response.data;
};

// Interface for the data needed to end an exam
export interface EndExamData {
  score: number;
}

// API call function to end an exam
export const endExam = async (examId: string, data: EndExamData): Promise<UserExam> => {
  const response = await apiClient.patch<UserExam>(`/api/exams/${examId}/end`, data);
  return response.data;
};

// React Query hook for creating an exam
export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExam,
    onSuccess: (data) => {
      // Invalidate queries that might be affected by a new exam,
      // e.g., a list of the user's exams.
      // Add appropriate invalidations here based on your application's needs.
      // Example: queryClient.invalidateQueries({ queryKey: examKeys.userExams(data.userId) });
	  queryClient.invalidateQueries({ queryKey: examKeys.current() });
      console.log('Exam created successfully:', data);
    },
    onError: (error) => {
      // Handle or log errors
      console.error('Error creating exam:', error);
    },
  });
};

// React Query hook for ending an exam
export const useEndExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, data }: { examId: string; data: EndExamData }) => endExam(examId, data),
    onSuccess: (data, variables) => {
      // When an exam ends, invalidate the specific exam detail query
      queryClient.invalidateQueries({ queryKey: examKeys.detail(variables.examId) });
      // Also invalidate the 'current' running exam query, as it should now be null
      queryClient.invalidateQueries({ queryKey: examKeys.current() });
      // Optionally, invalidate other relevant queries like user's exam list
      // queryClient.invalidateQueries({ queryKey: examKeys.userExams(data.userId) }); // Assuming you have such a key
      console.log('Exam ended successfully:', data);
    },
    onError: (error) => {
      // Handle or log errors
      console.error('Error ending exam:', error);
    },
  });
};

// React Query hook for fetching a single exam by ID
export const useGetExamById = (examId: string | undefined) => {
  return useQuery({
    queryKey: examKeys.detail(examId!), // Use the specific detail key
    queryFn: () => getExamById(examId!), // Call the API function
    enabled: !!examId, // Only run the query if examId is defined
  });
};

// React Query hook for fetching the current running exam
export const useGetCurrentRunningExam = (durationMinutes: number = 210) => {
  return useQuery<UserExam | null, Error>({
    queryKey: examKeys.current(), // Use the specific key for the current exam
    queryFn: () => getCurrentRunningExam(durationMinutes), // Call the API function
    // Add any options like staleTime, cacheTime if needed
    // Example: staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// API call function to get all exams for the current user
export const getUserExams = async (): Promise<UserExam[]> => {
  const response = await apiClient.get<UserExam[]>('/api/exams/user/all');
  return response.data;
};

// React Query hook for fetching all exams for the current user
export const useGetUserExams = () => {
  return useQuery<UserExam[], Error>({
    queryKey: examKeys.userExams(), // Use the specific key for the user's exams
    queryFn: getUserExams, // Call the API function
  });
}; 