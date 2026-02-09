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
import { formatInvoiceNumber } from '../utils/invoiceNumbering';
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
                <h1 className="text-3xl font-bold mb-2">{businessProfile.businessName}</h1>
                <p className="text-sm whitespace-pre-line">{businessProfile.address}</p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">GSTIN:</span> {businessProfile.gstin}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">State:</span> {businessProfile.state}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">TAX INVOICE</h2>
              <p className="text-sm mt-2">
                <span className="font-semibold">Invoice No:</span>{' '}
                {formatInvoiceNumber(invoice.id, businessProfile)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span> {formatInvoiceDate(invoice.invoiceDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Bill To:</h3>
          <p className="font-semibold">{customer.name}</p>
          <p className="text-sm whitespace-pre-line">{customer.billingAddress}</p>
          <p className="text-sm">
            <span className="font-semibold">State:</span> {customer.state}
          </p>
          {customer.gstin && (
            <p className="text-sm">
              <span className="font-semibold">GSTIN:</span> {customer.gstin}
            </p>
          )}
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-black">
                <TableHead className="border border-black font-bold text-black">Item</TableHead>
                <TableHead className="border border-black font-bold text-black text-right">HSN/SAC</TableHead>
                <TableHead className="border border-black font-bold text-black text-right">Qty</TableHead>
                <TableHead className="border border-black font-bold text-black text-right">Rate</TableHead>
                <TableHead className="border border-black font-bold text-black text-right">Discount</TableHead>
                <TableHead className="border border-black font-bold text-black text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((lineItem, index) => {
                const item = items.find((i) => i.id === lineItem.itemId);
                const amount = lineItem.quantity * lineItem.unitPrice;
                const discount = lineItem.discount || 0;
                const total = amount - discount;
                return (
                  <TableRow key={index} className="border-black">
                    <TableCell className="border border-black">
                      <div className="font-medium">{item?.name || 'Unknown Item'}</div>
                      {item?.description && <div className="text-sm text-gray-600">{item.description}</div>}
                    </TableCell>
                    <TableCell className="border border-black text-right">{item?.hsnSac || '—'}</TableCell>
                    <TableCell className="border border-black text-right">{lineItem.quantity}</TableCell>
                    <TableCell className="border border-black text-right">
                      {formatCurrency(lineItem.unitPrice)}
                    </TableCell>
                    <TableCell className="border border-black text-right">{formatCurrency(discount)}</TableCell>
                    <TableCell className="border border-black text-right font-medium">
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="border-black">
                <TableCell colSpan={5} className="border border-black text-right font-bold">
                  Subtotal
                </TableCell>
                <TableCell className="border border-black text-right font-bold">
                  {formatCurrency(totals.subtotal)}
                </TableCell>
              </TableRow>
              {totals.totalDiscount > 0 && (
                <TableRow className="border-black">
                  <TableCell colSpan={5} className="border border-black text-right font-bold">
                    Total Discount
                  </TableCell>
                  <TableCell className="border border-black text-right font-bold">
                    {formatCurrency(totals.totalDiscount)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="border-black">
                <TableCell colSpan={5} className="border border-black text-right font-bold">
                  Taxable Amount
                </TableCell>
                <TableCell className="border border-black text-right font-bold">
                  {formatCurrency(totals.taxableAmount)}
                </TableCell>
              </TableRow>
              {totals.isInterState ? (
                <TableRow className="border-black">
                  <TableCell colSpan={5} className="border border-black text-right font-bold">
                    IGST
                  </TableCell>
                  <TableCell className="border border-black text-right font-bold">
                    {formatCurrency(totals.igst)}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow className="border-black">
                    <TableCell colSpan={5} className="border border-black text-right font-bold">
                      CGST
                    </TableCell>
                    <TableCell className="border border-black text-right font-bold">
                      {formatCurrency(totals.cgst)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-black">
                    <TableCell colSpan={5} className="border border-black text-right font-bold">
                      SGST
                    </TableCell>
                    <TableCell className="border border-black text-right font-bold">
                      {formatCurrency(totals.sgst)}
                    </TableCell>
                  </TableRow>
                </>
              )}
              <TableRow className="border-black bg-gray-100">
                <TableCell colSpan={5} className="border border-black text-right text-lg font-bold">
                  Grand Total
                </TableCell>
                <TableCell className="border border-black text-right text-lg font-bold">
                  {formatCurrency(totals.grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-black">
          <p className="text-sm text-gray-600">
            {totals.isInterState ? 'Inter-state' : 'Intra-state'} transaction
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This is a computer-generated invoice and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
}
