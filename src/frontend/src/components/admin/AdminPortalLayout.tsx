import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AdminPortalLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
}

export default function AdminPortalLayout({
  children,
  title = 'Admin Portal',
  showBackButton = true,
}: AdminPortalLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {showBackButton && (
              <Button
                onClick={() => navigate({ to: '/admin' })}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Panel
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-6xl">{children}</div>
    </div>
  );
}
