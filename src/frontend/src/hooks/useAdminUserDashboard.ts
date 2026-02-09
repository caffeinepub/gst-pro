import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { InvoiceKPIs, UserRecord } from '../backend';
import { useListUsers } from './useAdminUsers';

// Get user invoice KPIs (admin only)
export function useGetUserInvoiceKPIs(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<InvoiceKPIs>({
    queryKey: ['adminUserInvoiceKPIs', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminGetUserInvoiceKPIs(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return false;
      }
      if (error instanceof Error && error.message.includes('User not found')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Get user details from the users list (admin only)
export function useGetUserDetails(userId: string) {
  const { data: users, isLoading, error } = useListUsers();

  return {
    data: users?.find((user) => user.id === userId) || null,
    isLoading,
    error,
  };
}
