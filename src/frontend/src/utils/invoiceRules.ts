import type { Invoice } from '../backend';

export function canDeleteInvoice(invoice: Invoice): boolean {
  // All invoices can now be deleted
  return true;
}

export function getDeleteErrorMessage(invoice: Invoice): string {
  // No longer blocking deletion based on status
  return 'This invoice cannot be deleted.';
}
