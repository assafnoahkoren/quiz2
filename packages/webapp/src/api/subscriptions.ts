import { useMutation, useQueryClient, UseMutationOptions, useQuery } from '@tanstack/react-query';
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto } from '../types/subscription';
import apiClient from './client';
import { userKeys } from './users';

const SUBSCRIPTIONS_ENDPOINT = 'api/subscriptions'; // Path relative to base URL in apiClient

// API client functions
export const createSubscription = async (subscriptionData: CreateSubscriptionDto): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>(SUBSCRIPTIONS_ENDPOINT, subscriptionData);
  return response.data;
};

export const updateSubscription = async ({ id, ...updateData }: { id: string } & UpdateSubscriptionDto): Promise<Subscription> => {
  if (!id) throw new Error('Subscription ID is required');
  const response = await apiClient.patch<Subscription>(`${SUBSCRIPTIONS_ENDPOINT}/${id}`, updateData);
  return response.data;
};

export const getSubscriptionById = async (id: string): Promise<Subscription> => {
  if (!id) throw new Error('Subscription ID is required');
  const response = await apiClient.get<Subscription>(`${SUBSCRIPTIONS_ENDPOINT}/${id}`);
  return response.data;
};

export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  if (!userId) throw new Error('User ID is required');
  const response = await apiClient.get<Subscription[]>(`${SUBSCRIPTIONS_ENDPOINT}/user/${userId}`);
  return response.data;
};

// Query Keys Factory
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
  list: (filters: string) => [...subscriptionKeys.lists(), { filters }] as const,
  details: () => [...subscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
  userSubscriptions: (userId: string) => [...subscriptionKeys.lists(), { userId }] as const,
};

// Hook to create a subscription
export const useCreateSubscription = (options?: UseMutationOptions<Subscription, Error, CreateSubscriptionDto>) => {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, CreateSubscriptionDto>({
    mutationFn: createSubscription,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      // Invalidate users queries as they might be affected by subscription changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // If we know the user ID, we can invalidate that specific list
      if ('userId' in variables) {
        queryClient.invalidateQueries({ 
          queryKey: subscriptionKeys.userSubscriptions(variables.userId as string) 
        });
      }
      options?.onSuccess?.(data, variables, context);
    },
  });
};

// Hook to update a subscription
export const useUpdateSubscription = (options?: UseMutationOptions<Subscription, Error, { id: string } & UpdateSubscriptionDto>) => {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, { id: string } & UpdateSubscriptionDto>({
    mutationFn: updateSubscription,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
      // Invalidate users queries as they might be affected by subscription changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // If we know the user ID, we can invalidate that specific list
      if ('userId' in variables) {
        queryClient.invalidateQueries({ 
          queryKey: subscriptionKeys.userSubscriptions(variables.userId as string) 
        });
        // Also invalidate the specific user detail
        queryClient.invalidateQueries({ 
          queryKey: userKeys.detail(variables.userId as string) 
        });
      }
      options?.onSuccess?.(data, variables, context);
    },
  });
};

// Hook to get a subscription by ID
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => getSubscriptionById(id),
    enabled: !!id,
  });
};

// Hook to get user subscriptions
export const useUserSubscriptions = (userId: string) => {
  return useQuery({
    queryKey: subscriptionKeys.userSubscriptions(userId),
    queryFn: () => getUserSubscriptions(userId),
    enabled: !!userId,
  });
}; 