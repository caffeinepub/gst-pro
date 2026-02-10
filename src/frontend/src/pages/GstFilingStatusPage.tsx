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
import { Loader2, RefreshCw, CheckCircle2, Clock, Search } from 'lucide-react';
import { ReturnType_, FilingFrequency } from '../backend';
import { getUserFacingError } from '../utils/userFacingError';
import { getFinancialYears } from '../utils/financialYears';
import { normalizeFilingStatus, getStatusBadgeVariant } from '../utils/gstFilingStatusDisplay';
import GstProfileSection from '../components/gst/GstProfileSection';

export default function GstFilingStatusPage() {
  const { data: businessProfile } = useGetBusinessProfile();
  const [searchGstin, setSearchGstin] = useState('');
  const [queriedGstin, setQueriedGstin] = useState('');
  const [selectedFY, setSelectedFY] = useState('');
  const [selectedReturnType, setSelectedReturnType] = useState<ReturnType_>(ReturnType_.gstr3b);
  const [selectedFrequency, setSelectedFrequency] = useState<FilingFrequency>(FilingFrequency.monthly);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const financialYears = getFinancialYears();

  // Initialize search GSTIN from business profile
  useEffect(() => {
    if (businessProfile?.gstin && !searchGstin) {
      setSearchGstin(businessProfile.gstin);
    }
  }, [businessProfile, searchGstin]);

  // Initialize selected FY to current FY
  useEffect(() => {
    if (financialYears.length > 0 && !selectedFY) {
      setSelectedFY(financialYears[0]);
    }
  }, [financialYears, selectedFY]);

  // Build period string based on FY and frequency
  const getPeriod = () => {
    if (!selectedFY) return '';
    return selectedFY;
  };

  const period = getPeriod();

  const {
    data: filingStatus,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetGstFilingStatus(queriedGstin, period, selectedReturnType, selectedFrequency);

  const handleSearch = () => {
    const trimmedGstin = searchGstin.trim().toUpperCase();
    if (trimmedGstin.length === 15) {
      setQueriedGstin(trimmedGstin);
      setLastRefreshed(new Date());
    }
  };

  const handleRefresh = async () => {
    if (queriedGstin) {
      await refetch();
      setLastRefreshed(new Date());
    }
  };

  // Filter status entries by selected return type
  const filteredEntries = filingStatus?.statusEntries.filter(
    (entry) => entry.returnType === selectedReturnType
  ) || [];

  const getStatusBadge = (status: string, filingDate?: string) => {
    const normalized = normalizeFilingStatus(status);
    const variant = getStatusBadgeVariant(normalized.variant);

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

  // Check if we have an error from the backend
  const hasError = error || (filingStatus?.error);
  const errorMessage = hasError
    ? (filingStatus?.error?.message || getUserFacingError(error))
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GST Status</h1>
        <p className="text-muted-foreground">
          Search any GSTIN to view GST return filing status and profile information
        </p>
      </div>

      {/* GSTIN Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search GSTIN</CardTitle>
          <CardDescription>Enter any 15-character GSTIN to check filing status and profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="gstin-search">GSTIN</Label>
              <Input
                id="gstin-search"
                value={searchGstin}
                onChange={(e) => setSearchGstin(e.target.value.toUpperCase())}
                placeholder="e.g., 29ABCDE1234F1Z5"
                maxLength={15}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={handleSearch} className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
          {searchGstin.trim().length > 0 && searchGstin.trim().length !== 15 && (
            <p className="text-sm text-destructive mt-2">GSTIN must be exactly 15 characters</p>
          )}
        </CardContent>
      </Card>

      {/* Show content only after a search has been performed */}
      {queriedGstin && (
        <>
          {/* Filters Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Filing Status Filters</CardTitle>
                  <CardDescription>Select financial year, return type, and filing frequency</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fy-select">Financial Year</Label>
                  <Select value={selectedFY} onValueChange={setSelectedFY}>
                    <SelectTrigger id="fy-select">
                      <SelectValue placeholder="Select FY" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialYears.map((fy) => (
                        <SelectItem key={fy} value={fy}>
                          {fy}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency-select">Filing Frequency</Label>
                  <Select
                    value={selectedFrequency}
                    onValueChange={(value) => setSelectedFrequency(value as FilingFrequency)}
                  >
                    <SelectTrigger id="frequency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FilingFrequency.monthly}>Monthly</SelectItem>
                      <SelectItem value={FilingFrequency.quarterly}>Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {lastRefreshed && (
                <p className="text-xs text-muted-foreground">
                  Last refreshed: {lastRefreshed.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Error State */}
          {hasError && errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* GST Profile Section */}
          {filingStatus && !isLoading && !hasError && <GstProfileSection filingStatus={filingStatus} />}

          {/* Filing Status Table */}
          {filingStatus && !isLoading && !hasError && (
            <Card>
              <CardHeader>
                <CardTitle>Filing Status</CardTitle>
                <CardDescription>
                  View filing status for {selectedReturnType === ReturnType_.gstr3b ? 'GSTR-3B' : 'GSTR-1'} returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedReturnType} onValueChange={(value) => setSelectedReturnType(value as ReturnType_)}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value={ReturnType_.gstr3b}>GSTR-3B</TabsTrigger>
                    <TabsTrigger value={ReturnType_.gstr1}>GSTR-1</TabsTrigger>
                  </TabsList>

                  <TabsContent value={selectedReturnType} className="mt-0">
                    {filteredEntries.length > 0 ? (
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
                                <TableCell>{entry.filingDate || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No filing status data available for the selected period</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty state when no search has been performed */}
      {!queriedGstin && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Enter a GSTIN to get started</p>
              <p className="text-sm mt-2">Search any 15-character GSTIN to view GST profile and filing status</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
