import type { LineItem, Item, BusinessProfile, Customer } from '../backend';

export interface TaxBreakdownRow {
  hsnSac: string;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTaxAmount: number;
}

export interface TaxBreakdown {
  rows: TaxBreakdownRow[];
  isInterState: boolean;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
}

export function calculateTaxBreakdown(
  lineItems: LineItem[],
  items: Item[],
  businessProfile: BusinessProfile,
  customer: Customer
): TaxBreakdown {
  const isInterState = businessProfile.state !== customer.state;
  const hsnMap = new Map<string, { taxableValue: number; gstRate: number }>();

  // Group by HSN/SAC
  lineItems.forEach((lineItem) => {
    const item = items.find((i) => i.id === lineItem.itemId);
    if (!item) return;

    const hsnSac = item.hsnSac || '—';
    const amount = lineItem.quantity * lineItem.unitPrice;
    const discount = lineItem.discount || 0;
    const taxableValue = amount - discount;

    const existing = hsnMap.get(hsnSac);
    if (existing) {
      existing.taxableValue += taxableValue;
    } else {
      hsnMap.set(hsnSac, {
        taxableValue,
        gstRate: item.defaultGstRate,
      });
    }
  });

  // Build breakdown rows
  const rows: TaxBreakdownRow[] = [];
  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  hsnMap.forEach((data, hsnSac) => {
    const taxableValue = data.taxableValue;
    const gstRate = data.gstRate;
    const totalTaxAmount = (taxableValue * gstRate) / 100;

    totalTaxableValue += taxableValue;

    if (isInterState) {
      const igstAmount = totalTaxAmount;
      totalIgst += igstAmount;
      rows.push({
        hsnSac,
        taxableValue,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: gstRate,
        igstAmount,
        totalTaxAmount,
      });
    } else {
      const cgstAmount = totalTaxAmount / 2;
      const sgstAmount = totalTaxAmount / 2;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
      rows.push({
        hsnSac,
        taxableValue,
        cgstRate: gstRate / 2,
        cgstAmount,
        sgstRate: gstRate / 2,
        sgstAmount,
        igstRate: 0,
        igstAmount: 0,
        totalTaxAmount,
      });
    }
  });

  return {
    rows,
    isInterState,
    totalTaxableValue,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTax: totalCgst + totalSgst + totalIgst,
  };
}
