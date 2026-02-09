import { useNavigate, useParams } from '@tanstack/react-router';
import {
  useGetInvoice,
  useGetCustomer,
  useGetItems,
  useGetBusinessProfile,
  useFinalizeInvoice,
  useDeleteInvoice,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Printer, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import InvoiceStatusBadge from '../components/invoices/InvoiceStatusBadge';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';
import { formatInvoiceNumber } from '../utils/invoiceNumbering';
import { canDeleteInvoice, getDeleteErrorMessage } from '../utils/invoiceRules';
import { InvoiceStatus } from '../backend';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const invoiceId = params.invoiceId ? BigInt(params.invoiceId) : null;

  const { data: invoice, isLoading } = useGetInvoice(invoiceId);
  const { data: customer } = useGetCustomer(invoice?.customerId || null);
  const { data: items = [] } = useGetItems();
  const { data: businessProfile } = useGetBusinessProfile();
  const finalizeInvoice = useFinalizeInvoice();
  const deleteInvoice = useDeleteInvoice();

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer || undefined);
  const isDraft = invoice.status === InvoiceStatus.draft;
  const canDelete = canDeleteInvoice(invoice);

  const handleFinalize = async () => {
    try {
      await finalizeInvoice.mutateAsync(invoice.id);
      toast.success('Invoice finalized successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to finalize invoice');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      toast.success('Invoice deleted successfully');
      navigate({ to: '/invoices' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invoice');
    }
  };

  const handlePrint = () => {
    navigate({ to: '/invoices/$invoiceId/print', params: { invoiceId: invoice.id.toString() } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Invoice {formatInvoiceNumber(invoice.id, businessProfile)}
            </h1>
            <p className="text-muted-foreground">View invoice details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate({
                    to: '/invoices/$invoiceId/edit',
                    params: { invoiceId: invoice.id.toString() },
                  })
                }
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleFinalize}
                disabled={finalizeInvoice.isPending}
                className="gap-2"
              >
                {finalizeInvoice.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Finalize
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                disabled={!canDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  {canDelete
                    ? 'This action cannot be undone. This will permanently delete the invoice.'
                    : getDeleteErrorMessage(invoice)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {canDelete && (
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{customer?.name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Billing Address</div>
                <div className="font-medium">{customer?.billingAddress || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">State</div>
                  <div className="font-medium">{customer?.state || 'N/A'}</div>
                </div>
                {customer?.gstin && (
                  <div>
                    <div className="text-sm text-muted-foreground">GSTIN</div>
                    <div className="font-medium">{customer.gstin}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((lineItem, index) => {
                    const item = items.find((i) => i.id === lineItem.itemId);
                    const amount = lineItem.quantity * lineItem.unitPrice;
                    const discount = lineItem.discount || 0;
                    const total = amount - discount;
                    return (
                      <TableRow key={index}>
                        <TableCell>{item?.name || 'Unknown Item'}</TableCell>
                        <TableCell className="text-right">{lineItem.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(lineItem.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(discount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totals.subtotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">{formatCurrency(totals.totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span className="font-medium">{formatCurrency(totals.taxableAmount)}</span>
              </div>
              <div className="border-t pt-3 space-y-2">
                {totals.isInterState ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IGST</span>
                    <span className="font-medium">{formatCurrency(totals.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST</span>
                      <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST</span>
                      <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Grand Total</span>
                  <span className="text-lg font-bold">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                {totals.isInterState ? 'Inter-state' : 'Intra-state'} transaction
              </div>
            </CardContent>
          </Card>

          {businessProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Business Name</div>
                  <div className="font-medium">{businessProfile.businessName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{businessProfile.address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">State</div>
                    <div className="font-medium">{businessProfile.state}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">GSTIN</div>
                    <div className="font-medium">{businessProfile.gstin}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
