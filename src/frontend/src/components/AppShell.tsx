import { type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard, Users, Package, FileText, Settings } from 'lucide-react';
import LoginButton from './LoginButton';
import AuthGate from './AuthGate';
import ProfileSetupDialog from './ProfileSetupDialog';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/items', label: 'Items', icon: Package },
  { path: '/invoices', label: 'Invoices', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }: AppShellProps) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            {isAuthenticated && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-full flex-col">
                    <div className="border-b p-6">
                      <img
                        src="/assets/generated/gst-pro-logo.dim_1200x300.png"
                        alt="GST Pro"
                        className="h-8 w-auto"
                      />
                    </div>
                    <nav className="flex-1 space-y-1 p-4">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive(item.path)
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/gst-pro-icon.dim_256x256.png"
                alt="GST Pro Icon"
                className="h-8 w-8"
              />
              <img
                src="/assets/generated/gst-pro-logo.dim_1200x300.png"
                alt="GST Pro"
                className="hidden h-7 w-auto sm:block"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex md:items-center md:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Login Button */}
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <AuthGate>
        <ProfileSetupDialog />
        <main className="container py-6 px-4">{children}</main>
      </AuthGate>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-6 mt-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
