import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListAllUsers, useDeleteUser } from '../../hooks/useAdminUsers';
import { getUserFacingError } from '../../utils/userFacingError';
import { formatAdminTime, formatAdminDate } from '../../utils/adminTimeFormat';
import type { UnifiedUserInfo } from '../../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Trash2, Users, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import SetAccessUntilDialog from './SetAccessUntilDialog';

export default function UsersTable() {
  const { data: users, isLoading, error } = useListAllUsers();
  const deleteUserMutation = useDeleteUser();
  const navigate = useNavigate();

  const [userToDelete, setUserToDelete] = useState<UnifiedUserInfo | null>(null);
  const [userToSetAccess, setUserToSetAccess] = useState<UnifiedUserInfo | null>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Only credential users can be deleted
    if (userToDelete.userType !== 'credential') {
      toast.error('Cannot remove Principal-only users');
      setUserToDelete(null);
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userToDelete.identifier);
      toast.success('User removed successfully');
      setUserToDelete(null);
    } catch (err) {
      const errorMessage = getUserFacingError(err);
      toast.error(errorMessage);
    }
  };

  const handleViewDashboard = (userId: string) => {
    navigate({ to: '/admin/users/$userId/dashboard', params: { userId } });
  };

  const getRoleBadgeVariant = (role: string | undefined) => {
    if (!role) return 'outline';
    switch (role) {
      case 'superAdmin':
        return 'destructive';
      case 'auditor':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return 'N/A';
    switch (role) {
      case 'superAdmin':
        return 'Super Admin';
      case 'auditor':
        return 'Auditor';
      case 'standard':
        return 'Standard';
      default:
        return role;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getUserFacingError(error)}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No users found. Add your first user to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID / Principal</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Access Until</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isCredentialUser = user.userType === 'credential';
              const isDeleted = user.deleted === true;
              const canViewDashboard = isCredentialUser;
              const canSetAccess = isCredentialUser;
              const canDelete = isCredentialUser;

              return (
                <TableRow key={user.identifier}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="break-all">
                        {isCredentialUser ? user.email || user.identifier : user.identifier}
                      </span>
                      {isDeleted && (
                        <Badge variant="outline" className="w-fit text-xs">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isCredentialUser ? 'default' : 'secondary'}>
                      {isCredentialUser ? 'Credential' : 'Principal Only'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.accessExpiry ? (
                      <span
                        className={
                          user.accessExpiry && Number(user.accessExpiry) < Date.now() * 1_000_000
                            ? 'text-destructive font-medium'
                            : ''
                        }
                      >
                        {formatAdminDate(user.accessExpiry)}
                      </span>
                    ) : isCredentialUser ? (
                      <span className="text-muted-foreground">Unlimited</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatAdminTime(user.lastUsed)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatAdminTime(user.lastSignIn)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canViewDashboard && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDashboard(user.identifier)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View Dashboard
                        </Button>
                      )}
                      {canSetAccess && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserToSetAccess(user);
                            setShowAccessDialog(true);
                          }}
                          className="gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Set Access
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserToDelete(user)}
                          disabled={deleteUserMutation.isPending}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          {deleteUserMutation.isPending &&
                          deleteUserMutation.variables === user.identifier ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Remove
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              {userToDelete?.email || userToDelete?.identifier}? This will disable their account
              and they will no longer be able to access the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set access until dialog */}
      {userToSetAccess && userToSetAccess.userType === 'credential' && (
        <SetAccessUntilDialog
          user={{
            id: userToSetAccess.identifier,
            email: userToSetAccess.email || userToSetAccess.identifier,
            accessExpiry: userToSetAccess.accessExpiry,
          }}
          open={showAccessDialog}
          onOpenChange={(open) => {
            setShowAccessDialog(open);
            if (!open) setUserToSetAccess(null);
          }}
        />
      )}
    </>
  );
}
