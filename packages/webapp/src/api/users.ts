import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { User, CreateUserDto, UpdateUserDto, DeleteUserResponse, EnrichedUser } from '../types/user';
import apiClient from './client';

const USERS_ENDPOINT = 'api/users'; // Path relative to base URL in apiClient
const ME_ENDPOINT = 'api/me'; // Endpoint for current user

// API client functions
export const getUsers = async (): Promise<EnrichedUser[]> => {
  const response = await apiClient.get<EnrichedUser[]>(USERS_ENDPOINT);
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  if (!id) throw new Error('User ID is required');
  const response = await apiClient.get<User>(`${USERS_ENDPOINT}/${id}`);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(ME_ENDPOINT);
  return response.data;
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<User>(USERS_ENDPOINT, userData);
  return response.data;
};

export const updateUser = async ({ id, ...updateData }: { id: string } & UpdateUserDto): Promise<User> => {
  if (!id) throw new Error('User ID is required');
  const response = await apiClient.patch<User>(`${USERS_ENDPOINT}/${id}`, updateData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  if (!id) throw new Error('User ID is required');
  const response = await apiClient.delete<DeleteUserResponse>(`${USERS_ENDPOINT}/${id}`);
  return response.data;
};

// Query Keys Factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

// Hook to get all users
export const useGetUsers = (options?: Omit<UseQueryOptions<EnrichedUser[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<EnrichedUser[], Error>({
    queryKey: userKeys.lists(),
    queryFn: getUsers,
    ...options,
  });
};

// Hook to get a single user by ID
export const useGetUserById = (id: string, options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
    ...options,
  });
};

// Hook to get the current authenticated user
export const useCurrentUser = (options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User, Error>({
    queryKey: userKeys.me(),
    queryFn: getCurrentUser,
    ...options,
  });
};

// Hook to create a user
export const useCreateUser = (options?: UseMutationOptions<User, Error, CreateUserDto>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserDto>({
    mutationFn: createUser,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

// Hook to update a user
export const useUpdateUser = (options?: UseMutationOptions<User, Error, { id: string } & UpdateUserDto>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string } & UpdateUserDto>({
    ...options,
    mutationFn: updateUser,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() }); // Invalidate current user if updated
      options?.onSuccess?.(data, variables, context);
    },
  });
};

// Hook to delete a user
export const useDeleteUser = (options?: UseMutationOptions<DeleteUserResponse, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<DeleteUserResponse, Error, string>({
    mutationFn: deleteUser,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
}; 