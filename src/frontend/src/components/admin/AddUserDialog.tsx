import { useState } from 'react';
import { useCreateUser } from '../../hooks/useAdminUsers';
import { getUserFacingError } from '../../utils/userFacingError';
import { dateToBackendTime } from '../../utils/adminTimeFormat';
import { SystemRole } from '../../backend';
import type { Time } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<SystemRole>(SystemRole.standard);
  const [accessUntil, setAccessUntil] = useState('');
  const [error, setError] = useState('');

  const createUserMutation = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    try {
      // Convert access until date to backend Time if provided
      let accessExpiry: Time | undefined = undefined;
      if (accessUntil) {
        const date = new Date(accessUntil);
        if (!isNaN(date.getTime())) {
          accessExpiry = dateToBackendTime(date);
        }
      }

      await createUserMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
        mobileNumber: mobileNumber.trim(),
        role,
        accessExpiry,
      });

      toast.success('User created successfully');
      setOpen(false);
      // Reset form
      setEmail('');
      setPassword('');
      setMobileNumber('');
      setRole(SystemRole.standard);
      setAccessUntil('');
    } catch (err) {
      const errorMessage = getUserFacingError(err);
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with credentials and access settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">User ID / Email *</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={createUserMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={createUserMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                disabled={createUserMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as SystemRole)}
                disabled={createUserMutation.isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SystemRole.standard}>Standard User</SelectItem>
                  <SelectItem value={SystemRole.auditor}>Auditor</SelectItem>
                  <SelectItem value={SystemRole.superAdmin}>Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessUntil">Access Until (Optional)</Label>
              <Input
                id="accessUntil"
                type="datetime-local"
                value={accessUntil}
                onChange={(e) => setAccessUntil(e.target.value)}
                disabled={createUserMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited access
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
