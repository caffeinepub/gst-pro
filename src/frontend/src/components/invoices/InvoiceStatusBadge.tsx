import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '../../backend';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  if (status === InvoiceStatus.draft) {
    return <Badge variant="secondary">Draft</Badge>;
  }
  if (status === InvoiceStatus.finalized) {
    return <Badge variant="default">Finalized</Badge>;
  }
  if (status === InvoiceStatus.cancelled) {
    return <Badge variant="destructive">Canceled</Badge>;
  }
  return <Badge variant="outline">Unknown</Badge>;
}
