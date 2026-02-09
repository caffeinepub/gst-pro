import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { GSTFilingStatus } from '../../backend';

interface GstProfileSectionProps {
  filingStatus: GSTFilingStatus;
}

export default function GstProfileSection({ filingStatus }: GstProfileSectionProps) {
  const getActiveStatusBadge = (isActive: boolean | null | undefined) => {
    if (isActive === null || isActive === undefined) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    if (isActive) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    );
  };

  const ProfileRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GST Profile</CardTitle>
        <CardDescription>
          Complete GST registration profile information from the GST portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* GSTIN */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b">
          <span className="text-sm font-medium text-muted-foreground">GSTIN</span>
          <span className="text-sm font-mono font-semibold">{filingStatus.gstin}</span>
        </div>

        {/* Status */}
        {(filingStatus.isActive !== undefined || filingStatus.gstStatus) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              {filingStatus.gstStatus && (
                <span className="text-sm">{filingStatus.gstStatus}</span>
              )}
              {filingStatus.isActive !== undefined && getActiveStatusBadge(filingStatus.isActive)}
            </div>
          </div>
        )}

        {/* Legal Name */}
        <ProfileRow label="Legal Name" value={filingStatus.legalName} />

        {/* Trade Name */}
        <ProfileRow label="Trade Name" value={filingStatus.tradeName} />

        {/* Taxpayer Type */}
        <ProfileRow label="Taxpayer Type" value={filingStatus.taxpayerType} />

        {/* State */}
        <ProfileRow label="State" value={filingStatus.state} />

        {/* Address */}
        <ProfileRow label="Address" value={filingStatus.address} />

        {/* Principal Place of Business */}
        <ProfileRow label="Principal Place of Business" value={filingStatus.principalPlaceOfBusiness} />

        {/* Nature of Business */}
        <ProfileRow label="Nature of Business" value={filingStatus.natureOfBusiness} />

        {/* Registration Date */}
        <ProfileRow label="Registration Date" value={filingStatus.registrationDate} />

        {/* Cancellation Date */}
        <ProfileRow label="Cancellation Date" value={filingStatus.cancellationDate} />

        {/* Filing Frequency */}
        <ProfileRow label="Filing Frequency" value={filingStatus.filingFrequencyDetails} />

        {/* Show message if no profile data available */}
        {!filingStatus.legalName &&
          !filingStatus.tradeName &&
          !filingStatus.taxpayerType &&
          !filingStatus.state &&
          !filingStatus.address &&
          filingStatus.isActive === undefined && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Profile information not available</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
