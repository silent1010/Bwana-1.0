import { Business, Category } from '../types';

export interface OfflineCacheMetadata {
  cachedAt: number;
  businessCount: number;
  categoryCount: number;
  version: string;
}

const CACHE_KEYS = {
  BUSINESSES: 'bwana_offline_businesses_v1',
  CATEGORIES: 'bwana_offline_categories_v1',
  METADATA: 'bwana_offline_meta_v1',
};

/**
 * Save live businesses list to local offline storage cache
 */
export function saveBusinessesToOfflineCache(businesses: Business[]): void {
  try {
    if (!businesses || !Array.isArray(businesses)) return;
    localStorage.setItem(CACHE_KEYS.BUSINESSES, JSON.stringify(businesses));

    const existingMeta = getOfflineCacheMetadata();
    const meta: OfflineCacheMetadata = {
      cachedAt: Date.now(),
      businessCount: businesses.length,
      categoryCount: existingMeta?.categoryCount || 0,
      version: '1.0',
    };
    localStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify(meta));
  } catch (err) {
    console.warn('Failed to save businesses to offline cache:', err);
  }
}

/**
 * Retrieve cached businesses from offline storage
 */
export function getCachedBusinessesFromOffline(): {
  businesses: Business[];
  cachedAt: number | null;
  fromCache: boolean;
} {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.BUSINESSES);
    const metaRaw = localStorage.getItem(CACHE_KEYS.METADATA);

    if (!raw) {
      return { businesses: [], cachedAt: null, fromCache: false };
    }

    const businesses: Business[] = JSON.parse(raw);
    const meta: OfflineCacheMetadata | null = metaRaw ? JSON.parse(metaRaw) : null;

    return {
      businesses: Array.isArray(businesses) ? businesses : [],
      cachedAt: meta?.cachedAt || null,
      fromCache: true,
    };
  } catch (err) {
    console.warn('Failed to read businesses from offline cache:', err);
    return { businesses: [], cachedAt: null, fromCache: false };
  }
}

/**
 * Save categories to offline storage
 */
export function saveCategoriesToOfflineCache(categories: Category[]): void {
  try {
    if (!categories || !Array.isArray(categories)) return;
    localStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(categories));

    const existingMeta = getOfflineCacheMetadata();
    const meta: OfflineCacheMetadata = {
      cachedAt: existingMeta?.cachedAt || Date.now(),
      businessCount: existingMeta?.businessCount || 0,
      categoryCount: categories.length,
      version: '1.0',
    };
    localStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify(meta));
  } catch (err) {
    console.warn('Failed to save categories to offline cache:', err);
  }
}

/**
 * Retrieve categories from offline storage
 */
export function getCachedCategoriesFromOffline(): Category[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retrieve cache metadata including last synced timestamp and item counts
 */
export function getOfflineCacheMetadata(): OfflineCacheMetadata | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.METADATA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Formats a cached timestamp to human-friendly local time
 */
export function formatCachedTimestamp(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Ensures any stale service worker is completely unregistered and caches purged
 * to prevent white-screen interception and bundle loading issues.
 */
export function registerOfflineServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister().then(() => {
            console.info('Unregistered service worker to guarantee clean application load.');
          }).catch(() => {});
        }
      }).catch(() => {});

      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key).catch(() => {});
          }
        }).catch(() => {});
      }
    } catch {
      // Safe fallback
    }
  }
}
