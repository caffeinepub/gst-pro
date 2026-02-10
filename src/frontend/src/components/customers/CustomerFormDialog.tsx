import { useState, useEffect } from 'react';
import { useAddCustomer, useEditCustomer } from '../../hooks/useQueries';
import { useBackendReady } from '../../hooks/useBackendReady';
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
  const { isReady, isConnecting, message } = useBackendReady();
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

    if (!isReady) {
      toast.error(message || 'Backend connection not ready');
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
      const userError = getUserFacingError(error);
      toast.error(userError);
    }
  };

  const isPending = addCustomer.isPending || editCustomer.isPending;
  const isSubmitDisabled = !isReady || isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update customer information' : 'Add a new customer to your records'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="billingAddress">
              Billing Address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="Enter billing address"
              rows={3}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
              disabled={isPending}
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

          <div>
            <Label htmlFor="gstin">GSTIN (Optional)</Label>
            <Input
              id="gstin"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              placeholder="15-character GSTIN"
              maxLength={15}
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Contact Info (Optional)</Label>
            <Input
              id="contactInfo"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Phone, email, etc."
              disabled={isPending}
            />
          </div>

          {!isReady && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Add'} Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
