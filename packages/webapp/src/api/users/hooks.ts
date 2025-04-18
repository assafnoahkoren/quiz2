import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { User, CreateUserDto, UpdateUserDto, DeleteUserResponse } from '../../types/user'; // Use relative path
import * as apiClient from './client';

// Query Keys Factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const, // Example if filtering is needed
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hook to get all users
export const useGetUsers = (options?: Omit<UseQueryOptions<User[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User[], Error>({
    queryKey: userKeys.lists(),
    queryFn: apiClient.getUsers,
    ...options,
  });
};

// Hook to get a single user by ID
export const useGetUserById = (id: string, options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => apiClient.getUserById(id),
    enabled: !!id, // Only run the query if the id is provided
    ...options,
  });
};

// Hook to create a user
export const useCreateUser = (options?: UseMutationOptions<User, Error, CreateUserDto>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserDto>({
    mutationFn: apiClient.createUser,
    onSuccess: (data, variables, context) => {
      // Invalidate the users list query to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

// Hook to update a user
export const useUpdateUser = (options?: UseMutationOptions<User, Error, { id: string } & UpdateUserDto>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string } & UpdateUserDto>({
    mutationFn: apiClient.updateUser,
    onSuccess: (data, variables, context) => {
      // Invalidate the specific user detail query and the users list query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

// Hook to delete a user
export const useDeleteUser = (options?: UseMutationOptions<DeleteUserResponse, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<DeleteUserResponse, Error, string>({
    mutationFn: apiClient.deleteUser, // The mutation function takes the id (string)
    onSuccess: (data, id, context) => {
      // Invalidate the specific user detail query and the users list query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Optionally remove the user from the cache immediately
      // queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
}; 