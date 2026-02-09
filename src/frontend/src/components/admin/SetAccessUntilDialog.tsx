import { useState, useEffect } from 'react';
import { useSetAccessExpiry } from '../../hooks/useAdminUsers';
import { getUserFacingError } from '../../utils/userFacingError';
import { dateToBackendTime, formatAdminDate } from '../../utils/adminTimeFormat';
import type { Time } from '../../backend';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserForAccessDialog {
  id: string;
  email: string;
  accessExpiry?: Time;
}

interface SetAccessUntilDialogProps {
  user: UserForAccessDialog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SetAccessUntilDialog({
  user,
  open,
  onOpenChange,
}: SetAccessUntilDialogProps) {
  const [accessUntil, setAccessUntil] = useState('');
  const [error, setError] = useState('');

  const setAccessExpiryMutation = useSetAccessExpiry();

  // Initialize form with current expiry when dialog opens
  useEffect(() => {
    if (open && user?.accessExpiry) {
      try {
        const milliseconds = Number(user.accessExpiry / BigInt(1_000_000));
        const date = new Date(milliseconds);
        // Format for datetime-local input
        const formatted = date.toISOString().slice(0, 16);
        setAccessUntil(formatted);
      } catch (err) {
        setAccessUntil('');
      }
    } else {
      setAccessUntil('');
    }
    setError('');
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');

    try {
      let expiryTimestamp: Time | null = null;

      if (accessUntil) {
        const date = new Date(accessUntil);
        if (isNaN(date.getTime())) {
          setError('Invalid date/time');
          return;
        }
        expiryTimestamp = dateToBackendTime(date);
      }

      await setAccessExpiryMutation.mutateAsync({
        userId: user.id,
        expiryTimestamp,
      });

      toast.success(
        expiryTimestamp
          ? 'Access expiry updated successfully'
          : 'Access expiry cleared (unlimited access)'
      );
      onOpenChange(false);
    } catch (err) {
      const errorMessage = getUserFacingError(err);
      setError(errorMessage);
    }
  };

  const handleClearExpiry = async () => {
    if (!user) return;
    setError('');

    try {
      await setAccessExpiryMutation.mutateAsync({
        userId: user.id,
        expiryTimestamp: null,
      });

      toast.success('Access expiry cleared (unlimited access)');
      onOpenChange(false);
    } catch (err) {
      const errorMessage = getUserFacingError(err);
      setError(errorMessage);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Access Until</DialogTitle>
            <DialogDescription>
              Set or update the access expiry date for {user.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {user.accessExpiry && (
              <Alert>
                <AlertDescription>
                  Current expiry: {formatAdminDate(user.accessExpiry)}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="accessUntil">Access Until</Label>
              <Input
                id="accessUntil"
                type="datetime-local"
                value={accessUntil}
                onChange={(e) => setAccessUntil(e.target.value)}
                disabled={setAccessExpiryMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to grant unlimited access
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={setAccessExpiryMutation.isPending}
            >
              Cancel
            </Button>
            {user.accessExpiry && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearExpiry}
                disabled={setAccessExpiryMutation.isPending}
              >
                {setAccessExpiryMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Clear Expiry
              </Button>
            )}
            <Button type="submit" disabled={setAccessExpiryMutation.isPending}>
              {setAccessExpiryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
