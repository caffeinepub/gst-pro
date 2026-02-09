import { type ReactNode, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSafeInternetIdentityLogin } from '../hooks/useSafeInternetIdentityLogin';
import { useRecordInternetIdentitySignIn } from '../hooks/useRecordInternetIdentitySignIn';
import { getUserFacingError } from '../utils/userFacingError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Loader2, KeyRound, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import SignUpDialog from './auth/SignUpDialog';
import CredentialSignInForm from './auth/CredentialSignInForm';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, loginStatus } = useInternetIdentity();
  const { safeLogin, isLoggingIn } = useSafeInternetIdentityLogin();
  const { recordSignIn } = useRecordInternetIdentitySignIn();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoading = loginStatus === 'initializing';

  const handleInternetIdentitySignIn = async () => {
    setLoginError(null);
    try {
      await safeLogin();
      // Record sign-in event after successful login (non-blocking)
      recordSignIn().catch(() => {
        // Silently fail - already logged in console by the hook
      });
    } catch (error) {
      const errorMessage = getUserFacingError(error);
      setLoginError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleAdminPanelNavigation = () => {
    // Navigate directly to /admin without triggering Internet Identity login
    navigate({ to: '/admin' });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <img
              src="/assets/generated/gst-pro-icon.dim_256x256.png"
              alt="GST Pro"
              className="h-16 w-16 animate-pulse"
            />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src="/assets/generated/gst-pro-icon.dim_256x256.png"
                  alt="GST Pro"
                  className="h-20 w-20"
                />
              </div>
              <CardTitle className="text-2xl">Welcome to GST Pro</CardTitle>
              <CardDescription>
                Choose your sign-in method to access your GST billing and invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="internet-identity" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="internet-identity">
                    <LogIn className="mr-2 h-4 w-4" />
                    Internet Identity
                  </TabsTrigger>
                  <TabsTrigger value="credentials">
                    <KeyRound className="mr-2 h-4 w-4" />
                    User ID & Password
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="internet-identity" className="space-y-4 mt-4">
                  <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Internet Identity</p>
                    <p>
                      Secure, device-based authentication using your Internet Identity. 
                      No passwords to remember.
                    </p>
                  </div>

                  {loginError && (
                    <Alert variant="destructive">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleInternetIdentitySignIn}
                    variant="default"
                    className="w-full gap-2"
                    size="lg"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Sign In with Internet Identity
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleAdminPanelNavigation}
                    variant="outline"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Shield className="h-5 w-5" />
                    Admin Panel
                  </Button>

                  <div className="text-center">
                    <Button
                      onClick={() => setShowSignUpDialog(true)}
                      variant="link"
                      className="text-sm"
                      disabled={isLoggingIn}
                    >
                      Don't have an account? Sign Up
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-4 mt-4">
                  <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">User ID & Password</p>
                    <p>
                      Sign in with your email and password. Authentication is handled automatically.
                    </p>
                  </div>

                  <CredentialSignInForm />

                  <div className="text-center">
                    <Button
                      onClick={() => setShowSignUpDialog(true)}
                      variant="link"
                      className="text-sm"
                    >
                      Don't have an account? Sign Up
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <SignUpDialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog} />
      </>
    );
  }

  // After authentication, render children directly
  return <>{children}</>;
}
