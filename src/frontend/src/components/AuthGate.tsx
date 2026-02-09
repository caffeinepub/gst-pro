import { type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoading = loginStatus === 'logging-in' || loginStatus === 'initializing';

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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
      <div className="flex min-h-[60vh] items-center justify-center px-4">
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
              Professional GST billing and invoice management. Sign in to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={login} className="w-full gap-2" size="lg">
              <LogIn className="h-5 w-5" />
              Sign In
            </Button>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>Secure authentication powered by Internet Identity</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
