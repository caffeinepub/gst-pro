import { useState, useEffect } from 'react';
import { useAddCustomer, useEditCustomer } from '../../hooks/useQueries';
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
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollableSelectContent } from '../forms/ScrollableSelectContent';
import { Loader2 } from 'lucide-react';
import type { Customer } from '../../backend';
import { toast } from 'sonner';
import { getUserFacingError } from '../../utils/userFacingError';
import { INDIAN_STATES } from '../../utils/indianStates';

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess?: (customer: Customer) => void;
}

export default function CustomerFormDialog({ open, onClose, customer, onSuccess }: CustomerFormDialogProps) {
  const addCustomer = useAddCustomer();
  const editCustomer = useEditCustomer();
  const isEditing = customer !== null;

  const [formData, setFormData] = useState({
    name: '',
    billingAddress: '',
    gstin: '',
    state: '',
    contactInfo: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        billingAddress: customer.billingAddress,
        gstin: customer.gstin || '',
        state: customer.state,
        contactInfo: customer.contactInfo || '',
      });
    } else {
      setFormData({
        name: '',
        billingAddress: '',
        gstin: '',
        state: '',
        contactInfo: '',
      });
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.billingAddress.trim() || !formData.state.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditing) {
        await editCustomer.mutateAsync({
          id: customer.id,
          name: formData.name,
          billingAddress: formData.billingAddress,
          gstin: formData.gstin || null,
          state: formData.state,
          contactInfo: formData.contactInfo || null,
        });
        toast.success('Customer updated successfully');
        onClose();
      } else {
        const newCustomer = await addCustomer.mutateAsync({
          name: formData.name,
          billingAddress: formData.billingAddress,
          gstin: formData.gstin || null,
          state: formData.state,
          contactInfo: formData.contactInfo || null,
        });
        toast.success('Customer added successfully');
        onClose();
        if (onSuccess) {
          onSuccess(newCustomer);
        }
      }
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      toast.error(errorMessage);
    }
  };

  const isSaving = addCustomer.isPending || editCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update customer information' : 'Add a new customer to your database'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address *</Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="Enter billing address"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
              required
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <ScrollableSelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </ScrollableSelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              placeholder="e.g., 29ABCDE1234F1Z5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Info</Label>
            <Input
              id="contactInfo"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Phone or email"
            />
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
                'Add Customer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
