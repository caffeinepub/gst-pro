import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSafeInternetIdentityLogin } from '../hooks/useSafeInternetIdentityLogin';
import { useRecordInternetIdentitySignIn } from '../hooks/useRecordInternetIdentitySignIn';
import { getUserFacingError } from '../utils/userFacingError';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { clearAppAccessGranted } from '../utils/appAccessStorage';
import { toast } from 'sonner';

export default function LoginButton() {
  const { clear, identity } = useInternetIdentity();
  const { safeLogin, isLoggingIn } = useSafeInternetIdentityLogin();
  const { recordSignIn } = useRecordInternetIdentitySignIn();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      setIsLoggingOut(true);
      try {
        // Clear app access state before logging out
        const principalId = identity?.getPrincipal().toString();
        if (principalId) {
          clearAppAccessGranted(principalId);
        }

        // Clear all cached queries
        queryClient.clear();

        // Logout
        await clear();
      } catch (error) {
        const errorMessage = getUserFacingError(error);
        toast.error(errorMessage);
      } finally {
        setIsLoggingOut(false);
      }
    } else {
      try {
        await safeLogin();
        // Record sign-in event after successful login (non-blocking)
        recordSignIn().catch(() => {
          // Silently fail - already logged in console by the hook
        });
      } catch (error) {
        const errorMessage = getUserFacingError(error);
        toast.error(errorMessage);
      }
    }
  };

  if (isLoggingIn || isLoggingOut) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isLoggingIn ? 'Signing in...' : 'Signing out...'}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      variant={isAuthenticated ? 'ghost' : 'default'}
      size="sm"
      className="gap-2"
    >
      {isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Sign Out
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  );
}
