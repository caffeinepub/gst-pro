import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface AppAccessLoginFormProps {
  onSuccess: () => void;
}

/**
 * AppAccessLoginForm - Disabled for Version 9 compatibility
 * This component is maintained for compatibility but is no longer used
 * in the main authentication flow. Access is controlled by Internet Identity only.
 */
export default function AppAccessLoginForm({ onSuccess }: AppAccessLoginFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Access</CardTitle>
          <CardDescription>
            This feature is not available in Version 9. Please use Internet Identity to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Access is controlled by Internet Identity authentication only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
