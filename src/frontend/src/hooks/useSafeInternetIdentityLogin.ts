import { useCallback, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Safe wrapper around Internet Identity login that handles stale authenticated state
 * by automatically clearing and retrying.
 */
export function useSafeInternetIdentityLogin() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [isRetrying, setIsRetrying] = useState(false);

  const safeLogin = useCallback(async (): Promise<void> => {
    try {
      setIsRetrying(false);
      await login();
    } catch (error: any) {
      // Handle stale authenticated state
      if (error?.message === 'User is already authenticated') {
        setIsRetrying(true);
        try {
          await clear();
          // Wait a bit for cleanup
          await new Promise(resolve => setTimeout(resolve, 300));
          await login();
        } catch (retryError) {
          setIsRetrying(false);
          throw retryError;
        } finally {
          setIsRetrying(false);
        }
      } else {
        throw error;
      }
    }
  }, [login, clear]);

  return {
    safeLogin,
    loginStatus,
    identity,
    isLoggingIn: loginStatus === 'logging-in' || isRetrying,
    isRetrying,
  };
}
