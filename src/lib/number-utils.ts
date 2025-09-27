/**
 * Utility functions for number formatting
 */

/**
 * Rounds a number to 2 decimal places
 */
export function roundTo2Decimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number to 2 decimal places as a string
 */
export function formatTo2Decimals(value: number): string {
  return value.toFixed(2);
}

/**
 * Rounds a number to 2 decimal places and formats as percentage
 */
export function formatPercentage(value: number): string {
  return `${formatTo2Decimals(value)}%`;
}

/**
 * Rounds a number to 2 decimal places and formats as currency
 */
export function formatCurrency(value: number, currency: string = '$'): string {
  return `${currency}${formatTo2Decimals(value)}`;
}

/**
 * Rounds a number to 2 decimal places and formats with thousands separator
 */
export function formatNumber(value: number): string {
  return roundTo2Decimals(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Rounds a number to 2 decimal places and formats as compact number (e.g., 1.23K, 1.23M)
 */
export function formatCompactNumber(value: number): string {
  const rounded = roundTo2Decimals(value);
  
  if (rounded >= 1000000) {
    return `${formatTo2Decimals(rounded / 1000000)}M`;
  } else if (rounded >= 1000) {
    return `${formatTo2Decimals(rounded / 1000)}K`;
  } else {
    return formatTo2Decimals(rounded);
  }
}
