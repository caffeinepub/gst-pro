import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  useGetInvoice,
  useCreateInvoice,
  useEditInvoice,
  useGetCustomers,
  useGetItems,
  useGetBusinessProfile,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import InvoiceLineItemsEditor from '../components/invoices/InvoiceLineItemsEditor';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';
import type { LineItem } from '../backend';
import { toast } from 'sonner';

export default function InvoiceEditorPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const invoiceId = params.invoiceId ? BigInt(params.invoiceId) : null;
  const isEditing = invoiceId !== null;

  const { data: invoice } = useGetInvoice(invoiceId);
  const { data: customers = [] } = useGetCustomers();
  const { data: items = [] } = useGetItems();
  const { data: businessProfile } = useGetBusinessProfile();
  const createInvoice = useCreateInvoice();
  const editInvoice = useEditInvoice();

  const [customerId, setCustomerId] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (invoice) {
      setCustomerId(invoice.customerId.toString());
      setLineItems(invoice.lineItems);
    }
  }, [invoice]);

  const selectedCustomer = customers.find((c) => c.id.toString() === customerId);
  const totals = calculateInvoiceTotals(lineItems, items, businessProfile, selectedCustomer);

  const handleSave = async () => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    try {
      if (isEditing && invoice) {
        await editInvoice.mutateAsync({
          id: invoice.id,
          customerId: BigInt(customerId),
          lineItems,
          status: invoice.status,
        });
        toast.success('Invoice updated successfully');
      } else {
        const newInvoice = await createInvoice.mutateAsync({
          customerId: BigInt(customerId),
          lineItems,
        });
        toast.success('Invoice created successfully');
        navigate({ to: '/invoices/$invoiceId', params: { invoiceId: newInvoice.id.toString() } });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save invoice');
    }
  };

  const isSaving = createInvoice.isPending || editInvoice.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Edit Invoice' : 'New Invoice'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update invoice details' : 'Create a new invoice'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Invoice
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id.toString()} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceLineItemsEditor
                lineItems={lineItems}
                onChange={setLineItems}
                availableItems={items}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">{formatCurrency(totals.totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span className="font-medium">{formatCurrency(totals.taxableAmount)}</span>
              </div>
              <div className="border-t pt-3 space-y-2">
                {totals.isInterState ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IGST</span>
                    <span className="font-medium">{formatCurrency(totals.igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST</span>
                      <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST</span>
                      <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
              {selectedCustomer && businessProfile && (
                <div className="text-xs text-muted-foreground pt-2">
                  {totals.isInterState ? 'Inter-state' : 'Intra-state'} transaction
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
