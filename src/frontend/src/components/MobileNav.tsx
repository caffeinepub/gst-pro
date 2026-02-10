import { Link, useLocation } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, Users, Package, FileText, FileCheck, Settings, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/items', label: 'Items', icon: Package },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/gst-filing-status', label: 'GST Status', icon: FileCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleEWayBillClick = () => {
    window.open('https://ewaybillgst.gov.in/Login.aspx', '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleEWayBillClick}
          >
            <ExternalLink className="h-4 w-4" />
            E-Way Bill
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
