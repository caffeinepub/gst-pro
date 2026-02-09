import { useParams } from '@tanstack/react-router';
import AdminOnlyGate from '../components/admin/AdminOnlyGate';
import AdminPortalLayout from '../components/admin/AdminPortalLayout';
import { useGetUserInvoiceKPIs, useGetUserDetails } from '../hooks/useAdminUserDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserFacingError } from '../utils/userFacingError';
import { FileText, CheckCircle, FileEdit, AlertCircle, User } from 'lucide-react';

export default function AdminUserDashboardPage() {
  const { userId } = useParams({ from: '/admin-layout/admin/users/$userId/dashboard' });
  const { data: userDetails, isLoading: userLoading, error: userError } = useGetUserDetails(userId);
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useGetUserInvoiceKPIs(userId);

  return (
    <AdminOnlyGate loadingMessage="Loading user dashboard...">
      <AdminPortalLayout title="User Dashboard">
        {/* User Info Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Viewing dashboard for user: {userId}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : userError ? (
              <Alert variant="destructive">
                <AlertDescription>{getUserFacingError(userError)}</AlertDescription>
              </Alert>
            ) : userDetails ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {userDetails.email}
                </div>
                <div>
                  <span className="font-medium">Mobile:</span> {userDetails.mobileNumber}
                </div>
                <div>
                  <span className="font-medium">Role:</span>{' '}
                  {userDetails.role === 'superAdmin'
                    ? 'Super Admin'
                    : userDetails.role === 'auditor'
                      ? 'Auditor'
                      : 'Standard'}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Check if user has signed in */}
        {userDetails && !userDetails.lastSignIn ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Sign-In Data</AlertTitle>
            <AlertDescription>
              This user has not signed in to the application yet. Dashboard data will be available
              after their first sign-in.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {/* Total Invoices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {kpisLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : kpisError ? (
                    <p className="text-sm text-destructive">{getUserFacingError(kpisError)}</p>
                  ) : (
                    <div className="text-2xl font-bold">{kpis?.totalInvoices.toString() || '0'}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">All invoices created</p>
                </CardContent>
              </Card>

              {/* Draft Invoices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
                  <FileEdit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {kpisLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : kpisError ? (
                    <p className="text-sm text-destructive">{getUserFacingError(kpisError)}</p>
                  ) : (
                    <div className="text-2xl font-bold">{kpis?.draftInvoices.toString() || '0'}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Pending finalization</p>
                </CardContent>
              </Card>

              {/* Finalized Invoices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Finalized Invoices</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {kpisLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : kpisError ? (
                    <p className="text-sm text-destructive">{getUserFacingError(kpisError)}</p>
                  ) : (
                    <div className="text-2xl font-bold">
                      {kpis?.finalizedInvoices.toString() || '0'}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Completed invoices</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Information</CardTitle>
                <CardDescription>
                  This is a read-only view of the user's dashboard data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Read-Only View</AlertTitle>
                  <AlertDescription>
                    You are viewing this user's dashboard in admin mode. This is a read-only view
                    showing key performance indicators. Full invoice, customer, and item management
                    features for this user may be added in future updates.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </>
        )}
      </AdminPortalLayout>
    </AdminOnlyGate>
  );
}
