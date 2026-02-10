import { useParams, useNavigate } from '@tanstack/react-router';
import {
  useGetInvoice,
  useGetCustomer,
  useGetItems,
  useGetBusinessProfile,
  useDeleteInvoice,
  useFinalizeInvoice,
  useCancelInvoice,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Printer, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatInvoiceDate } from '../utils/dateFormat';
import { getDisplayInvoiceNumber } from '../utils/invoiceNumbering';
import { calculateInvoiceTotalsFromInvoice } from '../utils/gstCalculations';
import { useState } from 'react';
import { toast } from 'sonner';
import { getUserFacingError } from '../utils/userFacingError';
import InvoiceStatusBadge from '../components/invoices/InvoiceStatusBadge';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams({ from: '/app-layout/invoices/$invoiceId' });
  const invoiceIdBigInt = BigInt(invoiceId);

  const { data: invoice, isLoading: invoiceLoading } = useGetInvoice(invoiceIdBigInt);
  const { data: customer, isLoading: customerLoading } = useGetCustomer(
    invoice ? invoice.customerId : null
  );
  const { data: items, isLoading: itemsLoading } = useGetItems();
  const { data: businessProfile, isLoading: businessLoading } = useGetBusinessProfile();

  const deleteInvoice = useDeleteInvoice();
  const finalizeInvoice = useFinalizeInvoice();
  const cancelInvoice = useCancelInvoice();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isLoading = invoiceLoading || customerLoading || itemsLoading || businessLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice || !customer || !items || !businessProfile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">Invoice not found</p>
      </div>
    );
  }

  const itemsMap = new Map(items.map((item) => [item.id.toString(), item]));
  const totals = calculateInvoiceTotalsFromInvoice(invoice, items, businessProfile, customer);

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice.id);
      toast.success('Invoice deleted successfully');
      navigate({ to: '/invoices' });
    } catch (error: any) {
      const userError = getUserFacingError(error);
      toast.error(userError);
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeInvoice.mutateAsync(invoice.id);
      toast.success('Invoice finalized successfully');
    } catch (error: any) {
      const userError = getUserFacingError(error);
      toast.error(userError);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelInvoice.mutateAsync(invoice.id);
      toast.success('Invoice cancelled successfully');
      setShowCancelDialog(false);
    } catch (error: any) {
      const userError = getUserFacingError(error);
      toast.error(userError);
    }
  };

  const handlePrint = () => {
    navigate({ to: '/invoices/$invoiceId/print', params: { invoiceId: invoiceId } });
  };

  const handleEdit = () => {
    navigate({ to: '/invoices/$invoiceId/edit', params: { invoiceId: invoiceId } });
  };

  const isDraft = invoice.status === 'draft';
  const isFinalized = invoice.status === 'finalized';
  const isCancelled = invoice.status === 'cancelled';

  const hasBankingDetails = businessProfile.bankingDetails &&
    businessProfile.bankingDetails.accountName &&
    businessProfile.bankingDetails.accountNumber &&
    businessProfile.bankingDetails.ifscCode &&
    businessProfile.bankingDetails.bankName;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice Details</h1>
            <p className="text-muted-foreground mt-1">{getDisplayInvoiceNumber(invoice)}</p>
          </div>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {isDraft && (
          <>
            <Button onClick={handleEdit} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={handleFinalize} disabled={finalizeInvoice.isPending}>
              {finalizeInvoice.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Finalize
            </Button>
          </>
        )}
        {isFinalized && (
          <Button onClick={() => setShowCancelDialog(true)} variant="outline" disabled={cancelInvoice.isPending}>
            {cancelInvoice.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Cancel Invoice
          </Button>
        )}
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="destructive"
          disabled={deleteInvoice.isPending}
        >
          {deleteInvoice.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete
        </Button>
      </div>

      {/* Invoice Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="font-medium">{getDisplayInvoiceNumber(invoice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Date</p>
              <p className="font-medium">{formatInvoiceDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invoice Type</p>
              <p className="font-medium capitalize">{invoice.invoiceType}</p>
            </div>
            {invoice.purchaseOrderNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Purchase Order Number</p>
                <p className="font-medium">{invoice.purchaseOrderNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Address</p>
              <p className="font-medium whitespace-pre-line">{customer.billingAddress}</p>
            </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Item</th>
                  <th className="text-right py-2 px-2">Quantity</th>
                  <th className="text-right py-2 px-2">Rate</th>
                  <th className="text-right py-2 px-2">Discount</th>
                  <th className="text-right py-2 px-2">GST Rate</th>
                  <th className="text-right py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((lineItem, index) => {
                  const item = itemsMap.get(lineItem.itemId.toString());
                  const quantity = lineItem.quantity;
                  const rate = lineItem.unitPrice;
                  const discount = lineItem.discount || 0;
                  const discountAmount = (rate * quantity * discount) / 100;
                  const taxableValue = rate * quantity - discountAmount;
                  const gstRate = item?.defaultGstRate || 0;
                  const gstAmount = (taxableValue * gstRate) / 100;
                  const amount = taxableValue + gstAmount;

                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2">
                        <p className="font-medium">{item?.name || 'Unknown Item'}</p>
                        {item?.hsnSac && <p className="text-sm text-muted-foreground">HSN/SAC: {item.hsnSac}</p>}
                      </td>
                      <td className="text-right py-2 px-2">{quantity.toFixed(2)}</td>
                      <td className="text-right py-2 px-2">₹{rate.toFixed(2)}</td>
                      <td className="text-right py-2 px-2">{discount.toFixed(2)}%</td>
                      <td className="text-right py-2 px-2">{gstRate.toFixed(2)}%</td>
                      <td className="text-right py-2 px-2 font-medium">₹{amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxable Amount:</span>
              <span className="font-medium">₹{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST Amount:</span>
              <span className="font-medium">₹{(totals.cgst + totals.sgst + totals.igst).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banking Details (conditional) */}
      {hasBankingDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Banking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-medium">{businessProfile.bankingDetails!.accountName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium">{businessProfile.bankingDetails!.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IFSC Code</p>
                <p className="font-medium">{businessProfile.bankingDetails!.ifscCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{businessProfile.bankingDetails!.bankName}</p>
              </div>
              {businessProfile.bankingDetails!.branch && (
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{businessProfile.bankingDetails!.branch}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invoice? Cancelled invoices cannot be edited or finalized again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Invoice</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Yes, Cancel Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
