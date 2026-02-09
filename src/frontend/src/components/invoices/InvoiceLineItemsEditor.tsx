import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { LineItem, Item } from '../../backend';
import { formatCurrency } from '../../utils/formatters';

interface InvoiceLineItemsEditorProps {
  lineItems: LineItem[];
  onChange: (lineItems: LineItem[]) => void;
  availableItems: Item[];
}

export default function InvoiceLineItemsEditor({
  lineItems,
  onChange,
  availableItems,
}: InvoiceLineItemsEditorProps) {
  const addLineItem = () => {
    if (availableItems.length === 0) return;
    const firstItem = availableItems[0];
    onChange([
      ...lineItems,
      {
        itemId: firstItem.id,
        quantity: 1,
        unitPrice: firstItem.unitPrice,
        discount: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    onChange(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleItemChange = (index: number, itemId: string) => {
    const item = availableItems.find((i) => i.id.toString() === itemId);
    if (item) {
      updateLineItem(index, {
        itemId: item.id,
        unitPrice: item.unitPrice,
      });
    }
  };

  if (availableItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No items available. Please add items first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="w-24">Qty</TableHead>
            <TableHead className="w-32">Rate</TableHead>
            <TableHead className="w-32">Discount</TableHead>
            <TableHead className="w-32 text-right">Amount</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((lineItem, index) => {
            const amount = lineItem.quantity * lineItem.unitPrice;
            const discount = lineItem.discount || 0;
            const total = amount - discount;
            return (
              <TableRow key={index}>
                <TableCell>
                  <Select
                    value={lineItem.itemId.toString()}
                    onValueChange={(value) => handleItemChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id.toString()} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineItem.quantity}
                    onChange={(e) =>
                      updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineItem.unitPrice}
                    onChange={(e) =>
                      updateLineItem(index, { unitPrice: parseFloat(e.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineItem.discount || 0}
                    onChange={(e) =>
                      updateLineItem(index, { discount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button type="button" variant="outline" onClick={addLineItem} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}
