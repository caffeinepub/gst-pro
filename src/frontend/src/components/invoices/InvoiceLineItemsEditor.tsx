import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  onAddItem?: () => void;
}

export default function InvoiceLineItemsEditor({
  lineItems,
  onChange,
  availableItems,
  onAddItem,
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

  const getItemGstRate = (itemId: bigint): number => {
    const item = availableItems.find((i) => i.id === itemId);
    return item?.defaultGstRate || 0;
  };

  if (availableItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No items available. Please add an item first.</p>
        {onAddItem && (
          <Button type="button" onClick={onAddItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View - hidden on mobile */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="w-24">Qty</TableHead>
              <TableHead className="w-32">Rate</TableHead>
              <TableHead className="w-28">Discount</TableHead>
              <TableHead className="w-24">GST Rate</TableHead>
              <TableHead className="w-32 text-right">Amount</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((lineItem, index) => {
              const amount = lineItem.quantity * lineItem.unitPrice;
              const discount = lineItem.discount || 0;
              const total = amount - discount;
              const gstRate = getItemGstRate(lineItem.itemId);
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
                  <TableCell>
                    <div className="text-sm font-medium">{gstRate}%</div>
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
      </div>

      {/* Mobile Card View - visible only on mobile */}
      <div className="md:hidden space-y-4">
        {lineItems.map((lineItem, index) => {
          const amount = lineItem.quantity * lineItem.unitPrice;
          const discount = lineItem.discount || 0;
          const total = amount - discount;
          const gstRate = getItemGstRate(lineItem.itemId);
          return (
            <div key={index} className="border rounded-lg p-4 space-y-4 bg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`item-${index}`}>Item</Label>
                  <Select
                    value={lineItem.itemId.toString()}
                    onValueChange={(value) => handleItemChange(index, value)}
                  >
                    <SelectTrigger id={`item-${index}`}>
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
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(index)}
                  className="text-destructive hover:text-destructive mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineItem.quantity}
                    onChange={(e) =>
                      updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`rate-${index}`}>Rate</Label>
                  <Input
                    id={`rate-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineItem.unitPrice}
                    onChange={(e) =>
                      updateLineItem(index, { unitPrice: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`discount-${index}`}>Discount</Label>
                  <Input
                    id={`discount-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineItem.discount || 0}
                    onChange={(e) =>
                      updateLineItem(index, { discount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST Rate</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                    <span className="text-sm font-medium">{gstRate}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addLineItem} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Line Item
        </Button>
        {onAddItem && (
          <Button type="button" variant="outline" onClick={onAddItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>
    </div>
  );
}
