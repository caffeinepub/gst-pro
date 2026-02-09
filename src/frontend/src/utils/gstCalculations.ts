import type { LineItem, Item, BusinessProfile, Customer, Invoice } from '../backend';

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  isInterState: boolean;
}

export function calculateInvoiceTotals(
  lineItems: LineItem[],
  items: Item[],
  businessProfile?: BusinessProfile | null,
  customer?: Customer
): InvoiceTotals {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalGst = 0;

  lineItems.forEach((lineItem) => {
    const item = items.find((i) => i.id === lineItem.itemId);
    const amount = lineItem.quantity * lineItem.unitPrice;
    const discount = lineItem.discount || 0;
    const taxableAmount = amount - discount;

    subtotal += amount;
    totalDiscount += discount;

    if (item) {
      const gstAmount = (taxableAmount * item.defaultGstRate) / 100;
      totalGst += gstAmount;
    }
  });

  const taxableAmount = subtotal - totalDiscount;

  // Determine if inter-state or intra-state
  const isInterState =
    businessProfile && customer ? businessProfile.state !== customer.state : false;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalGst;
  } else {
    cgst = totalGst / 2;
    sgst = totalGst / 2;
  }

  const grandTotal = taxableAmount + totalGst;

  return {
    subtotal,
    totalDiscount,
    taxableAmount,
    cgst,
    sgst,
    igst,
    grandTotal,
    isInterState,
  };
}

export function calculateInvoiceTotalsFromInvoice(
  invoice: Invoice,
  items: Item[],
  businessProfile?: BusinessProfile | null,
  customer?: Customer
): InvoiceTotals {
  return calculateInvoiceTotals(invoice.lineItems, items, businessProfile, customer);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
