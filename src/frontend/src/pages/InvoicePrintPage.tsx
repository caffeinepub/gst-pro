import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetInvoice, useGetCustomer, useGetItems, useGetBusinessProfile } from '../hooks/useQueries';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatInvoiceDate } from '../utils/dateFormat';
import { getDisplayInvoiceNumber } from '../utils/invoiceNumbering';
import { calculateTaxBreakdown } from '../utils/invoiceTaxBreakdown';
import { usePrintOnce } from '../hooks/usePrintOnce';

export default function InvoicePrintPage() {
  const navigate = useNavigate();
  const { invoiceId } = useParams({ from: '/print-layout/invoices/$invoiceId/print' });
  const invoiceIdBigInt = BigInt(invoiceId);

  const { data: invoice, isLoading: invoiceLoading } = useGetInvoice(invoiceIdBigInt);
  const { data: customer, isLoading: customerLoading } = useGetCustomer(
    invoice ? invoice.customerId : null
  );
  const { data: items, isLoading: itemsLoading } = useGetItems();
  const { data: businessProfile, isLoading: businessLoading } = useGetBusinessProfile();

  const isLoading = invoiceLoading || customerLoading || itemsLoading || businessLoading;
  const isReady = !!(invoice && customer && items && businessProfile);

  usePrintOnce({ 
    isReady: isReady && !isLoading,
    onAfterPrint: () => {
      // Auto-navigate back after print dialog closes
      navigate({ to: '/invoices/$invoiceId', params: { invoiceId } });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice || !customer || !items || !businessProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    );
  }

  const itemsMap = new Map(items.map((item) => [item.id.toString(), item]));

  const lineItemsWithDetails = invoice.lineItems.map((lineItem) => {
    const item = itemsMap.get(lineItem.itemId.toString());
    const quantity = lineItem.quantity;
    const rate = lineItem.unitPrice;
    const discount = lineItem.discount || 0;
    const discountAmount = (rate * quantity * discount) / 100;
    const taxableValue = rate * quantity - discountAmount;
    const gstRate = item?.defaultGstRate || 0;
    const gstAmount = (taxableValue * gstRate) / 100;
    const amount = taxableValue + gstAmount;

    return {
      ...lineItem,
      item,
      taxableValue,
      gstAmount,
      amount,
    };
  });

  const totals = lineItemsWithDetails.reduce(
    (acc, line) => ({
      taxableValue: acc.taxableValue + line.taxableValue,
      gstAmount: acc.gstAmount + line.gstAmount,
      totalAmount: acc.totalAmount + line.amount,
    }),
    { taxableValue: 0, gstAmount: 0, totalAmount: 0 }
  );

  const taxBreakdownData = calculateTaxBreakdown(invoice.lineItems, items, businessProfile, customer);

  const isInterState = businessProfile.state !== customer.state;

  const hasBankingDetails = businessProfile.bankingDetails &&
    businessProfile.bankingDetails.accountName &&
    businessProfile.bankingDetails.accountNumber &&
    businessProfile.bankingDetails.ifscCode &&
    businessProfile.bankingDetails.bankName;

  // Get addresses with fallback to customer billing address
  const billToAddress = invoice.billToOverride 
    ? invoice.billToOverride.addressLine1
    : customer.billingAddress;

  const shipToAddress = invoice.shipToOverride
    ? invoice.shipToOverride.addressLine1
    : customer.billingAddress;

  const billToName = invoice.billToOverride?.name || customer.name;
  const shipToName = invoice.shipToOverride?.name || customer.name;
  const billToState = invoice.billToOverride?.state || customer.state;
  const shipToState = invoice.shipToOverride?.state || customer.state;
  const billToGstin = invoice.billToOverride?.gstin || customer.gstin;

  return (
    <>
      {/* Back button - visible on screen, hidden in print */}
      <div className="no-print fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/invoices/$invoiceId', params: { invoiceId } })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="print-page bg-white text-black p-8 max-w-[210mm] mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Tax Invoice</h1>
          {invoice.invoiceType === 'original' && (
            <p className="text-sm text-gray-600 mt-1">(Original for Recipient)</p>
          )}
          {invoice.invoiceType === 'transportation' && (
            <p className="text-sm text-gray-600 mt-1">(Transportation Copy)</p>
          )}
        </div>

        {/* Party Details Grid */}
        <div className="border-2 border-black mb-4">
          <div className="grid grid-cols-2 border-b-2 border-black">
            {/* Seller Details */}
            <div className="p-3 border-r-2 border-black">
              <p className="font-bold text-sm mb-2">Seller:</p>
              <p className="font-semibold">{businessProfile.businessName}</p>
              <p className="text-sm whitespace-pre-line">{businessProfile.address}</p>
              <p className="text-sm mt-1">
                <span className="font-semibold">GSTIN:</span> {businessProfile.gstin}
              </p>
              <p className="text-sm">
                <span className="font-semibold">State:</span> {businessProfile.state}
              </p>
            </div>

            {/* Invoice Details */}
            <div className="p-3">
              <p className="text-sm">
                <span className="font-semibold">Invoice No:</span> {getDisplayInvoiceNumber(invoice)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Invoice Date:</span> {formatInvoiceDate(invoice.invoiceDate)}
              </p>
              {invoice.purchaseOrderNumber && (
                <p className="text-sm">
                  <span className="font-semibold">PO Number:</span> {invoice.purchaseOrderNumber}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2">
            {/* Buyer/Bill To */}
            <div className="p-3 border-r-2 border-black">
              <p className="font-bold text-sm mb-2">Bill To:</p>
              <p className="font-semibold">{billToName}</p>
              <p className="text-sm whitespace-pre-line">{billToAddress}</p>
              {billToGstin && (
                <p className="text-sm mt-1">
                  <span className="font-semibold">GSTIN:</span> {billToGstin}
                </p>
              )}
              <p className="text-sm">
                <span className="font-semibold">State:</span> {billToState}
              </p>
            </div>

            {/* Ship To */}
            <div className="p-3">
              <p className="font-bold text-sm mb-2">Ship To:</p>
              <p className="font-semibold">{shipToName}</p>
              <p className="text-sm whitespace-pre-line">{shipToAddress}</p>
              <p className="text-sm">
                <span className="font-semibold">State:</span> {shipToState}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="print-table w-full border-2 border-black mb-4 text-sm">
          <thead className="print-thead">
            <tr className="border-b-2 border-black">
              <th className="border-r border-black p-2 text-left">S.No</th>
              <th className="border-r border-black p-2 text-left">Description of Goods</th>
              <th className="border-r border-black p-2 text-center">HSN/SAC</th>
              <th className="border-r border-black p-2 text-right">Qty</th>
              <th className="border-r border-black p-2 text-right">Rate</th>
              <th className="border-r border-black p-2 text-right">Disc%</th>
              <th className="border-r border-black p-2 text-right">Taxable Value</th>
              {isInterState ? (
                <th className="border-r border-black p-2 text-right">IGST</th>
              ) : (
                <>
                  <th className="border-r border-black p-2 text-right">CGST</th>
                  <th className="border-r border-black p-2 text-right">SGST</th>
                </>
              )}
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItemsWithDetails.map((line, index) => {
              const gstRate = line.item?.defaultGstRate || 0;
              const cgstAmount = isInterState ? 0 : line.gstAmount / 2;
              const sgstAmount = isInterState ? 0 : line.gstAmount / 2;
              const igstAmount = isInterState ? line.gstAmount : 0;

              return (
                <tr key={index} className="print-row border-b border-black">
                  <td className="border-r border-black p-2">{index + 1}</td>
                  <td className="border-r border-black p-2">{line.item?.name || 'Unknown Item'}</td>
                  <td className="border-r border-black p-2 text-center">{line.item?.hsnSac || '-'}</td>
                  <td className="border-r border-black p-2 text-right">{line.quantity.toFixed(2)}</td>
                  <td className="border-r border-black p-2 text-right">₹{line.unitPrice.toFixed(2)}</td>
                  <td className="border-r border-black p-2 text-right">{(line.discount || 0).toFixed(2)}%</td>
                  <td className="border-r border-black p-2 text-right">₹{line.taxableValue.toFixed(2)}</td>
                  {isInterState ? (
                    <td className="border-r border-black p-2 text-right">
                      ₹{igstAmount.toFixed(2)}
                      <br />
                      <span className="text-xs">({gstRate}%)</span>
                    </td>
                  ) : (
                    <>
                      <td className="border-r border-black p-2 text-right">
                        ₹{cgstAmount.toFixed(2)}
                        <br />
                        <span className="text-xs">({(gstRate / 2).toFixed(2)}%)</span>
                      </td>
                      <td className="border-r border-black p-2 text-right">
                        ₹{sgstAmount.toFixed(2)}
                        <br />
                        <span className="text-xs">({(gstRate / 2).toFixed(2)}%)</span>
                      </td>
                    </>
                  )}
                  <td className="p-2 text-right font-semibold">₹{line.amount.toFixed(2)}</td>
                </tr>
              );
            })}

            {/* Totals Row */}
            <tr className="font-bold border-t-2 border-black">
              <td colSpan={6} className="border-r border-black p-2 text-right">
                Total:
              </td>
              <td className="border-r border-black p-2 text-right">₹{totals.taxableValue.toFixed(2)}</td>
              {isInterState ? (
                <td className="border-r border-black p-2 text-right">₹{totals.gstAmount.toFixed(2)}</td>
              ) : (
                <>
                  <td className="border-r border-black p-2 text-right">₹{(totals.gstAmount / 2).toFixed(2)}</td>
                  <td className="border-r border-black p-2 text-right">₹{(totals.gstAmount / 2).toFixed(2)}</td>
                </>
              )}
              <td className="p-2 text-right">₹{totals.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* GST Breakdown by HSN/SAC */}
        <div className="border-2 border-black mb-4">
          <p className="font-bold text-sm p-2 border-b-2 border-black">Tax Breakdown (HSN/SAC-wise)</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-2 text-left">HSN/SAC</th>
                <th className="border-r border-black p-2 text-right">Taxable Value</th>
                {isInterState ? (
                  <th className="p-2 text-right">IGST Amount</th>
                ) : (
                  <>
                    <th className="border-r border-black p-2 text-right">CGST Amount</th>
                    <th className="p-2 text-right">SGST Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {taxBreakdownData.rows.map((entry, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2">{entry.hsnSac}</td>
                  <td className="border-r border-black p-2 text-right">₹{entry.taxableValue.toFixed(2)}</td>
                  {isInterState ? (
                    <td className="p-2 text-right">₹{entry.igstAmount.toFixed(2)}</td>
                  ) : (
                    <>
                      <td className="border-r border-black p-2 text-right">₹{entry.cgstAmount.toFixed(2)}</td>
                      <td className="p-2 text-right">₹{entry.sgstAmount.toFixed(2)}</td>
                    </>
                  )}
                </tr>
              ))}
              <tr className="font-bold border-t-2 border-black">
                <td className="border-r border-black p-2">Total</td>
                <td className="border-r border-black p-2 text-right">
                  ₹{taxBreakdownData.totalTaxableValue.toFixed(2)}
                </td>
                {isInterState ? (
                  <td className="p-2 text-right">
                    ₹{taxBreakdownData.totalIgst.toFixed(2)}
                  </td>
                ) : (
                  <>
                    <td className="border-r border-black p-2 text-right">
                      ₹{taxBreakdownData.totalCgst.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      ₹{taxBreakdownData.totalSgst.toFixed(2)}
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Banking Details (conditional) */}
        {hasBankingDetails && (
          <div className="border-2 border-black p-3 mb-4">
            <p className="font-bold text-sm mb-2">Banking Details:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p>
                <span className="font-semibold">Account Name:</span> {businessProfile.bankingDetails!.accountName}
              </p>
              <p>
                <span className="font-semibold">Account Number:</span> {businessProfile.bankingDetails!.accountNumber}
              </p>
              <p>
                <span className="font-semibold">IFSC Code:</span> {businessProfile.bankingDetails!.ifscCode}
              </p>
              <p>
                <span className="font-semibold">Bank Name:</span> {businessProfile.bankingDetails!.bankName}
              </p>
              {businessProfile.bankingDetails!.branch && (
                <p>
                  <span className="font-semibold">Branch:</span> {businessProfile.bankingDetails!.branch}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-2 border-black">
          <div className="p-3 border-b border-black">
            <p className="text-xs">
              <span className="font-semibold">Declaration:</span> We declare that this invoice shows the actual price of
              the goods described and that all particulars are true and correct.
            </p>
          </div>
          <div className="p-3 text-right">
            <p className="text-sm font-semibold mb-12">For {businessProfile.businessName}</p>
            <p className="text-sm">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </>
  );
}
