/**
 * Indian Financial Year (FY) Utility
 * 
 * Official Income Tax & Section 80G/10BD Compliance Standard:
 * - Begins: April 1st of Year N
 * - Ends: March 31st of Year N+1
 * 
 * Examples:
 * - 01-Apr-2026 -> "2026-27" (Label: "FY 2026-27")
 * - 31-Mar-2026 -> "2025-26" (Label: "FY 2025-26")
 * - 31-Mar-2027 -> "2026-27" (Label: "FY 2026-27")
 * - 01-Apr-2027 -> "2027-28" (Label: "FY 2027-28")
 */

/**
 * Calculates the Indian Financial Year string for a given date.
 * Returns normalized format "YYYY-YY" (e.g., "2026-27").
 */
export function getFinancialYear(dateInput?: Date | string | number | null): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  
  if (isNaN(date.getTime())) {
    const fallback = new Date();
    return getFinancialYear(fallback);
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr, 11 = Dec

  // If month is Jan(0), Feb(1), or Mar(2), it belongs to previous year's FY
  if (month < 3) {
    const startYear = year - 1;
    const endYearTwoDigit = String(year).slice(-2);
    return `${startYear}-${endYearTwoDigit}`;
  } else {
    const startYear = year;
    const endYearTwoDigit = String(year + 1).slice(-2);
    return `${startYear}-${endYearTwoDigit}`;
  }
}

/**
 * Returns the current active Financial Year string (e.g. "2026-27").
 */
export function getCurrentFinancialYear(): string {
  return getFinancialYear(new Date());
}

/**
 * Formats a financial year string into official display format (e.g. "2026-27" -> "FY 2026-27").
 */
export function formatFinancialYear(fy?: string | null): string {
  if (!fy) return 'FY ' + getCurrentFinancialYear();
  const clean = fy.trim().replace(/^FY\s*/i, '');
  return `FY ${clean}`;
}

/**
 * Validates whether a string matches Indian Financial Year format "YYYY-YY" (e.g., "2026-27").
 */
export function isValidFinancialYear(fy: string): boolean {
  if (!fy) return false;
  const clean = fy.trim().replace(/^FY\s*/i, '');
  if (!/^\d{4}-\d{2}$/.test(clean)) return false;
  
  const [startYearStr, endYearStr] = clean.split('-');
  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);
  
  return (startYear + 1) % 100 === endYear;
}

/**
 * Returns the exact Date range [startDate, endDate] for a given Financial Year.
 * E.g., for "2026-27":
 * - startDate: 2026-04-01T00:00:00.000Z (local time conversion)
 * - endDate: 2027-03-31T23:59:59.999Z
 */
export function getFinancialYearRange(fyInput: string): { startDate: Date; endDate: Date } {
  const clean = fyInput.trim().replace(/^FY\s*/i, '');
  
  let startYear: number;
  if (/^\d{4}-\d{2}$/.test(clean)) {
    startYear = parseInt(clean.split('-')[0], 10);
  } else {
    startYear = new Date().getMonth() < 3 ? new Date().getFullYear() - 1 : new Date().getFullYear();
  }

  const startDate = new Date(startYear, 3, 1, 0, 0, 0, 0); // April 1st 00:00:00
  const endDate = new Date(startYear + 1, 2, 31, 23, 59, 59, 999); // March 31st 23:59:59.999

  return { startDate, endDate };
}

/**
 * Returns a list of Indian Financial Years for selection dropdowns.
 * Defaults to current FY plus 3 previous years and 1 upcoming year.
 */
export function getFinancialYearList(countBack: number = 4, countForward: number = 1): string[] {
  const currentFy = getCurrentFinancialYear();
  const currentStartYear = parseInt(currentFy.split('-')[0], 10);
  
  const list: string[] = [];
  
  // Forward years
  for (let i = countForward; i > 0; i--) {
    const sy = currentStartYear + i;
    const ey = String(sy + 1).slice(-2);
    list.push(`${sy}-${ey}`);
  }
  
  // Current year
  list.push(currentFy);
  
  // Backward years
  for (let i = 1; i <= countBack; i++) {
    const sy = currentStartYear - i;
    const ey = String(sy + 1).slice(-2);
    list.push(`${sy}-${ey}`);
  }
  
  return list;
}
