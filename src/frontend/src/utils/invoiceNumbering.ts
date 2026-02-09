import type { BusinessProfile } from '../backend';

export function formatInvoiceNumber(
  invoiceId: bigint,
  businessProfile?: BusinessProfile | null
): string {
  const prefix = businessProfile?.invoicePrefix || 'INV';
  const startingNumber = businessProfile?.startingNumber || BigInt(1);
  const number = Number(invoiceId) + Number(startingNumber) - 1;
  return `${prefix}${number.toString().padStart(4, '0')}`;
}
