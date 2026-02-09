import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Hook to check if the current authenticated user is an admin.
 * Returns loading/error states suitable for gating admin UI.
 */
export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
