import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  useGetInvoice,
  useGetCustomer,
  useGetItems,
  useGetBusinessProfile,
} from '../hooks/useQueries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';
import { formatInvoiceNumber } from '../utils/invoiceNumbering';

export default function InvoicePrintPage() {
  const params = useParams({ strict: false });
  const invoiceId = params.invoiceId ? BigInt(params.invoiceId) : null;

  const { data: invoice, isLoading } = useGetInvoice(invoiceId);
  const { data: customer } = useGetCustomer(invoice?.customerId || null);
  const { data: items = [] } = useGetItems();
  const { data: businessProfile } = useGetBusinessProfile();

  useEffect(() => {
    if (invoice && customer && businessProfile) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [invoice, customer, businessProfile]);

  if (isLoading || !invoice || !customer || !businessProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer);

  return (
    <div className="print-page max-w-4xl mx-auto p-8 bg-white text-black">
      <div className="mb-8 text-center border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold mb-2">TAX INVOICE</h1>
        <div className="text-lg font-semibold">{businessProfile.businessName}</div>
        <div className="text-sm">{businessProfile.address}</div>
        <div className="text-sm">
          State: {businessProfile.state} | GSTIN: {businessProfile.gstin}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h2 className="font-bold mb-2 text-sm uppercase">Bill To:</h2>
          <div className="text-sm">
            <div className="font-semibold">{customer.name}</div>
            <div>{customer.billingAddress}</div>
            <div>State: {customer.state}</div>
            {customer.gstin && <div>GSTIN: {customer.gstin}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold">Invoice #:</span>{' '}
              {formatInvoiceNumber(invoice.id, businessProfile)}
            </div>
            <div>
              <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              {invoice.status === 'finalized' ? 'Finalized' : 'Draft'}
            </div>
          </div>
        </div>
      </div>

      <Table className="mb-6">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-black">Item</TableHead>
            <TableHead className="border border-black text-right">HSN/SAC</TableHead>
            <TableHead className="border border-black text-right">Qty</TableHead>
            <TableHead className="border border-black text-right">Rate</TableHead>
            <TableHead className="border border-black text-right">Discount</TableHead>
            <TableHead className="border border-black text-right">GST %</TableHead>
            <TableHead className="border border-black text-right">Amount</TableHead>
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
                <TableCell className="border border-black">{item?.name || 'Unknown'}</TableCell>
                <TableCell className="border border-black text-right">
                  {item?.hsnSac || '-'}
                </TableCell>
                <TableCell className="border border-black text-right">{lineItem.quantity}</TableCell>
                <TableCell className="border border-black text-right">
                  {formatCurrency(lineItem.unitPrice)}
                </TableCell>
                <TableCell className="border border-black text-right">
                  {formatCurrency(discount)}
                </TableCell>
                <TableCell className="border border-black text-right">
                  {item?.defaultGstRate || 0}%
                </TableCell>
                <TableCell className="border border-black text-right font-medium">
                  {formatCurrency(total)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="border border-black text-right font-semibold">
              Subtotal
            </TableCell>
            <TableCell className="border border-black text-right font-semibold">
              {formatCurrency(totals.subtotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="grid grid-cols-2 gap-8">
        <div className="text-sm">
          <div className="font-semibold mb-2">Tax Type:</div>
          <div>{totals.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taxable Amount:</span>
            <span className="font-medium">{formatCurrency(totals.taxableAmount)}</span>
          </div>
          {totals.isInterState ? (
            <div className="flex justify-between text-sm">
              <span>IGST:</span>
              <span className="font-medium">{formatCurrency(totals.igst)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span>CGST:</span>
                <span className="font-medium">{formatCurrency(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>SGST:</span>
                <span className="font-medium">{formatCurrency(totals.sgst)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-t-2 border-black pt-2">
            <span className="font-bold">Grand Total:</span>
            <span className="font-bold text-lg">{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t border-black text-center text-sm">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
