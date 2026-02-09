import { Link, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Users, Package, Settings, LayoutDashboard, FileCheck } from 'lucide-react';
import LoginButton from './LoginButton';
import PwaInstallFooterSection from './pwa/PwaInstallFooterSection';
import MobileNav from './MobileNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/items', label: 'Items', icon: Package },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/gst-filing-status', label: 'GST Status', icon: FileCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top safe-area-x">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
              <img
                src="/assets/generated/gst-pro-icon.dim_256x256.png"
                alt="GST Pro"
                className="h-8 w-8 flex-shrink-0"
              />
              <span className="text-xl font-bold">GST Pro</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <MobileNav />
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1 safe-area-x safe-area-bottom">
        <div className="container py-6">{children}</div>
      </main>

      <footer className="border-t bg-muted/50 safe-area-x safe-area-bottom">
        <div className="container py-8 space-y-6">
          <PwaInstallFooterSection />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} GST Pro. All rights reserved.</p>
            <p>
              Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'gst-pro'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline inline-flex items-center gap-1"
              >
                caffeine.ai
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
