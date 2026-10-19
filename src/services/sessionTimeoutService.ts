/**
 * Session Inactivity & Auto-Logout Management
 * Logs out any authenticated user (registered user or business side)
 * if the app has not been opened or active for more than 10 minutes.
 */

export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
export const LAST_ACTIVE_KEY = 'bwana_last_active_timestamp';
export const USER_ACCOUNT_KEY = 'bwana_user_account_v1';
export const BUSINESS_SESSION_KEY = 'bwana_business_session_v1';

export interface BusinessSession {
  email: string;
  role: string;
  name: string;
  businessId?: string;
  businessName?: string;
}

/**
 * Checks if the stored session timestamp is older than 10 minutes.
 */
export function checkIsSessionExpired(now: number = Date.now()): boolean {
  try {
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!lastActiveStr) return false;
    const lastActive = parseInt(lastActiveStr, 10);
    if (isNaN(lastActive) || lastActive <= 0) return false;
    return now - lastActive > INACTIVITY_TIMEOUT_MS;
  } catch {
    return false;
  }
}

/**
 * Updates the last active timestamp to current time.
 */
export function recordUserActivity(now: number = Date.now()): void {
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
  } catch {
    // storage quota or incognito
  }
}

/**
 * Purges all authenticated sessions and activity timestamps.
 */
export function clearAllAuthSessions(): void {
  try {
    localStorage.removeItem(USER_ACCOUNT_KEY);
    localStorage.removeItem(BUSINESS_SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
  } catch {
    // ignore storage errors
  }
}

/**
 * Retrieves the stored business session if valid and not expired.
 */
export function getStoredBusinessSession(): BusinessSession | null {
  try {
    const stored = localStorage.getItem(BUSINESS_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as BusinessSession;
  } catch {
    return null;
  }
}

/**
 * Stores the active business session.
 */
export function saveBusinessSession(session: BusinessSession): void {
  try {
    localStorage.setItem(BUSINESS_SESSION_KEY, JSON.stringify(session));
    recordUserActivity();
  } catch {
    // storage error
  }
}
