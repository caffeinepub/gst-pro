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
import { getDisplayInvoiceNumber } from '../utils/invoiceNumbering';
import { formatInvoiceDate } from '../utils/dateFormat';
import { usePrintOnce } from '../hooks/usePrintOnce';
import { InvoiceType } from '../backend';

export default function InvoicePrintPage() {
  const params = useParams({ strict: false });
  const invoiceId = params.invoiceId ? BigInt(params.invoiceId) : null;

  const { data: invoice, isLoading: invoiceLoading } = useGetInvoice(invoiceId);
  const { data: customer, isLoading: customerLoading } = useGetCustomer(invoice?.customerId || null);
  const { data: items = [], isLoading: itemsLoading } = useGetItems();
  const { data: businessProfile, isLoading: businessLoading } = useGetBusinessProfile();

  const isLoading = invoiceLoading || customerLoading || itemsLoading || businessLoading;
  const isDataReady = !isLoading && !!invoice && !!customer && !!businessProfile;

  usePrintOnce({ isReady: isDataReady });

  if (isLoading || !invoice || !customer || !businessProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totals = calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer);
  const invoiceTypeLabel = invoice.invoiceType === InvoiceType.transportation
    ? 'Transportation Invoice'
    : 'Original Invoice';
  const statusLabel = invoice.status === 'cancelled' ? 'Canceled' : invoice.status === 'finalized' ? 'Finalized' : 'Draft';

  // Check if banking details are configured
  const hasBankingDetails = businessProfile.bankingDetails && (
    businessProfile.bankingDetails.accountName ||
    businessProfile.bankingDetails.accountNumber ||
    businessProfile.bankingDetails.ifscCode ||
    businessProfile.bankingDetails.bankName
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-black pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{businessProfile.businessName}</h1>
              <p className="text-sm mt-2">{businessProfile.address}</p>
              <p className="text-sm">GSTIN: {businessProfile.gstin}</p>
              <p className="text-sm">State: {businessProfile.state}</p>
            </div>
            {businessProfile.logo && (
              <img
                src={businessProfile.logo.getDirectURL()}
                alt="Business Logo"
                className="h-16 w-auto object-contain"
              />
            )}
          </div>
        </div>

        {/* Invoice Title and Details */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{invoiceTypeLabel}</h2>
              <p className="text-sm text-gray-600">Status: {statusLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="font-semibold">Invoice #:</span>{' '}
                {getDisplayInvoiceNumber(invoice, businessProfile)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span> {formatInvoiceDate(invoice.invoiceDate)}
              </p>
              {invoice.purchaseOrderNumber && (
                <p className="text-sm">
                  <span className="font-semibold">PO #:</span> {invoice.purchaseOrderNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="border border-black p-4">
          <h3 className="font-bold mb-2">Bill To:</h3>
          <p className="font-semibold">{customer.name}</p>
          <p className="text-sm">{customer.billingAddress}</p>
          {customer.gstin && <p className="text-sm">GSTIN: {customer.gstin}</p>}
          <p className="text-sm">State: {customer.state}</p>
          {customer.contactInfo && <p className="text-sm">Contact: {customer.contactInfo}</p>}
        </div>

        {/* Line Items */}
        <div className="border border-black">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black">
                <TableHead className="border-r border-black font-bold text-black">Item</TableHead>
                <TableHead className="border-r border-black text-right font-bold text-black">
                  Qty
                </TableHead>
                <TableHead className="border-r border-black text-right font-bold text-black">
                  Price
                </TableHead>
                <TableHead className="border-r border-black text-right font-bold text-black">
                  Discount
                </TableHead>
                <TableHead className="text-right font-bold text-black">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((lineItem, index) => {
                const item = items.find((i) => i.id === lineItem.itemId);
                const lineTotal = lineItem.quantity * lineItem.unitPrice - (lineItem.discount || 0);
                return (
                  <TableRow key={index} className="border-b border-black">
                    <TableCell className="border-r border-black">
                      <div>
                        <p className="font-medium">{item?.name || 'Unknown Item'}</p>
                        {item?.description && (
                          <p className="text-xs text-gray-600">{item.description}</p>
                        )}
                        {item?.hsnSac && (
                          <p className="text-xs text-gray-600">HSN/SAC: {item.hsnSac}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-r border-black text-right">
                      {lineItem.quantity}
                    </TableCell>
                    <TableCell className="border-r border-black text-right">
                      {formatCurrency(lineItem.unitPrice)}
                    </TableCell>
                    <TableCell className="border-r border-black text-right">
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
              <TableRow className="border-b border-black">
                <TableCell colSpan={4} className="text-right font-medium border-r border-black">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(totals.subtotal)}
                </TableCell>
              </TableRow>
              {totals.totalDiscount > 0 && (
                <TableRow className="border-b border-black">
                  <TableCell colSpan={4} className="text-right border-r border-black">
                    Total Discount
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totals.totalDiscount)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="border-b border-black">
                <TableCell colSpan={4} className="text-right border-r border-black">
                  Taxable Amount
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totals.taxableAmount)}</TableCell>
              </TableRow>
              {totals.isInterState ? (
                <TableRow className="border-b border-black">
                  <TableCell colSpan={4} className="text-right border-r border-black">
                    IGST
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(totals.igst)}</TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow className="border-b border-black">
                    <TableCell colSpan={4} className="text-right border-r border-black">
                      CGST
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.cgst)}</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-black">
                    <TableCell colSpan={4} className="text-right border-r border-black">
                      SGST
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.sgst)}</TableCell>
                  </TableRow>
                </>
              )}
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-right font-bold text-lg border-r border-black"
                >
                  Grand Total
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {formatCurrency(totals.grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Banking Details */}
        {hasBankingDetails && businessProfile.bankingDetails && (
          <div className="border border-black p-4">
            <h3 className="font-bold mb-2">Banking Details:</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {businessProfile.bankingDetails.accountName && (
                <>
                  <p className="text-gray-600">Account Name:</p>
                  <p className="font-medium">{businessProfile.bankingDetails.accountName}</p>
                </>
              )}
              {businessProfile.bankingDetails.accountNumber && (
                <>
                  <p className="text-gray-600">Account Number:</p>
                  <p className="font-medium">{businessProfile.bankingDetails.accountNumber}</p>
                </>
              )}
              {businessProfile.bankingDetails.ifscCode && (
                <>
                  <p className="text-gray-600">IFSC Code:</p>
                  <p className="font-medium">{businessProfile.bankingDetails.ifscCode}</p>
                </>
              )}
              {businessProfile.bankingDetails.bankName && (
                <>
                  <p className="text-gray-600">Bank Name:</p>
                  <p className="font-medium">{businessProfile.bankingDetails.bankName}</p>
                </>
              )}
              {businessProfile.bankingDetails.branch && (
                <>
                  <p className="text-gray-600">Branch:</p>
                  <p className="font-medium">{businessProfile.bankingDetails.branch}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t border-black pt-4">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
