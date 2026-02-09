import { type ReactNode } from 'react';

interface AppAccessGateProps {
  children: ReactNode;
}

/**
 * AppAccessGate - Disabled for Version 9 compatibility
 * This component is now a no-op wrapper that always renders children.
 * Access control is handled solely by Internet Identity authentication.
 */
export default function AppAccessGate({ children }: AppAccessGateProps) {
  // Version 9: No additional access gate, render children immediately
  return <>{children}</>;
}
