import { useNavigate, useParams } from '@tanstack/react-router';
import {
  useGetInvoice,
  useGetCustomer,
  useGetItems,
  useGetBusinessProfile,
  useFinalizeInvoice,
  useDeleteInvoice,
  useCancelInvoice,
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
import { ArrowLeft, Edit, Printer, CheckCircle, Trash2, Loader2, XCircle } from 'lucide-react';
import InvoiceStatusBadge from '../components/invoices/InvoiceStatusBadge';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';
import { getDisplayInvoiceNumber } from '../utils/invoiceNumbering';
import { formatInvoiceDate } from '../utils/dateFormat';
import { InvoiceStatus, InvoiceType } from '../backend';
import { toast } from 'sonner';
import { getUserFacingError } from '../utils/userFacingError';

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
  const cancelInvoice = useCancelInvoice();

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer || undefined);
  const isDraft = invoice.status === InvoiceStatus.draft;
  const isCancelled = invoice.status === InvoiceStatus.cancelled;

  const handleFinalize = async () => {
    try {
      await finalizeInvoice.mutateAsync(invoice.id);
      toast.success('Invoice finalized successfully');
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      toast.error(errorMessage);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelInvoice.mutateAsync(invoice.id);
      toast.success('Invoice canceled successfully');
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      toast.success('Invoice deleted successfully');
      navigate({ to: '/invoices' });
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      toast.error(errorMessage);
    }
  };

  const handlePrint = () => {
    navigate({ to: '/invoices/$invoiceId/print', params: { invoiceId: invoice.id.toString() } });
  };

  const invoiceTypeLabel = invoice.invoiceType === InvoiceType.transportation
    ? 'Transportation Invoice'
    : 'Original Invoice';

  // Check if banking details are configured
  const hasBankingDetails = businessProfile?.bankingDetails && (
    businessProfile.bankingDetails.accountName ||
    businessProfile.bankingDetails.accountNumber ||
    businessProfile.bankingDetails.ifscCode ||
    businessProfile.bankingDetails.bankName
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Invoice {getDisplayInvoiceNumber(invoice, businessProfile)}
            </h1>
            <p className="text-muted-foreground">View invoice details</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          {!isCancelled && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Invoice
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the invoice as canceled. This action can be useful for record-keeping purposes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>
                    Yes, Cancel Invoice
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the invoice.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Type</p>
                <p className="font-medium">{invoiceTypeLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{getDisplayInvoiceNumber(invoice, businessProfile)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{formatInvoiceDate(invoice.invoiceDate)}</p>
              </div>
              {invoice.purchaseOrderNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Order Number</p>
                  <p className="font-medium">{invoice.purchaseOrderNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Address</p>
                  <p className="font-medium">{customer.billingAddress}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {customer.gstin && (
                    <div>
                      <p className="text-sm text-muted-foreground">GSTIN</p>
                      <p className="font-medium">{customer.gstin}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{customer.state}</p>
                  </div>
                </div>
                {customer.contactInfo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Info</p>
                    <p className="font-medium">{customer.contactInfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {hasBankingDetails && businessProfile?.bankingDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Banking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {businessProfile.bankingDetails.accountName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-medium">{businessProfile.bankingDetails.accountName}</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {businessProfile.bankingDetails.accountNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{businessProfile.bankingDetails.accountNumber}</p>
                    </div>
                  )}
                  {businessProfile.bankingDetails.ifscCode && (
                    <div>
                      <p className="text-sm text-muted-foreground">IFSC Code</p>
                      <p className="font-medium">{businessProfile.bankingDetails.ifscCode}</p>
                    </div>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {businessProfile.bankingDetails.bankName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{businessProfile.bankingDetails.bankName}</p>
                    </div>
                  )}
                  {businessProfile.bankingDetails.branch && (
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-medium">{businessProfile.bankingDetails.branch}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((lineItem, index) => {
                      const item = items.find((i) => i.id === lineItem.itemId);
                      const lineTotal =
                        lineItem.quantity * lineItem.unitPrice - (lineItem.discount || 0);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item?.name || 'Unknown Item'}</p>
                              {item?.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{lineItem.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(lineItem.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(lineItem.discount || 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(lineTotal)}
                          </TableCell>
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
                    {totals.totalDiscount > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">
                          Total Discount
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(totals.totalDiscount)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">
                        Taxable Amount
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totals.taxableAmount)}
                      </TableCell>
                    </TableRow>
                    {totals.isInterState ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">
                          IGST
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.igst)}</TableCell>
                      </TableRow>
                    ) : (
                      <>
                        <TableRow>
                          <TableCell colSpan={4} className="text-right">
                            CGST
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(totals.cgst)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} className="text-right">
                            SGST
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(totals.sgst)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold text-lg">
                        Grand Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatCurrency(totals.grandTotal)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
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
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
              {customer && businessProfile && (
                <div className="text-xs text-muted-foreground pt-2">
                  {totals.isInterState ? 'Inter-state' : 'Intra-state'} transaction
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
