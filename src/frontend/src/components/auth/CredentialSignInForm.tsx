import { useState } from 'react';
import { useCredentialSignIn } from '../../hooks/useCredentialSignIn';
import { getUserFacingError } from '../../utils/userFacingError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CredentialSignInFormProps {
  onSuccess?: () => void;
}

export default function CredentialSignInForm({ onSuccess }: CredentialSignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const credentialSignInMutation = useCredentialSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation
    if (!email.trim()) {
      setValidationError('User ID (email) is required');
      return;
    }
    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }

    try {
      const result = await credentialSignInMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      if (result.success) {
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        // The AuthGate will automatically re-render with authenticated state
      }
    } catch (error) {
      // Error is handled by the mutation error state
      console.error('Credential sign-in error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {credentialSignInMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {getUserFacingError(credentialSignInMutation.error)}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="credential-email">User ID (Email)</Label>
        <Input
          id="credential-email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={credentialSignInMutation.isPending}
          required
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="credential-password">Password</Label>
        <Input
          id="credential-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={credentialSignInMutation.isPending}
          required
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={credentialSignInMutation.isPending}
      >
        {credentialSignInMutation.isPending ? (
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
