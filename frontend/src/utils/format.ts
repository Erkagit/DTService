/**
 * Formatting utility functions
 * Reusable formatters for dates, currency, and other common formats
 */

/**
 * Format date string to Mongolian locale format
 * @param dateStr - ISO date string
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    return date.toLocaleDateString('mn-MN', options || defaultOptions);
  } catch {
    return '-';
  }
};

/**
 * Format date with time
 * @param dateStr - ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * Format number to Mongolian currency format (₮)
 * @param amount - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
};

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('mn-MN').format(num);
};

/**
 * Format weight in kilograms
 * @param weight - Weight value
 * @returns Formatted weight string
 */
export const formatWeight = (weight: number | null | undefined): string => {
  if (weight === null || weight === undefined) return '-';
  return `${new Intl.NumberFormat('mn-MN').format(weight)} кг`;
};
