import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetInvoices, useGetCustomers, useGetItems, useGetBusinessProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText, Loader2, X } from 'lucide-react';
import InvoiceStatusBadge from '../components/invoices/InvoiceStatusBadge';
import MonthlyInvoiceSummary from '../components/invoices/MonthlyInvoiceSummary';
import { formatInvoiceDate, getInvoiceYear, getInvoiceMonth } from '../utils/dateFormat';
import { getDisplayInvoiceNumber } from '../utils/invoiceNumbering';
import { InvoiceStatus, InvoiceType } from '../backend';
import type { Invoice } from '../backend';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading } = useGetInvoices();
  const { data: customers = [] } = useGetCustomers();
  const { data: items = [] } = useGetItems();
  const { data: businessProfile } = useGetBusinessProfile();

  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    invoices.forEach((invoice) => {
      const year = getInvoiceYear(invoice.invoiceDate);
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [invoices]);

  const availableMonths = useMemo(() => {
    if (yearFilter === 'all') return [];
    const months = new Set<string>();
    invoices.forEach((invoice) => {
      const year = getInvoiceYear(invoice.invoiceDate);
      if (year === yearFilter) {
        const month = getInvoiceMonth(invoice.invoiceDate);
        if (month) months.add(month);
      }
    });
    return Array.from(months).sort();
  }, [invoices, yearFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;
      if (dateFilter && invoice.invoiceDate !== dateFilter) return false;
      if (yearFilter !== 'all') {
        const year = getInvoiceYear(invoice.invoiceDate);
        if (year !== yearFilter) return false;
      }
      if (monthFilter !== 'all') {
        const month = getInvoiceMonth(invoice.invoiceDate);
        if (month !== monthFilter) return false;
      }
      return true;
    });
  }, [invoices, statusFilter, dateFilter, yearFilter, monthFilter]);

  const hasActiveFilters = statusFilter !== 'all' || dateFilter || yearFilter !== 'all' || monthFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setYearFilter('all');
    setMonthFilter('all');
  };

  const getCustomerName = (customerId: bigint) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getInvoiceTypeLabel = (invoiceType: InvoiceType) => {
    return invoiceType === InvoiceType.transportation ? 'Transportation' : 'Original';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage and track your invoices</p>
        </div>
        <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <MonthlyInvoiceSummary
        invoices={filteredInvoices}
        items={items}
        customers={customers}
        businessProfile={businessProfile}
        selectedMonth={monthFilter !== 'all' ? monthFilter : undefined}
        selectedYear={yearFilter !== 'all' ? yearFilter : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle>Filter Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={InvoiceStatus.draft}>Draft</TabsTrigger>
                <TabsTrigger value={InvoiceStatus.finalized}>Finalized</TabsTrigger>
                <TabsTrigger value={InvoiceStatus.cancelled}>Canceled</TabsTrigger>
              </TabsList>
            </Tabs>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2 shrink-0">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="year-filter">Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger id="year-filter">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month-filter">Month</Label>
              <Select
                value={monthFilter}
                onValueChange={setMonthFilter}
                disabled={yearFilter === 'all'}
              >
                <SelectTrigger id="month-filter">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Specific Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters or create a new invoice to get started.'
                  : 'Create your first invoice to get started.'}
              </p>
              <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id.toString()}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate({
                            to: '/invoices/$invoiceId',
                            params: { invoiceId: invoice.id.toString() },
                          })
                        }
                      >
                        <TableCell className="font-medium">
                          {getDisplayInvoiceNumber(invoice, businessProfile)}
                        </TableCell>
                        <TableCell>{getInvoiceTypeLabel(invoice.invoiceType)}</TableCell>
                        <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                        <TableCell>{formatInvoiceDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({
                                to: '/invoices/$invoiceId',
                                params: { invoiceId: invoice.id.toString() },
                              });
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card
                    key={invoice.id.toString()}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      navigate({
                        to: '/invoices/$invoiceId',
                        params: { invoiceId: invoice.id.toString() },
                      })
                    }
                  >
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {getDisplayInvoiceNumber(invoice, businessProfile)}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {getCustomerName(invoice.customerId)}
                          </p>
                        </div>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {getInvoiceTypeLabel(invoice.invoiceType)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatInvoiceDate(invoice.invoiceDate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
