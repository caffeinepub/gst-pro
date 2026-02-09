import type { Invoice } from '../backend';
import { InvoiceStatus } from '../backend';

export function canDeleteInvoice(invoice: Invoice): boolean {
  return invoice.status === InvoiceStatus.draft;
}

export function getDeleteErrorMessage(invoice: Invoice): string {
  if (invoice.status === InvoiceStatus.finalized) {
    return 'Finalized invoices cannot be deleted. Only draft invoices can be removed.';
  }
  return 'This invoice cannot be deleted.';
}
