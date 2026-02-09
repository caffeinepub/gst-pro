import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRecord, CreateUserRequest, Time, UnifiedUserInfo } from '../backend';

// List all users (admin only) - legacy credential-only list
export function useListUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRecord[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// List all users including Principal-only users (admin only)
export function useListAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UnifiedUserInfo[]>({
    queryKey: ['adminAllUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Create a new user (admin only)
export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
    },
  });
}

// Delete a user (admin only)
export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
    },
  });
}

// Set access expiry for a user (admin only)
export function useSetAccessExpiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; expiryTimestamp: Time | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAccessExpiry(params.userId, params.expiryTimestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
    },
  });
}
