import { ReactNode } from 'react';
import AuthGate from './AuthGate';
import ProfileSetupDialog from './ProfileSetupDialog';

interface PrintLayoutProps {
  children: ReactNode;
}

/**
 * Minimal layout for print views that requires authentication
 * but does not include the main app shell (header, nav, footer).
 */
export default function PrintLayout({ children }: PrintLayoutProps) {
  return (
    <AuthGate>
      <ProfileSetupDialog />
      {children}
    </AuthGate>
  );
}
