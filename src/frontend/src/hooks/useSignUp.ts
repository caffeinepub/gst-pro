import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SignUpRequest, SignUpResponse } from '../backend';

/**
 * Hook for signing up new users with email, password, and mobile number.
 * This creates application-access credentials (does not require Internet Identity authentication).
 */
export function useSignUp() {
  const { actor } = useActor();

  return useMutation<SignUpResponse, Error, SignUpRequest>({
    mutationFn: async (request: SignUpRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.signUp(request);
    },
  });
}
