import { useState } from 'react';
import { useSignUp } from '../../hooks/useSignUp';
import { getUserFacingError } from '../../utils/userFacingError';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignUpDialog({ open, onOpenChange }: SignUpDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const signUpMutation = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (!mobileNumber.trim()) {
      setValidationError('Mobile number is required');
      return;
    }

    try {
      await signUpMutation.mutateAsync({
        email: email.trim(),
        password,
        mobileNumber: mobileNumber.trim(),
      });

      // Show success message
      setShowSuccess(true);

      // Reset form
      setEmail('');
      setPassword('');
      setMobileNumber('');

      // Close dialog after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 2500);
    } catch (error) {
      // Error is handled by the mutation error state
      console.error('Sign up error:', error);
    }
  };

  const handleClose = () => {
    if (!signUpMutation.isPending) {
      setEmail('');
      setPassword('');
      setMobileNumber('');
      setValidationError('');
      setShowSuccess(false);
      signUpMutation.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Create a new account to access GST Pro. After signing up, you can sign in using either Internet Identity or your User ID & Password.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">Account Created!</h3>
            <p className="text-sm text-muted-foreground">
              You can now sign in using Internet Identity or your User ID & Password from the sign-in screen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {validationError && (
                <Alert variant="destructive">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {signUpMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getUserFacingError(signUpMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email (User ID)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={signUpMutation.isPending}
                  required
                  autoComplete="username"
                />
                <p className="text-xs text-muted-foreground">
                  This will be your User ID for signing in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={signUpMutation.isPending}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+91 1234567890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={signUpMutation.isPending}
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={signUpMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={signUpMutation.isPending}>
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
