/**
 * Utility for persisting application access state per principal across page refresh
 * Note: These functions are maintained for compatibility but are no longer used
 * in Version 9 where access is controlled solely by Internet Identity.
 */

const APP_ACCESS_KEY_PREFIX = 'gst_pro_app_access_';

/**
 * Store that the given principal has completed application access login
 * @deprecated Version 9 uses Internet Identity only
 */
export function setAppAccessGranted(principalId: string): void {
  if (!principalId) return;
  const key = `${APP_ACCESS_KEY_PREFIX}${principalId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Check if the given principal has completed application access login
 * @deprecated Version 9 uses Internet Identity only
 */
export function hasAppAccessGranted(principalId: string): boolean {
  if (!principalId) return false;
  const key = `${APP_ACCESS_KEY_PREFIX}${principalId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Clear application access state for the given principal
 */
export function clearAppAccess(principalId: string): void {
  if (!principalId) return;
  const key = `${APP_ACCESS_KEY_PREFIX}${principalId}`;
  localStorage.removeItem(key);
}

/**
 * Clear application access state for the given principal (alias for consistency)
 */
export function clearAppAccessGranted(principalId: string): void {
  clearAppAccess(principalId);
}

/**
 * Clear all application access state (useful for complete logout)
 */
export function clearAllAppAccess(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(APP_ACCESS_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
