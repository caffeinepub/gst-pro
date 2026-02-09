import { useState, useEffect } from 'react';
import { useAddItem, useEditItem } from '../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { Item } from '../../backend';
import { toast } from 'sonner';

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}

export default function ItemFormDialog({ open, onClose, item }: ItemFormDialogProps) {
  const addItem = useAddItem();
  const editItem = useEditItem();
  const isEditing = item !== null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsnSac: '',
    unitPrice: '',
    defaultGstRate: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        hsnSac: item.hsnSac || '',
        unitPrice: item.unitPrice.toString(),
        defaultGstRate: item.defaultGstRate.toString(),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        hsnSac: '',
        unitPrice: '',
        defaultGstRate: '18',
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.unitPrice || !formData.defaultGstRate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const unitPrice = parseFloat(formData.unitPrice);
    const gstRate = parseFloat(formData.defaultGstRate);

    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    if (isNaN(gstRate) || gstRate < 0 || gstRate > 100) {
      toast.error('Please enter a valid GST rate (0-100)');
      return;
    }

    try {
      if (isEditing) {
        await editItem.mutateAsync({
          id: item.id,
          name: formData.name,
          description: formData.description || null,
          hsnSac: formData.hsnSac || null,
          unitPrice,
          defaultGstRate: gstRate,
        });
        toast.success('Item updated successfully');
      } else {
        await addItem.mutateAsync({
          name: formData.name,
          description: formData.description || null,
          hsnSac: formData.hsnSac || null,
          unitPrice,
          defaultGstRate: gstRate,
        });
        toast.success('Item added successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    }
  };

  const isSaving = addItem.isPending || editItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update item information' : 'Add a new item to your catalog'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Item or service name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hsnSac">HSN/SAC Code (Optional)</Label>
            <Input
              id="hsnSac"
              value={formData.hsnSac}
              onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
              placeholder="e.g., 998314"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultGstRate">GST Rate (%) *</Label>
              <Input
                id="defaultGstRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.defaultGstRate}
                onChange={(e) => setFormData({ ...formData, defaultGstRate: e.target.value })}
                placeholder="18"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update'
              ) : (
                'Add Item'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
