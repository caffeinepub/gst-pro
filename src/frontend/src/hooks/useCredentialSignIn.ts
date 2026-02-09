import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useSafeInternetIdentityLogin } from './useSafeInternetIdentityLogin';
import type { CredentialResponse } from '../backend';

interface CredentialSignInParams {
  email: string;
  password: string;
}

export function useCredentialSignIn() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { safeLogin } = useSafeInternetIdentityLogin();
  const queryClient = useQueryClient();

  return useMutation<CredentialResponse, Error, CredentialSignInParams>({
    mutationFn: async ({ email, password }) => {
      // Step 1: Ensure Internet Identity session exists
      if (!identity) {
        // Trigger Internet Identity login automatically
        await safeLogin();
        
        // Wait for actor to be recreated with authenticated identity
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Step 2: Get the authenticated actor (retry a few times if needed)
      let currentActor = actor;
      let retries = 0;
      while (!currentActor && retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 500));
        currentActor = actor;
        retries++;
      }

      if (!currentActor) {
        throw new Error('Authentication failed. Please try again.');
      }

      // Step 3: Call backend credential authentication
      const response = await currentActor.authenticateApplicationCredentials(email, password);

      // Step 4: Check response and throw error if unsuccessful
      if (!response.success) {
        throw new Error(response.message || 'Invalid credentials');
      }

      return response;
    },
    onSuccess: (response) => {
      // Invalidate all queries to refresh with new authenticated state
      queryClient.invalidateQueries();
      
      console.log('Credential authentication successful:', response.role);
    },
    onError: (error) => {
      console.error('Credential sign-in failed:', error);
    },
  });
}
