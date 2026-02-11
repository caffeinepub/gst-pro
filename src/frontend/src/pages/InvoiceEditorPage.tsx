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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import InvoiceLineItemsEditor from '../components/invoices/InvoiceLineItemsEditor';
import CustomerFormDialog from '../components/customers/CustomerFormDialog';
import ItemFormDialog from '../components/items/ItemFormDialog';
import { calculateInvoiceTotals } from '../utils/gstCalculations';
import { formatCurrency } from '../utils/formatters';
import { getTodayISODate } from '../utils/dateFormat';
import { formatInvoiceNumber } from '../utils/invoiceNumbering';
import { ScrollableSelectContent } from '../components/forms/ScrollableSelectContent';
import type { LineItem, Customer, Item } from '../backend';
import { InvoiceType } from '../backend';
import { toast } from 'sonner';
import { getUserFacingError } from '../utils/userFacingError';

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
  const [invoiceDate, setInvoiceDate] = useState<string>(getTodayISODate());
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState<string>('');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(InvoiceType.original);
  const [billToAddress, setBillToAddress] = useState<string>('');
  const [shipToAddress, setShipToAddress] = useState<string>('');
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  // Auto-fill invoice number for new invoices
  useEffect(() => {
    if (!isEditing && businessProfile && !invoiceNumber) {
      const nextId = BigInt(1);
      const defaultNumber = formatInvoiceNumber(nextId, businessProfile);
      setInvoiceNumber(defaultNumber);
    }
  }, [isEditing, businessProfile, invoiceNumber]);

  // Load invoice data when editing
  useEffect(() => {
    if (invoice) {
      setCustomerId(invoice.customerId.toString());
      setLineItems(invoice.lineItems);
      setInvoiceDate(invoice.invoiceDate || getTodayISODate());
      setInvoiceNumber(invoice.invoiceNumber || '');
      setPurchaseOrderNumber(invoice.purchaseOrderNumber || '');
      setInvoiceType(invoice.invoiceType || InvoiceType.original);
      
      // Load address overrides if they exist
      if (invoice.billToOverride) {
        const addr = invoice.billToOverride;
        const formatted = `${addr.name}\n${addr.addressLine1}${addr.addressLine2 ? '\n' + addr.addressLine2 : ''}\n${addr.city}, ${addr.state} - ${addr.pinCode}\nContact: ${addr.contactPerson}${addr.phoneNumber ? '\nPhone: ' + addr.phoneNumber : ''}${addr.gstin ? '\nGSTIN: ' + addr.gstin : ''}`;
        setBillToAddress(formatted);
      }
      if (invoice.shipToOverride) {
        const addr = invoice.shipToOverride;
        const formatted = `${addr.name}\n${addr.addressLine1}${addr.addressLine2 ? '\n' + addr.addressLine2 : ''}\n${addr.city}, ${addr.state} - ${addr.pinCode}\nContact: ${addr.contactPerson}${addr.phoneNumber ? '\nPhone: ' + addr.phoneNumber : ''}${addr.gstin ? '\nGSTIN: ' + addr.gstin : ''}`;
        setShipToAddress(formatted);
      }
    }
  }, [invoice]);

  // Auto-fill addresses when customer changes (only for new invoices or when addresses are empty)
  useEffect(() => {
    const selectedCustomer = customers.find((c) => c.id.toString() === customerId);
    if (selectedCustomer && !isEditing) {
      // For new invoices, default to customer's billing address
      if (!billToAddress) {
        setBillToAddress(selectedCustomer.billingAddress);
      }
      if (!shipToAddress) {
        setShipToAddress(selectedCustomer.billingAddress);
      }
    }
  }, [customerId, customers, isEditing, billToAddress, shipToAddress]);

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

    if (!invoiceDate) {
      toast.error('Please select an invoice date');
      return;
    }

    // Parse addresses into AddressDetails format (simplified - using text as-is)
    const billToOverride = billToAddress.trim() ? {
      name: selectedCustomer?.name || '',
      addressLine1: billToAddress.trim(),
      addressLine2: undefined,
      city: selectedCustomer?.state || '',
      state: selectedCustomer?.state || '',
      pinCode: '',
      contactPerson: '',
      phoneNumber: undefined,
      gstin: selectedCustomer?.gstin || undefined,
    } : null;

    const shipToOverride = shipToAddress.trim() ? {
      name: selectedCustomer?.name || '',
      addressLine1: shipToAddress.trim(),
      addressLine2: undefined,
      city: selectedCustomer?.state || '',
      state: selectedCustomer?.state || '',
      pinCode: '',
      contactPerson: '',
      phoneNumber: undefined,
      gstin: selectedCustomer?.gstin || undefined,
    } : null;

    try {
      if (isEditing && invoice) {
        await editInvoice.mutateAsync({
          id: invoice.id,
          invoiceNumber: invoiceNumber.trim(),
          purchaseOrderNumber: purchaseOrderNumber.trim() || null,
          customerId: BigInt(customerId),
          lineItems,
          status: invoice.status,
          invoiceDate,
          invoiceType,
          billToOverride,
          shipToOverride,
        });
        toast.success('Invoice updated successfully');
      } else {
        const newInvoice = await createInvoice.mutateAsync({
          invoiceNumber: invoiceNumber.trim(),
          purchaseOrderNumber: purchaseOrderNumber.trim() || null,
          customerId: BigInt(customerId),
          lineItems,
          invoiceDate,
          invoiceType,
          billToOverride,
          shipToOverride,
        });
        toast.success('Invoice created successfully');
        navigate({ to: '/invoices/$invoiceId', params: { invoiceId: newInvoice.id.toString() } });
      }
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      toast.error(errorMessage);
    }
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomerId(newCustomer.id.toString());
  };

  const handleItemAdded = (newItem: Item) => {
    setLineItems([
      ...lineItems,
      {
        itemId: newItem.id,
        quantity: 1,
        unitPrice: newItem.unitPrice,
        discount: 0,
      },
    ]);
  };

  const isSaving = createInvoice.isPending || editInvoice.isPending;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 w-full sm:w-auto">
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
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceType">Invoice Type</Label>
                  <Select
                    value={invoiceType}
                    onValueChange={(value) => setInvoiceType(value as InvoiceType)}
                  >
                    <SelectTrigger id="invoiceType">
                      <SelectValue placeholder="Select invoice type" />
                    </SelectTrigger>
                    <ScrollableSelectContent>
                      <SelectItem value={InvoiceType.original}>Original Invoice</SelectItem>
                      <SelectItem value={InvoiceType.transportation}>Transportation Invoice</SelectItem>
                    </ScrollableSelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <div className="flex gap-2">
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger id="customer" className="flex-1">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <ScrollableSelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id.toString()} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </ScrollableSelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCustomerDialogOpen(true)}
                      title="Add Customer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g., INV-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseOrderNumber">Purchase Order Number (Optional)</Label>
                  <Input
                    id="purchaseOrderNumber"
                    type="text"
                    value={purchaseOrderNumber}
                    onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                    placeholder="e.g., PO-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billToAddress">Bill To Address</Label>
                  <Textarea
                    id="billToAddress"
                    value={billToAddress}
                    onChange={(e) => setBillToAddress(e.target.value)}
                    placeholder="Enter billing address"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Edit this address if needed. Defaults to customer's billing address.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipToAddress">Ship To Address</Label>
                  <Textarea
                    id="shipToAddress"
                    value={shipToAddress}
                    onChange={(e) => setShipToAddress(e.target.value)}
                    placeholder="Enter shipping address"
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Edit this address if needed. Defaults to customer's billing address.
                  </p>
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
                  onAddItem={() => setItemDialogOpen(true)}
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

      <CustomerFormDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        customer={null}
        onSuccess={handleCustomerAdded}
      />

      <ItemFormDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        item={null}
        onSuccess={handleItemAdded}
      />
    </>
  );
}
