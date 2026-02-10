import type { BusinessProfile, Invoice } from '../backend';

export function formatInvoiceNumber(
  invoiceId: bigint,
  businessProfile?: BusinessProfile | null
): string {
  const prefix = businessProfile?.invoicePrefix || 'INV';
  const startingNumber = businessProfile?.startingNumber || BigInt(1);
  const number = Number(invoiceId) + Number(startingNumber) - 1;
  return `${prefix}${number.toString().padStart(4, '0')}`;
}

export function getDisplayInvoiceNumber(
  invoice: Invoice,
  businessProfile?: BusinessProfile | null
): string {
  // Prefer stored invoice number when available (trimmed and non-empty)
  const storedNumber = invoice.invoiceNumber?.trim();
  if (storedNumber) {
    return storedNumber;
  }
  // Fallback to formatted invoice number
  return formatInvoiceNumber(invoice.id, businessProfile);
}
