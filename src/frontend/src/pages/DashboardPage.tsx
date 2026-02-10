import { useGetInvoices, useGetItems, useGetCustomers } from '../hooks/useQueries';
import { useGetBusinessProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Package, TrendingUp, Plus, ExternalLink, IndianRupee } from 'lucide-react';
import { InvoiceStatus } from '../backend';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';

export default function DashboardPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useGetInvoices();
  const { data: items = [], isLoading: itemsLoading } = useGetItems();
  const { data: customers = [], isLoading: customersLoading } = useGetCustomers();
  const { data: businessProfile, isLoading: profileLoading } = useGetBusinessProfile();
  const navigate = useNavigate();

  const draftInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.draft).length;
  const finalizedInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.finalized).length;

  // Calculate Total GST across all invoices
  const totalGst = invoices.reduce((sum, invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId);
    const totals = calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer);
    return sum + totals.cgst + totals.sgst + totals.igst;
  }, 0);

  const needsSetup = !businessProfile;
  const isLoadingData = invoicesLoading || itemsLoading || customersLoading || profileLoading;

  const handleEWayBillClick = () => {
    window.open('https://ewaybillgst.gov.in/Login.aspx', '_blank', 'noopener,noreferrer');
  };

  const handleKpiClick = (filter?: 'draft' | 'finalized') => {
    if (filter) {
      navigate({ to: '/invoices', search: { status: filter } });
    } else {
      navigate({ to: '/invoices' });
    }
  };

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

      {needsSetup && !profileLoading && (
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
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          onClick={() => handleKpiClick()}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick();
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingData ? '...' : invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          onClick={() => handleKpiClick('draft')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick('draft');
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingData ? '...' : draftInvoices}</div>
            <p className="text-xs text-muted-foreground">Pending finalization</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          onClick={() => handleKpiClick('finalized')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick('finalized');
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalized</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingData ? '...' : finalizedInvoices}</div>
            <p className="text-xs text-muted-foreground">Completed invoices</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          onClick={() => handleKpiClick()}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleKpiClick();
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GST</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingData ? '...' : formatCurrency(totalGst)}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your business data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate({ to: '/customers' })}
            >
              <Users className="h-4 w-4" />
              Manage Customers
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => navigate({ to: '/items' })}
            >
              <Package className="h-4 w-4" />
              Manage Items
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleEWayBillClick}
            >
              <ExternalLink className="h-4 w-4" />
              E-Way Bill Portal
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Set up your GST Pro account</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <span className="pt-0.5">
                  <strong>Configure Business Profile:</strong> Add your business details in Settings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <span className="pt-0.5">
                  <strong>Add Customers:</strong> Create your customer database
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <span className="pt-0.5">
                  <strong>Add Items/Services:</strong> Set up your product catalog
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </span>
                <span className="pt-0.5">
                  <strong>Create Invoices:</strong> Start generating GST-compliant invoices
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
