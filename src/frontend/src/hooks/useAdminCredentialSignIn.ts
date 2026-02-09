import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CredentialResponse } from '../backend';

interface AdminCredentialSignInParams {
  userId: string;
  password: string;
}

/**
 * Admin-only credential sign-in hook that authenticates directly with the backend
 * without triggering Internet Identity login. Uses the current actor (anonymous or authenticated).
 */
export function useAdminCredentialSignIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<CredentialResponse, Error, AdminCredentialSignInParams>({
    mutationFn: async ({ userId, password }) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please refresh the page.');
      }

      // Call backend credential authentication directly
      const response = await actor.authenticateApplicationCredentials(userId, password);

      // Check response and throw error if unsuccessful
      if (!response.success) {
        throw new Error(response.message || 'Invalid admin credentials');
      }

      return response;
    },
    onSuccess: (response) => {
      // Invalidate admin status query to refresh
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      
      console.log('Admin credential authentication successful:', response.role);
    },
    onError: (error) => {
      console.error('Admin credential sign-in failed:', error);
    },
  });
}
