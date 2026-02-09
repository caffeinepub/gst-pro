import { useState } from 'react';
import { useAdminCredentialSignIn } from '../../hooks/useAdminCredentialSignIn';
import { getUserFacingError } from '../../utils/userFacingError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface AdminCredentialLoginFormProps {
  onSuccess?: () => void;
}

/**
 * Admin-only credential login form that does NOT trigger Internet Identity.
 * Authenticates directly with User ID and Password against the backend.
 */
export default function AdminCredentialLoginForm({ onSuccess }: AdminCredentialLoginFormProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const adminSignInMutation = useAdminCredentialSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation
    if (!userId.trim()) {
      setValidationError('User ID is required');
      return;
    }
    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }

    try {
      const result = await adminSignInMutation.mutateAsync({
        userId: userId.trim(),
        password,
      });

      if (result.success) {
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      // Error is handled by the mutation error state
      console.error('Admin credential sign-in error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {adminSignInMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {getUserFacingError(adminSignInMutation.error)}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="admin-user-id">User ID</Label>
        <Input
          id="admin-user-id"
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={adminSignInMutation.isPending}
          required
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={adminSignInMutation.isPending}
          required
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={adminSignInMutation.isPending}
      >
        {adminSignInMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
}
