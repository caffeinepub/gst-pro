import type { Time } from '../backend';

/**
 * Format a backend Time (bigint nanoseconds) to a readable local date/time string
 */
export function formatAdminTime(time: Time | null | undefined): string {
  if (!time) {
    return 'Never';
  }

  try {
    // Convert nanoseconds to milliseconds
    const milliseconds = Number(time / BigInt(1_000_000));
    const date = new Date(milliseconds);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format as readable local date/time
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format a backend Time to just the date (no time component)
 */
export function formatAdminDate(time: Time | null | undefined): string {
  if (!time) {
    return 'Never';
  }

  try {
    const milliseconds = Number(time / BigInt(1_000_000));
    const date = new Date(milliseconds);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Convert a Date object to backend Time (bigint nanoseconds)
 */
export function dateToBackendTime(date: Date): Time {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}
