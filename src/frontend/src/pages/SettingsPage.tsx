import { useState, useEffect } from 'react';
import { useGetBusinessProfile, useSaveBusinessProfile } from '../hooks/useQueries';
import { useBackendReady } from '../hooks/useBackendReady';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { getUserFacingError } from '../utils/userFacingError';
import { ExternalBlob } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INDIAN_STATES } from '../utils/indianStates';
import { ScrollableSelectContent } from '../components/forms/ScrollableSelectContent';

export default function SettingsPage() {
  const { data: businessProfile, isLoading } = useGetBusinessProfile();
  const saveBusinessProfile = useSaveBusinessProfile();
  const { isReady, isConnecting, message } = useBackendReady();

  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    gstin: '',
    state: '',
    invoicePrefix: '',
    startingNumber: '1',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setFormData({
        businessName: businessProfile.businessName,
        address: businessProfile.address,
        gstin: businessProfile.gstin,
        state: businessProfile.state,
        invoicePrefix: businessProfile.invoicePrefix,
        startingNumber: businessProfile.startingNumber.toString(),
        accountName: businessProfile.bankingDetails?.accountName || '',
        accountNumber: businessProfile.bankingDetails?.accountNumber || '',
        ifscCode: businessProfile.bankingDetails?.ifscCode || '',
        bankName: businessProfile.bankingDetails?.bankName || '',
        branch: businessProfile.bankingDetails?.branch || '',
      });

      if (businessProfile.logo) {
        setLogoPreview(businessProfile.logo.getDirectURL());
      }
    }
  }, [businessProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.businessName.trim() ||
      !formData.address.trim() ||
      !formData.gstin.trim() ||
      !formData.state.trim() ||
      !formData.invoicePrefix.trim() ||
      !formData.startingNumber.trim()
    ) {
      toast.error('Please fill in all required business information fields');
      return;
    }

    const startingNum = parseInt(formData.startingNumber, 10);
    if (isNaN(startingNum) || startingNum < 1) {
      toast.error('Starting number must be a positive integer');
      return;
    }

    // Validate banking details: if any field is filled, all required fields must be filled
    const hasBankingData =
      formData.accountName.trim() ||
      formData.accountNumber.trim() ||
      formData.ifscCode.trim() ||
      formData.bankName.trim();

    if (hasBankingData) {
      if (
        !formData.accountName.trim() ||
        !formData.accountNumber.trim() ||
        !formData.ifscCode.trim() ||
        !formData.bankName.trim()
      ) {
        toast.error('Please fill in all required banking details fields (Account Name, Account Number, IFSC Code, Bank Name)');
        return;
      }
    }

    if (!isReady) {
      toast.error(message || 'Backend connection not ready');
      return;
    }

    try {
      let logoBlob: ExternalBlob | undefined = undefined;

      if (logoFile) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        logoBlob = ExternalBlob.fromBytes(uint8Array);
      } else if (!removeLogo && businessProfile?.logo) {
        logoBlob = businessProfile.logo;
      }

      const bankingDetails =
        hasBankingData
          ? {
              accountName: formData.accountName.trim(),
              accountNumber: formData.accountNumber.trim(),
              ifscCode: formData.ifscCode.trim(),
              bankName: formData.bankName.trim(),
              branch: formData.branch.trim() || undefined,
            }
          : undefined;

      await saveBusinessProfile.mutateAsync({
        businessName: formData.businessName,
        address: formData.address,
        gstin: formData.gstin,
        state: formData.state,
        invoicePrefix: formData.invoicePrefix,
        startingNumber: BigInt(startingNum),
        logo: logoBlob,
        bankingDetails,
      });

      toast.success('Business profile saved successfully');
    } catch (error: any) {
      const userError = getUserFacingError(error);
      toast.error(userError);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSaving = saveBusinessProfile.isPending;
  const isSubmitDisabled = !isReady || isSaving;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your business profile and invoice settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your business details for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Your Business Name"
                disabled={isSaving}
              />
            </div>

            <div>
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Business address"
                rows={3}
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstin">
                  GSTIN <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="15-character GSTIN"
                  maxLength={15}
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                  disabled={isSaving}
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking Details</CardTitle>
            <CardDescription>Bank account information for invoices (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="Account holder name"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Bank account number"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder="IFSC code"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Name of the bank"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="branch">Branch (Optional)</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Branch name or location"
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Configuration</CardTitle>
            <CardDescription>Configure invoice numbering and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoicePrefix">
                  Invoice Prefix <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  placeholder="e.g., INV"
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="startingNumber">
                  Starting Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startingNumber"
                  type="number"
                  min="1"
                  value={formData.startingNumber}
                  onChange={(e) => setFormData({ ...formData, startingNumber: e.target.value })}
                  placeholder="1"
                  disabled={isSaving}
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label>Invoice Logo (Optional)</Label>
              <div className="mt-2 space-y-4">
                {logoPreview && (
                  <div className="relative inline-block">
                    <img src={logoPreview} alt="Logo preview" className="h-24 w-auto border rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveLogo}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={isSaving}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a logo for your invoices (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isReady && (
          <Card className="border-muted-foreground/50">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                {message}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitDisabled}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
