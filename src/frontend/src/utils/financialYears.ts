/**
 * Generates a list of financial year options in "YYYY-YY" format
 * Financial year in India runs from April 1 to March 31
 */
export function getFinancialYears(): string[] {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January)

  // Determine the current financial year
  // If current month is Jan-Mar (0-2), FY started last year
  // If current month is Apr-Dec (3-11), FY started this year
  const currentFYStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;

  const years: string[] = [];

  // Generate last 5 financial years including current
  for (let i = 0; i < 5; i++) {
    const startYear = currentFYStartYear - i;
    const endYear = startYear + 1;
    const fyString = `${startYear}-${endYear.toString().slice(-2)}`;
    years.push(fyString);
  }

  return years;
}
