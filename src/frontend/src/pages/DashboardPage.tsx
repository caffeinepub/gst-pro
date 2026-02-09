import { useGetInvoices } from '../hooks/useQueries';
import { useGetBusinessProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Package, TrendingUp, Plus } from 'lucide-react';
import { InvoiceStatus } from '../backend';

export default function DashboardPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useGetInvoices();
  const { data: businessProfile } = useGetBusinessProfile();
  const navigate = useNavigate();

  const draftInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.draft).length;
  const finalizedInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.finalized).length;

  const needsSetup = !businessProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to GST Pro</p>
        </div>
        <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {needsSetup && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">Setup Required</CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Complete your business profile to start creating invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/settings' })} variant="default">
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesLoading ? '...' : invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesLoading ? '...' : draftInvoices}</div>
            <p className="text-xs text-muted-foreground">Pending finalization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalized</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesLoading ? '...' : finalizedInvoices}</div>
            <p className="text-xs text-muted-foreground">Completed invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate({ to: '/customers' })}
            >
              <Users className="mr-2 h-4 w-4" />
              Customers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate({ to: '/items' })}
            >
              <Package className="mr-2 h-4 w-4" />
              Items
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to set up your billing system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Configure Business Profile</h3>
              <p className="text-sm text-muted-foreground">
                Add your business details, GSTIN, and invoice settings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add Customers</h3>
              <p className="text-sm text-muted-foreground">
                Create customer records with billing addresses and GSTIN
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Add Items/Services</h3>
              <p className="text-sm text-muted-foreground">
                Set up your product catalog with prices and GST rates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Create Invoices</h3>
              <p className="text-sm text-muted-foreground">
                Generate GST-compliant invoices with automatic tax calculations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
