import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '../../backend';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const isDraft = status === InvoiceStatus.draft;

  return (
    <Badge variant={isDraft ? 'secondary' : 'default'}>
      {isDraft ? 'Draft' : 'Finalized'}
    </Badge>
  );
}
