import { useParams } from '@tanstack/react-router';
import {
  useGetInvoice,
  useGetCustomer,
  useGetItems,
  useGetBusinessProfile,
} from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';
import { getDisplayInvoiceNumber } from '../utils/invoiceNumbering';
import { formatInvoiceDate } from '../utils/dateFormat';
import { Loader2 } from 'lucide-react';
import { usePrintOnce } from '../hooks/usePrintOnce';

export default function InvoicePrintPage() {
  const params = useParams({ strict: false });
  const invoiceId = params.invoiceId ? BigInt(params.invoiceId) : null;

  const { data: invoice, isLoading: invoiceLoading } = useGetInvoice(invoiceId);
  const { data: customer, isLoading: customerLoading } = useGetCustomer(invoice?.customerId || null);
  const { data: items = [], isLoading: itemsLoading } = useGetItems();
  const { data: businessProfile, isLoading: businessLoading } = useGetBusinessProfile();

  // Determine if all required data is ready
  const isDataReady = !!(
    invoice &&
    customer &&
    businessProfile &&
    !invoiceLoading &&
    !customerLoading &&
    !itemsLoading &&
    !businessLoading
  );

  // Trigger print once when ready
  usePrintOnce({ isReady: isDataReady });

  // Show loading state while any data is missing or loading
  if (!isDataReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Preparing invoice for printing...</p>
        </div>
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer);
  const logoUrl = businessProfile.logo?.getDirectURL();

  return (
    <div className="print-page min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{businessProfile.businessName}</h1>
                <p className="text-sm mt-1">{businessProfile.address}</p>
                <p className="text-sm">GSTIN: {businessProfile.gstin}</p>
                <p className="text-sm">State: {businessProfile.state}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">TAX INVOICE</h2>
              <p className="text-sm mt-2">
                <strong>Invoice No:</strong> {getDisplayInvoiceNumber(invoice, businessProfile)}
              </p>
              <p className="text-sm">
                <strong>Date:</strong> {formatInvoiceDate(invoice.invoiceDate)}
              </p>
              {invoice.purchaseOrderNumber && (
                <p className="text-sm">
                  <strong>Purchase Order No:</strong> {invoice.purchaseOrderNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Bill To:</h3>
          <div className="border border-black p-3">
            <p className="font-bold">{customer.name}</p>
            <p className="text-sm">{customer.billingAddress}</p>
            <p className="text-sm">State: {customer.state}</p>
            {customer.gstin && <p className="text-sm">GSTIN: {customer.gstin}</p>}
            {customer.contactInfo && <p className="text-sm">Contact: {customer.contactInfo}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <Table className="border border-black mb-6">
          <TableHeader>
            <TableRow className="border-b border-black">
              <TableHead className="border-r border-black text-black font-bold">Item</TableHead>
              <TableHead className="border-r border-black text-right text-black font-bold">HSN/SAC</TableHead>
              <TableHead className="border-r border-black text-right text-black font-bold">Qty</TableHead>
              <TableHead className="border-r border-black text-right text-black font-bold">Rate</TableHead>
              <TableHead className="border-r border-black text-right text-black font-bold">Discount</TableHead>
              <TableHead className="text-right text-black font-bold">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map((lineItem, index) => {
              const item = items.find((i) => i.id === lineItem.itemId);
              const amount = lineItem.quantity * lineItem.unitPrice;
              const discount = lineItem.discount || 0;
              const total = amount - discount;
              return (
                <TableRow key={index} className="border-b border-black">
                  <TableCell className="border-r border-black">
                    <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                    {item?.description && <div className="text-xs text-gray-600">{item.description}</div>}
                  </TableCell>
                  <TableCell className="border-r border-black text-right text-sm">
                    {item?.hsnSac || '-'}
                  </TableCell>
                  <TableCell className="border-r border-black text-right">{lineItem.quantity}</TableCell>
                  <TableCell className="border-r border-black text-right">
                    {formatCurrency(lineItem.unitPrice)}
                  </TableCell>
                  <TableCell className="border-r border-black text-right">{formatCurrency(discount)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="border-b border-black">
              <TableCell colSpan={5} className="text-right font-bold border-r border-black">
                Subtotal
              </TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(totals.subtotal)}</TableCell>
            </TableRow>
            {totals.totalDiscount > 0 && (
              <TableRow className="border-b border-black">
                <TableCell colSpan={5} className="text-right font-bold border-r border-black">
                  Total Discount
                </TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totals.totalDiscount)}</TableCell>
              </TableRow>
            )}
            <TableRow className="border-b border-black">
              <TableCell colSpan={5} className="text-right font-bold border-r border-black">
                Taxable Amount
              </TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(totals.taxableAmount)}</TableCell>
            </TableRow>
            {totals.isInterState ? (
              <TableRow className="border-b border-black">
                <TableCell colSpan={5} className="text-right font-bold border-r border-black">
                  IGST
                </TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totals.igst)}</TableCell>
              </TableRow>
            ) : (
              <>
                <TableRow className="border-b border-black">
                  <TableCell colSpan={5} className="text-right font-bold border-r border-black">
                    CGST
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totals.cgst)}</TableCell>
                </TableRow>
                <TableRow className="border-b border-black">
                  <TableCell colSpan={5} className="text-right font-bold border-r border-black">
                    SGST
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totals.sgst)}</TableCell>
                </TableRow>
              </>
            )}
            <TableRow className="bg-gray-100">
              <TableCell colSpan={5} className="text-right text-lg font-bold border-r border-black">
                Grand Total
              </TableCell>
              <TableCell className="text-right text-lg font-bold">{formatCurrency(totals.grandTotal)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-black">
          <p className="text-xs text-gray-600">
            This is a computer-generated invoice and does not require a signature.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Transaction Type: {totals.isInterState ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}
          </p>
        </div>
      </div>
    </div>
  );
}
