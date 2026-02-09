import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Users, UserCog, ArrowLeft, KeyRound } from 'lucide-react';
import AdminCredentialLoginForm from '../components/admin/AdminCredentialLoginForm';
import UsersTable from '../components/admin/UsersTable';
import AddUserDialog from '../components/admin/AddUserDialog';

export default function AdminPanelPage() {
  const { data: isAdmin, isLoading, refetch } = useIsAdmin();
  const navigate = useNavigate();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  // Show admin credential login form for non-admin users (always show form immediately)
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <KeyRound className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
            <CardDescription>
              Please sign in with your admin credentials to access the Admin Panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Admin Credentials</AlertTitle>
              <AlertDescription>
                Enter your User ID and password to authenticate as an administrator.
              </AlertDescription>
            </Alert>

            {isCheckingAdmin || isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">Verifying admin access...</p>
              </div>
            ) : (
              <AdminCredentialLoginForm
                onSuccess={async () => {
                  // After successful credential authentication, re-check admin status
                  setIsCheckingAdmin(true);
                  try {
                    // Wait a moment for backend to process
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Refetch admin status
                    await refetch();
                  } finally {
                    setIsCheckingAdmin(false);
                  }
                }}
              />
            )}

            <Separator />

            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="w-full gap-2"
              disabled={isCheckingAdmin || isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin panel content
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">
                Manage users, access permissions, and view usage statistics
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
          </div>
          <Separator />
        </div>

        {/* Users Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Users & Usage</CardTitle>
                </div>
                <CardDescription>
                  View and manage all users, set access expiry dates, and track application usage
                </CardDescription>
              </div>
              <AddUserDialog />
            </div>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>

        {/* Roles Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <CardTitle>Roles</CardTitle>
            </div>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <UserCog className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Role management interface will be available here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
