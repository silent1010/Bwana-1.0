/**
 * Bwana Offline Cache & Resilience Engine
 * Caches the last 50 user searches, nearby businesses, and offline location data.
 */

import { Business } from '../../types';

const SEARCH_CACHE_KEY = 'bwana_recent_searches_cache';
const BUSINESSES_CACHE_KEY = 'bwana_cached_businesses_kitwe';
const MAX_SEARCH_CACHE = 50;

export interface CachedSearchItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

export function saveSearchToOfflineCache(query: string, resultCount: number): void {
  if (typeof window === 'undefined' || !query.trim()) return;

  try {
    const raw = localStorage.getItem(SEARCH_CACHE_KEY);
    const list: CachedSearchItem[] = raw ? JSON.parse(raw) : [];

    // Filter out duplicates and prepend
    const filtered = list.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
    filtered.unshift({
      query: query.trim(),
      timestamp: Date.now(),
      resultCount,
    });

    if (filtered.length > MAX_SEARCH_CACHE) {
      filtered.length = MAX_SEARCH_CACHE;
    }

    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to save search to offline cache:', err);
  }
}

export function getCachedSearches(): CachedSearchItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function cacheNearbyBusinessesForOffline(businesses: Business[]): void {
  if (typeof window === 'undefined' || !businesses || businesses.length === 0) return;
  try {
    // Cache the top 50 businesses near Kitwe/Copperbelt
    const subset = businesses.slice(0, 50);
    localStorage.setItem(BUSINESSES_CACHE_KEY, JSON.stringify(subset));
  } catch (err) {
    console.warn('Failed to cache businesses for offline:', err);
  }
}

export function getCachedNearbyBusinesses(): Business[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUSINESSES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
