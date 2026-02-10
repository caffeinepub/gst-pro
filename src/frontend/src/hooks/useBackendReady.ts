import { useActor } from './useActor';

/**
 * Hook to check if the backend actor is ready for mutations.
 * Returns a boolean indicating readiness and a helper message for UI display.
 */
export function useBackendReady() {
  const { actor, isFetching } = useActor();

  const isReady = !!actor && !isFetching;
  const message = isFetching 
    ? 'Connecting to backend, please wait...' 
    : !actor 
    ? 'Backend connection not available' 
    : '';

  return {
    isReady,
    isConnecting: isFetching,
    message,
  };
}
