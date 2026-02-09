import { ReactNode } from 'react';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminOnlyGateProps {
  children: ReactNode;
  loadingMessage?: string;
}

export default function AdminOnlyGate({ children, loadingMessage }: AdminOnlyGateProps) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Checking Access</CardTitle>
            <CardDescription>
              {loadingMessage || 'Verifying your admin permissions...'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Not admin - show unauthorized message
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Admin Access Required</AlertTitle>
              <AlertDescription>
                This page is restricted to administrators only. Please contact your system
                administrator if you believe you should have access.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin - render children
  return <>{children}</>;
}
