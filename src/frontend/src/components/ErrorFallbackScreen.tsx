import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, RefreshCw } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ErrorFallbackScreenProps {
  error?: Error | null;
  errorMessage?: string;
}

export default function ErrorFallbackScreen({ error, errorMessage }: ErrorFallbackScreenProps) {
  const { login, identity } = useInternetIdentity();

  // Log error details to console for debugging
  if (error) {
    console.error('Application Error:', error);
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleSignIn = async () => {
    try {
      await login();
      // After successful login, reload to ensure clean state
      window.location.reload();
    } catch (err) {
      console.error('Sign in error:', err);
      // If sign-in fails, still try to reload
      window.location.reload();
    }
  };

  const isAuthenticated = !!identity;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            {errorMessage || 'An unexpected error occurred. Please try reloading the page or signing in again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleReload} variant="default" className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
          {!isAuthenticated && (
            <Button onClick={handleSignIn} variant="outline" className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
