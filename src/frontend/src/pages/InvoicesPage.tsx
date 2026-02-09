import { useGetInvoices, useGetCustomers } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText, Eye } from 'lucide-react';
import InvoiceStatusBadge from '../components/invoices/InvoiceStatusBadge';
import { formatInvoiceNumber } from '../utils/invoiceNumbering';
import { useGetBusinessProfile } from '../hooks/useQueries';

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useGetInvoices();
  const { data: customers = [] } = useGetCustomers();
  const { data: businessProfile } = useGetBusinessProfile();
  const navigate = useNavigate();

  const getCustomerName = (customerId: bigint) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown';
  };

  const sortedInvoices = [...invoices].sort((a, b) => Number(b.id - a.id));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices</p>
          </div>
          <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first invoice to get started
            </p>
            <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices</p>
        </div>
        <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvoices.map((invoice) => (
              <TableRow key={invoice.id.toString()}>
                <TableCell className="font-medium">
                  {formatInvoiceNumber(invoice.id, businessProfile)}
                </TableCell>
                <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate({ to: '/invoices/$invoiceId', params: { invoiceId: invoice.id.toString() } })
                    }
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
