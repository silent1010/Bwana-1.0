import { describe, it, expect } from 'vitest';
import { searchBusinesses } from '../lib/search/searchBusinesses';
import { DATABASE_BUSINESSES } from '../services/dbSeeder';
import { LocationArea } from '../types';

describe('Advanced Search Filters Engine', () => {
  const currentLocation: LocationArea = {
    id: 'loc-kitwe-central',
    name: 'Kitwe Central',
    district: 'Kitwe',
    city: 'Kitwe',
    province: 'Copperbelt',
    country: 'Zambia',
    countryCode: 'ZM',
    coordinates: { latitude: -12.8024, longitude: 28.2132 }
  };

  it('filters by Open Now criteria correctly', () => {
    const outcome = searchBusinesses(DATABASE_BUSINESSES, {
      query: '',
      currentLocation,
      initialRadiusKm: 500,
      openNowOnly: true
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    outcome.results.forEach((biz) => {
      expect(biz.isOpenNow).toBe(true);
    });
  });

  it('filters by Highest Rated (4.5+) criteria correctly', () => {
    const outcome = searchBusinesses(DATABASE_BUSINESSES, {
      query: '',
      currentLocation,
      initialRadiusKm: 500,
      highestRatedOnly: true
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    outcome.results.forEach((biz) => {
      expect(biz.rating).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('filters by Offers Delivery criteria correctly', () => {
    const outcome = searchBusinesses(DATABASE_BUSINESSES, {
      query: '',
      currentLocation,
      initialRadiusKm: 500,
      offersDeliveryOnly: true
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    outcome.results.forEach((biz) => {
      const hasDelivery =
        biz.tags?.some((t) => t.toLowerCase().includes('delivery')) ||
        biz.attributes?.some((a) => a.toLowerCase().includes('delivery')) ||
        biz.description?.toLowerCase().includes('delivery') ||
        biz.services?.some((s) => s.name?.toLowerCase().includes('delivery'));
      expect(hasDelivery).toBe(true);
    });
  });

  it('filters specifically for specialized Hospital category', () => {
    const outcome = searchBusinesses(DATABASE_BUSINESSES, {
      query: '',
      category: 'cat-hospital',
      currentLocation,
      initialRadiusKm: 500
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    outcome.results.forEach((biz) => {
      const isHospital =
        biz.categoryId === 'cat-hospital' ||
        biz.categoryName.toLowerCase().includes('hospital');
      expect(isHospital).toBe(true);
    });
  });

  it('filters specifically for specialized Private Clinic category', () => {
    const outcome = searchBusinesses(DATABASE_BUSINESSES, {
      query: '',
      category: 'cat-private-clinic',
      currentLocation,
      initialRadiusKm: 500
    });

    expect(outcome.results.length).toBeGreaterThan(0);
    outcome.results.forEach((biz) => {
      const isClinic =
        biz.categoryId === 'cat-private-clinic' ||
        biz.categoryName.toLowerCase().includes('clinic');
      expect(isClinic).toBe(true);
    });
  });
});
