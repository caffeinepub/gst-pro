import { useState, useEffect } from 'react';
import { useGetBusinessProfile, useSaveBusinessProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollableSelectContent } from '../components/forms/ScrollableSelectContent';
import { Save, Loader2, Upload, X, Image as ImageIcon, FileCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getUserFacingError } from '../utils/userFacingError';
import { INDIAN_STATES } from '../utils/indianStates';
import { ExternalBlob } from '../backend';
import { Link } from '@tanstack/react-router';

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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<ExternalBlob | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
      
      if (businessProfile.logo) {
        setExistingLogo(businessProfile.logo);
        setLogoPreview(businessProfile.logo.getDirectURL());
      } else {
        setExistingLogo(null);
        setLogoPreview(null);
      }
    }
  }, [businessProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG or JPG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setExistingLogo(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    if (!formData.state.trim()) {
      toast.error('State is required');
      return;
    }

    try {
      let logoBlob: ExternalBlob | undefined = undefined;

      if (logoFile) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        logoBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (existingLogo) {
        logoBlob = existingLogo;
      }

      await saveProfile.mutateAsync({
        businessName: formData.businessName,
        address: formData.address,
        gstin: formData.gstin,
        state: formData.state,
        invoicePrefix: formData.invoicePrefix,
        startingNumber: BigInt(formData.startingNumber || '1'),
        logo: logoBlob,
      });
      toast.success('Business profile saved successfully');
      setUploadProgress(0);
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      toast.error(errorMessage);
      setUploadProgress(0);
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Invoice Logo</Label>
              <div className="space-y-3">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Business logo preview"
                      className="h-24 w-auto border rounded-md object-contain bg-muted"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleClearLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 w-32 border-2 border-dashed rounded-md bg-muted/50">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo')?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearLogo}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG, max 5MB. Logo will appear on printed invoices.
                </p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
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

        <Card>
          <CardHeader>
            <CardTitle>GST Filing</CardTitle>
            <CardDescription>View your GST return filing status</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/gst-filing-status">
              <Button type="button" variant="outline" className="gap-2">
                <FileCheck className="h-4 w-4" />
                View GST Filing Status
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
