import { useState, useEffect } from 'react';
import { useGetBusinessProfile, useSaveBusinessProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: businessProfile, isLoading } = useGetBusinessProfile();
  const saveProfile = useSaveBusinessProfile();

  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    gstin: '',
    state: '',
    invoicePrefix: 'INV',
    startingNumber: '1',
  });

  useEffect(() => {
    if (businessProfile) {
      setFormData({
        businessName: businessProfile.businessName,
        address: businessProfile.address,
        gstin: businessProfile.gstin,
        state: businessProfile.state,
        invoicePrefix: businessProfile.invoicePrefix,
        startingNumber: businessProfile.startingNumber.toString(),
      });
    }
  }, [businessProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        businessName: formData.businessName,
        address: formData.address,
        gstin: formData.gstin,
        state: formData.state,
        invoicePrefix: formData.invoicePrefix,
        startingNumber: BigInt(formData.startingNumber || '1'),
      });
      toast.success('Business profile saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save business profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and invoice settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your business details for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your business address"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN *</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="e.g., 29ABCDE1234F1Z5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Karnataka"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>Configure invoice numbering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  placeholder="e.g., INV"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingNumber">Starting Number</Label>
                <Input
                  id="startingNumber"
                  type="number"
                  min="1"
                  value={formData.startingNumber}
                  onChange={(e) => setFormData({ ...formData, startingNumber: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Preview: {formData.invoicePrefix}
              {formData.startingNumber.padStart(4, '0')}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saveProfile.isPending} className="gap-2">
          {saveProfile.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
