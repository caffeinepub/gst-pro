/**
 * Utility to normalize GST filing status data for consistent frontend display.
 * Maps backend status text to clear "Filed" vs "Not filed" labels.
 */

export interface NormalizedStatus {
  label: string;
  variant: 'filed' | 'notFiled' | 'unknown';
}

/**
 * Normalize status text from backend to unambiguous frontend labels
 */
export function normalizeFilingStatus(status: string): NormalizedStatus {
  const statusLower = status.toLowerCase().trim();

  // Check for filed/completed indicators
  if (
    statusLower.includes('filed') ||
    statusLower.includes('completed') ||
    statusLower.includes('submitted') ||
    statusLower === 'yes'
  ) {
    return {
      label: 'Filed',
      variant: 'filed',
    };
  }

  // Check for not filed/pending indicators
  if (
    statusLower.includes('not filed') ||
    statusLower.includes('pending') ||
    statusLower.includes('due') ||
    statusLower === 'no' ||
    statusLower === 'nil'
  ) {
    return {
      label: 'Not filed',
      variant: 'notFiled',
    };
  }

  // Unknown/unclear status
  return {
    label: status,
    variant: 'unknown',
  };
}

/**
 * Get badge variant for normalized status
 */
export function getStatusBadgeVariant(
  variant: NormalizedStatus['variant']
): 'default' | 'secondary' | 'outline' {
  switch (variant) {
    case 'filed':
      return 'default';
    case 'notFiled':
      return 'secondary';
    case 'unknown':
      return 'outline';
  }
}
