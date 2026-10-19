import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveBusinessesToOfflineCache,
  getCachedBusinessesFromOffline,
  saveCategoriesToOfflineCache,
  getCachedCategoriesFromOffline,
  getOfflineCacheMetadata,
  formatCachedTimestamp,
} from '../services/offlineCache';
import { Business, Category } from '../types';

const mockBiz: Business = {
  id: 'biz-offline-1',
  name: 'Kitwe Copper Workshop',
  tagline: 'Precision welding and metal fabrications',
  description: 'Verified trade workshop in Kitwe',
  categoryId: 'cat-services',
  categoryName: 'Trade & Services',
  verificationStatus: 'verified',
  rating: 4.8,
  reviewsCount: 15,
  phone: '+260 97 123 4567',
  whatsapp: '+260 97 123 4567',
  address: 'Plot 104, Chisokone Avenue',
  city: 'Kitwe',
  province: 'Copperbelt',
  area: 'Central',
  coordinates: { latitude: -12.8024, longitude: 28.2132 },
  coverImage: '/test.jpg',
  galleryImages: [],
  isOpenNow: true,
  hours: [],
};

const mockCat: Category = {
  id: 'cat-services',
  name: 'Trade & Services',
  slug: 'trade-services',
  iconName: 'Wrench',
  description: 'Local skilled artisans',
  count: 42,
};

describe('Offline Cache Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('correctly caches businesses to localStorage and reads them back', () => {
    expect(getCachedBusinessesFromOffline().fromCache).toBe(false);
    expect(getCachedBusinessesFromOffline().businesses).toHaveLength(0);

    saveBusinessesToOfflineCache([mockBiz]);

    const result = getCachedBusinessesFromOffline();
    expect(result.fromCache).toBe(true);
    expect(result.businesses).toHaveLength(1);
    expect(result.businesses[0].id).toBe('biz-offline-1');
    expect(result.businesses[0].name).toBe('Kitwe Copper Workshop');
    expect(typeof result.cachedAt).toBe('number');
  });

  it('creates and updates cache metadata with accurate item count', () => {
    saveBusinessesToOfflineCache([mockBiz]);
    const meta = getOfflineCacheMetadata();
    expect(meta).not.toBeNull();
    expect(meta?.businessCount).toBe(1);
    expect(meta?.version).toBe('1.0');
    expect(meta?.cachedAt).toBeGreaterThan(0);
  });

  it('correctly caches and retrieves categories', () => {
    expect(getCachedCategoriesFromOffline()).toBeNull();
    saveCategoriesToOfflineCache([mockCat]);
    const cats = getCachedCategoriesFromOffline();
    expect(cats).toHaveLength(1);
    expect(cats?.[0].id).toBe('cat-services');
  });

  it('handles corrupted localStorage data without throwing exceptions', () => {
    localStorage.setItem('bwana_offline_businesses_v1', 'INVALID_JSON_CORRUPTED');
    const result = getCachedBusinessesFromOffline();
    expect(result.businesses).toHaveLength(0);
    expect(result.fromCache).toBe(false);
  });

  it('correctly formats relative cache timestamps', () => {
    expect(formatCachedTimestamp(null)).toBe('Never');

    const now = Date.now();
    expect(formatCachedTimestamp(now)).toBe('Just now');
    expect(formatCachedTimestamp(now - 5 * 60 * 1000)).toBe('5m ago');
    expect(formatCachedTimestamp(now - 2 * 60 * 60 * 1000)).toBe('2h ago');
  });
});
