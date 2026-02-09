import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Invoice, Item, Customer, BusinessProfile } from '../../backend';
import { calculateInvoiceTotalsFromInvoice, formatCurrency } from '../../utils/gstCalculations';
import { getInvoiceYear, getInvoiceMonth } from '../../utils/dateFormat';
import { FileText, TrendingUp } from 'lucide-react';

interface MonthlyInvoiceSummaryProps {
  invoices: Invoice[];
  items: Item[];
  customers: Customer[];
  businessProfile?: BusinessProfile | null;
  selectedMonth?: string;
  selectedYear?: string;
}

interface MonthlySummary {
  month: string;
  year: string;
  invoiceCount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
}

export default function MonthlyInvoiceSummary({
  invoices,
  items,
  customers,
  businessProfile,
  selectedMonth,
  selectedYear,
}: MonthlyInvoiceSummaryProps) {
  const monthlySummaries = useMemo(() => {
    const summaryMap = new Map<string, MonthlySummary>();

    invoices.forEach((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customerId);
      const totals = calculateInvoiceTotalsFromInvoice(invoice, items, businessProfile, customer);

      const year = getInvoiceYear(invoice.invoiceDate);
      const month = getInvoiceMonth(invoice.invoiceDate);
      const key = `${year}-${month}`;

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          month,
          year,
          invoiceCount: 0,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalGst: 0,
          grandTotal: 0,
        });
      }

      const summary = summaryMap.get(key)!;
      summary.invoiceCount += 1;
      summary.taxableValue += totals.taxableAmount;
      summary.cgst += totals.cgst;
      summary.sgst += totals.sgst;
      summary.igst += totals.igst;
      summary.totalGst += totals.cgst + totals.sgst + totals.igst;
      summary.grandTotal += totals.grandTotal;
    });

    // Convert to array and sort by year-month descending
    return Array.from(summaryMap.values()).sort((a, b) => {
      const keyA = `${a.year}-${a.month}`;
      const keyB = `${b.year}-${b.month}`;
      return keyB.localeCompare(keyA);
    });
  }, [invoices, items, customers, businessProfile]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMonthName = (monthNum: string): string => {
    const index = parseInt(monthNum, 10) - 1;
    return monthNames[index] || monthNum;
  };

  // If specific month/year is selected, show only that summary
  const displaySummaries = useMemo(() => {
    if (selectedMonth && selectedYear) {
      return monthlySummaries.filter(
        (s) => s.month === selectedMonth && s.year === selectedYear
      );
    } else if (selectedYear) {
      return monthlySummaries.filter((s) => s.year === selectedYear);
    } else if (selectedMonth) {
      return monthlySummaries.filter((s) => s.month === selectedMonth);
    }
    return monthlySummaries;
  }, [monthlySummaries, selectedMonth, selectedYear]);

  if (displaySummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Summary
          </CardTitle>
          <CardDescription>
            No invoice data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Create invoices to see monthly summaries</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Monthly Summary
        </CardTitle>
        <CardDescription>
          {selectedMonth && selectedYear
            ? `Summary for ${getMonthName(selectedMonth)} ${selectedYear}`
            : selectedYear
            ? `Summary for ${selectedYear}`
            : selectedMonth
            ? `Summary for ${getMonthName(selectedMonth)} (all years)`
            : 'Summary by month'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Taxable Value</TableHead>
                <TableHead className="text-right">CGST</TableHead>
                <TableHead className="text-right">SGST</TableHead>
                <TableHead className="text-right">IGST</TableHead>
                <TableHead className="text-right">Total GST</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySummaries.map((summary) => (
                <TableRow key={`${summary.year}-${summary.month}`}>
                  <TableCell className="font-medium">
                    {getMonthName(summary.month)} {summary.year}
                  </TableCell>
                  <TableCell className="text-right">{summary.invoiceCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.taxableValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.cgst)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.sgst)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.igst)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(summary.totalGst)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(summary.grandTotal)}</TableCell>
                </TableRow>
              ))}
              {displaySummaries.length > 1 && (
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {displaySummaries.reduce((sum, s) => sum + s.invoiceCount, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.taxableValue, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.cgst, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.sgst, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.igst, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.totalGst, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.grandTotal, 0))}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {displaySummaries.map((summary) => (
            <Card key={`${summary.year}-${summary.month}`} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {getMonthName(summary.month)} {summary.year}
                </CardTitle>
                <CardDescription>{summary.invoiceCount} invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxable Value:</span>
                  <span className="font-medium">{formatCurrency(summary.taxableValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGST:</span>
                  <span>{formatCurrency(summary.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SGST:</span>
                  <span>{formatCurrency(summary.sgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGST:</span>
                  <span>{formatCurrency(summary.igst)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground font-medium">Total GST:</span>
                  <span className="font-medium">{formatCurrency(summary.totalGst)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(summary.grandTotal)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {displaySummaries.length > 1 && (
            <Card className="border-2 border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Overall Total</CardTitle>
                <CardDescription>
                  {displaySummaries.reduce((sum, s) => sum + s.invoiceCount, 0)} invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxable Value:</span>
                  <span className="font-medium">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.taxableValue, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total GST:</span>
                  <span className="font-medium">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.totalGst, 0))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(displaySummaries.reduce((sum, s) => sum + s.grandTotal, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
