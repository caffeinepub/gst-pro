import { useState, useEffect } from 'react';
import { useGetBusinessProfile } from '../hooks/useQueries';
import { useGetGstFilingStatus } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle2, Clock, Edit2, Save, X, XCircle } from 'lucide-react';
import { ReturnType_, FilingFrequency } from '../backend';
import { getUserFacingError } from '../utils/userFacingError';
import { getFinancialYears } from '../utils/financialYears';
import { normalizeFilingStatus, getStatusBadgeVariant } from '../utils/gstFilingStatusDisplay';
import GstProfileSection from '../components/gst/GstProfileSection';

export default function GstFilingStatusPage() {
  const { data: businessProfile } = useGetBusinessProfile();
  const [gstin, setGstin] = useState('');
  const [isEditingGstin, setIsEditingGstin] = useState(false);
  const [editGstinValue, setEditGstinValue] = useState('');
  const [selectedFY, setSelectedFY] = useState('');
  const [selectedReturnType, setSelectedReturnType] = useState<ReturnType_>(ReturnType_.gstr3b);
  const [selectedFrequency, setSelectedFrequency] = useState<FilingFrequency>(FilingFrequency.monthly);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const financialYears = getFinancialYears();

  // Initialize GSTIN from business profile
  useEffect(() => {
    if (businessProfile?.gstin && !gstin) {
      setGstin(businessProfile.gstin);
      setEditGstinValue(businessProfile.gstin);
    }
  }, [businessProfile, gstin]);

  // Initialize selected FY to current FY
  useEffect(() => {
    if (financialYears.length > 0 && !selectedFY) {
      setSelectedFY(financialYears[0]);
    }
  }, [financialYears, selectedFY]);

  // Build period string based on FY and frequency
  const getPeriod = () => {
    if (!selectedFY) return '';
    // For the backend, we'll use the FY format (e.g., "2024-25")
    return selectedFY;
  };

  const period = getPeriod();

  const {
    data: filingStatus,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetGstFilingStatus(gstin, period, selectedReturnType, selectedFrequency);

  const handleRefresh = async () => {
    await refetch();
    setLastRefreshed(new Date());
  };

  const handleSaveGstin = () => {
    setGstin(editGstinValue);
    setIsEditingGstin(false);
  };

  const handleCancelEdit = () => {
    setEditGstinValue(gstin);
    setIsEditingGstin(false);
  };

  // Filter status entries by selected return type
  const filteredEntries = filingStatus?.statusEntries.filter(
    (entry) => entry.returnType === selectedReturnType
  ) || [];

  const getStatusBadge = (status: string, filingDate?: string) => {
    const normalized = normalizeFilingStatus(status);
    const variant = getStatusBadgeVariant(normalized.variant);

    // Show filing date if available and status is filed
    const displayText = normalized.variant === 'filed' && filingDate
      ? `${normalized.label} (${filingDate})`
      : normalized.label;

    if (normalized.variant === 'filed') {
      return (
        <Badge variant={variant} className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {displayText}
        </Badge>
      );
    }
    if (normalized.variant === 'notFiled') {
      return (
        <Badge variant={variant} className="gap-1">
          <Clock className="h-3 w-3" />
          {displayText}
        </Badge>
      );
    }
    return <Badge variant={variant}>{displayText}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GST Status</h1>
        <p className="text-muted-foreground">
          View your GST return filing status and profile information
        </p>
      </div>

      {/* GSTIN Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>GSTIN</CardTitle>
          <CardDescription>Enter your GSTIN to check filing status</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingGstin ? (
            <div className="flex flex-col sm:flex-row items-end gap-2">
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="gstin-edit">GSTIN</Label>
                <Input
                  id="gstin-edit"
                  value={editGstinValue}
                  onChange={(e) => setEditGstinValue(e.target.value.toUpperCase())}
                  placeholder="e.g., 29ABCDE1234F1Z5"
                  maxLength={15}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleSaveGstin} size="sm" className="gap-2 flex-1 sm:flex-none">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="gap-2 flex-1 sm:flex-none">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current GSTIN</p>
                <p className="text-lg font-mono font-semibold">{gstin || 'Not set'}</p>
              </div>
              <Button
                onClick={() => setIsEditingGstin(true)}
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filing Period & Type</CardTitle>
          <CardDescription>Select financial year, return type, and filing frequency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fy">Financial Year</Label>
              <Select value={selectedFY} onValueChange={setSelectedFY}>
                <SelectTrigger id="fy">
                  <SelectValue placeholder="Select FY" />
                </SelectTrigger>
                <SelectContent>
                  {financialYears.map((fy) => (
                    <SelectItem key={fy} value={fy}>
                      FY {fy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filing Frequency</Label>
              <Tabs
                value={selectedFrequency}
                onValueChange={(value) => setSelectedFrequency(value as FilingFrequency)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value={FilingFrequency.monthly}>Monthly</TabsTrigger>
                  <TabsTrigger value={FilingFrequency.quarterly}>Quarterly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleRefresh}
                disabled={!gstin || !period || isFetching}
                className="w-full gap-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh Status
                  </>
                )}
              </Button>
            </div>
          </div>

          {lastRefreshed && (
            <p className="text-xs text-muted-foreground">
              Last refreshed: {lastRefreshed.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{getUserFacingError(error)}</AlertDescription>
        </Alert>
      )}

      {/* Backend Error Display - Only show if error exists, don't render status table */}
      {filingStatus?.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {filingStatus.error.message || 'Failed to fetch GST filing status from the portal'}
          </AlertDescription>
        </Alert>
      )}

      {/* GST Profile Section - Only show if no backend error */}
      {filingStatus && !filingStatus.error && (
        <GstProfileSection filingStatus={filingStatus} />
      )}

      {/* Return Type Tabs and Filing Status Table - Only show if no backend error */}
      {filingStatus && !filingStatus.error && (
        <Card>
          <CardHeader>
            <CardTitle>Return Filing Status</CardTitle>
            <CardDescription>View whether returns are filed or not filed for each period</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedReturnType}
              onValueChange={(value) => setSelectedReturnType(value as ReturnType_)}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value={ReturnType_.gstr3b}>GSTR-3B</TabsTrigger>
                <TabsTrigger value={ReturnType_.gstr1}>GSTR-1</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedReturnType}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No filing status data available for the selected period.</p>
                    <p className="text-sm mt-2">Try refreshing or selecting a different period.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Filing Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{entry.periodLabel}</TableCell>
                            <TableCell>{getStatusBadge(entry.status, entry.filingDate || undefined)}</TableCell>
                            <TableCell>
                              {entry.filingDate || (
                                <span className="text-muted-foreground">Not available</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!gstin && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">No GSTIN configured</p>
              <p className="text-sm">
                Please enter your GSTIN above or configure it in your business profile settings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
