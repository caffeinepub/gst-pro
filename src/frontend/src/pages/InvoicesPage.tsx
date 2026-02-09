import { useState, useMemo } from 'react';
import { useGetInvoices, useGetCustomers, useGetItems, useGetBusinessProfile } from '../hooks/useQueries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2, X, Calendar as CalendarIcon } from 'lucide-react';
import { InvoiceStatus } from '../backend';
import { formatInvoiceNumber } from '../utils/invoiceNumbering';
import { formatInvoiceDate } from '../utils/dateFormat';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInvoiceYear, getInvoiceMonth } from '../utils/dateFormat';
import MonthlyInvoiceSummary from '../components/invoices/MonthlyInvoiceSummary';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { status?: 'draft' | 'finalized' };
  const { data: invoices = [], isLoading } = useGetInvoices();
  const { data: customers = [] } = useGetCustomers();
  const { data: items = [] } = useGetItems();
  const { data: businessProfile } = useGetBusinessProfile();

  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>(
    search.status || 'all'
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Generate year options (current year and past 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, []);

  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Apply status filter
    if (statusFilter === 'draft') {
      filtered = filtered.filter((inv) => inv.status === InvoiceStatus.draft);
    } else if (statusFilter === 'finalized') {
      filtered = filtered.filter((inv) => inv.status === InvoiceStatus.finalized);
    }

    // Apply date filter (specific date)
    if (selectedDate) {
      filtered = filtered.filter((inv) => inv.invoiceDate === selectedDate);
    }

    // Apply month/year filter (only if no specific date is selected)
    if (!selectedDate && (selectedMonth || selectedYear)) {
      filtered = filtered.filter((inv) => {
        const invYear = getInvoiceYear(inv.invoiceDate);
        const invMonth = getInvoiceMonth(inv.invoiceDate);
        
        if (selectedYear && invYear !== selectedYear) return false;
        if (selectedMonth && invMonth !== selectedMonth) return false;
        
        return true;
      });
    }

    return filtered;
  }, [invoices, statusFilter, selectedDate, selectedMonth, selectedYear]);

  const getCustomerName = (customerId: bigint) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const handleInvoiceClick = (invoiceId: bigint) => {
    navigate({ to: `/invoices/${invoiceId.toString()}` });
  };

  const handleFilterChange = (value: string) => {
    const newFilter = value as 'all' | 'draft' | 'finalized';
    setStatusFilter(newFilter);
    if (newFilter === 'all') {
      navigate({ to: '/invoices', search: {} });
    } else {
      navigate({ to: '/invoices', search: { status: newFilter } });
    }
  };

  const handleClearFilters = () => {
    setSelectedDate('');
    setSelectedMonth('');
    setSelectedYear('');
    setStatusFilter('all');
    navigate({ to: '/invoices', search: {} });
  };

  const hasActiveFilters = selectedDate || selectedMonth || selectedYear || statusFilter !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your GST invoices</p>
        </div>
        <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={statusFilter} onValueChange={handleFilterChange}>
            <TabsList>
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="finalized">Finalized</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  // Clear month/year when specific date is selected
                  if (e.target.value) {
                    setSelectedMonth('');
                    setSelectedYear('');
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-month">Month</Label>
              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value);
                  // Clear specific date when month is selected
                  if (value) setSelectedDate('');
                }}
                disabled={!!selectedDate}
              >
                <SelectTrigger id="invoice-month">
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All months</SelectItem>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-year">Year</Label>
              <Select
                value={selectedYear}
                onValueChange={(value) => {
                  setSelectedYear(value);
                  // Clear specific date when year is selected
                  if (value) setSelectedDate('');
                }}
                disabled={!!selectedDate}
              >
                <SelectTrigger id="invoice-year">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All years</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <MonthlyInvoiceSummary
        invoices={filteredInvoices}
        items={items}
        customers={customers}
        businessProfile={businessProfile}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Invoices Found</CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? 'No invoices match the selected filters'
                : 'Get started by creating your first invoice'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveFilters ? (
              <Button onClick={handleClearFilters} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate({ to: '/invoices/new' })} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
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
                    onClick={() => handleInvoiceClick(invoice.id)}
                  >
                    <TableCell className="font-medium">
                      {businessProfile
                        ? formatInvoiceNumber(invoice.id, businessProfile)
                        : invoice.id.toString()}
                    </TableCell>
                    <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                    <TableCell>{formatInvoiceDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === InvoiceStatus.draft ? 'secondary' : 'default'}>
                        {invoice.status === InvoiceStatus.draft ? 'Draft' : 'Finalized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvoiceClick(invoice.id);
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

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card
                key={invoice.id.toString()}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleInvoiceClick(invoice.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {businessProfile
                          ? formatInvoiceNumber(invoice.id, businessProfile)
                          : invoice.id.toString()}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {getCustomerName(invoice.customerId)}
                      </CardDescription>
                    </div>
                    <Badge variant={invoice.status === InvoiceStatus.draft ? 'secondary' : 'default'}>
                      {invoice.status === InvoiceStatus.draft ? 'Draft' : 'Finalized'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatInvoiceDate(invoice.invoiceDate)}</span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
