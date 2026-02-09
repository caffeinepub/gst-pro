export function getUserFacingError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return normalizeErrorMessage(error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    return normalizeErrorMessage(error.message);
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return normalizeErrorMessage(message);
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

function normalizeErrorMessage(message: string): string {
  // Clean up common error prefixes
  let cleaned = message
    .replace(/^Error:\s*/i, '')
    .replace(/^Reject text:\s*/i, '')
    .replace(/^Call failed:\s*/i, '')
    .trim();

  // Handle credential authentication errors
  if (cleaned.includes('Invalid credentials')) {
    return 'Invalid User ID or password. Please check your credentials and try again.';
  }

  if (cleaned.includes('User account is disabled')) {
    return 'Your account has been disabled. Please contact an administrator for assistance.';
  }

  if (cleaned.includes('Access to the application has expired')) {
    return 'Your access to the application has expired. Please contact an administrator to renew your access.';
  }

  if (cleaned.includes('Authentication failed')) {
    return 'Authentication failed. Please check your credentials and try again.';
  }

  // Handle admin user management errors
  if (cleaned.includes('Unauthorized: Only admins can')) {
    return 'You do not have permission to perform this action. Admin access is required.';
  }

  if (cleaned.includes('Email already registered') || cleaned.includes('User ID already registered')) {
    return 'This email or User ID is already registered. Please use a different one.';
  }

  if (cleaned.includes('User not found')) {
    return 'User not found. They may have been removed or the ID is incorrect.';
  }

  // Handle admin dashboard viewing errors
  if (cleaned.includes('User has not signed in yet') || cleaned.includes('User has never logged in')) {
    return 'This user has not signed in to the application yet. Dashboard data will be available after their first sign-in.';
  }

  // Handle access expiry errors
  if (cleaned.includes('access to the application has expired')) {
    return 'Your access to the application has expired. Please contact an administrator to renew your access.';
  }

  if (cleaned.includes('account has been disabled')) {
    return 'Your account has been disabled. Please contact an administrator for assistance.';
  }

  // Handle authorization errors
  if (cleaned.includes('Unauthorized')) {
    return 'You do not have permission to perform this action. Please sign in or contact an administrator.';
  }

  // Handle network errors
  if (cleaned.includes('network') || cleaned.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle actor not available
  if (cleaned.includes('Actor not available')) {
    return 'Connection to the backend is not ready. Please wait a moment and try again.';
  }

  // Return cleaned message if it's user-friendly (not too technical)
  if (cleaned.length > 0 && cleaned.length < 200 && !cleaned.includes('stack') && !cleaned.includes('at ')) {
    return cleaned;
  }

  return 'An unexpected error occurred. Please try again.';
}
