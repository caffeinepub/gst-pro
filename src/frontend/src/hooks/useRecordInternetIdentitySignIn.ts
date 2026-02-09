import { useActor } from './useActor';

/**
 * Helper hook to record Internet Identity sign-in events.
 * This is a non-blocking operation that logs errors but never prevents app usage.
 */
export function useRecordInternetIdentitySignIn() {
  const { actor } = useActor();

  const recordSignIn = async () => {
    // Wait a short time for actor to be available after login
    let attempts = 0;
    const maxAttempts = 10;
    const delayMs = 200;

    while (!actor && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempts++;
    }

    if (!actor) {
      console.warn('Actor not available for sign-in tracking, skipping');
      return;
    }

    try {
      await actor.recordInternetIdentitySignIn();
    } catch (error) {
      // Log error but don't block user flow
      console.warn('Failed to record Internet Identity sign-in:', error);
    }
  };

  return { recordSignIn };
}
