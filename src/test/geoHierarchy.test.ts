import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_COUNTRIES,
  PROVINCES_REGIONS,
  DISTRICTS,
  CITIES_TOWNS,
  HIERARCHICAL_LOCATIONS,
  getProvincesByCountry,
  getDistrictsByProvince,
  getCitiesByDistrict
} from '../data/geoHierarchy';

describe('Hierarchical Geographic Architecture (Phase 1)', () => {
  it('defines Zambia as primary market and supports future African expansion countries', () => {
    const zambia = SUPPORTED_COUNTRIES.find((c) => c.code === 'ZM');
    expect(zambia).toBeDefined();
    expect(zambia?.name).toBe('Zambia');
    expect(zambia?.currency).toBe('ZMW');
    expect(zambia?.phonePrefix).toBe('+260');
    expect(zambia?.isActive).toBe(true);

    // Expansion markets
    const expansionCodes = ['ZW', 'BW', 'MW', 'NA', 'MZ', 'ZA', 'TZ'];
    expansionCodes.forEach((code) => {
      const country = SUPPORTED_COUNTRIES.find((c) => c.code === code);
      expect(country).toBeDefined();
      expect(country?.code).toBe(code);
    });
  });

  it('contains primary Zambian towns and districts requested', () => {
    const requiredTowns = [
      'Lusaka',
      'Kitwe',
      'Ndola',
      'Livingstone',
      'Kabwe',
      'Chipata',
      'Chingola',
      'Mufulira',
      'Solwezi',
      'Kasama',
      'Mongu',
    ];

    const zambianCities = CITIES_TOWNS.filter((c) => c.countryCode === 'ZM');
    const zambianCityNames = zambianCities.map((c) => c.name);

    requiredTowns.forEach((town) => {
      expect(zambianCityNames).toContain(town);
    });
  });

  it('correctly associates hierarchical model: Country → Province → District → City → Coordinates', () => {
    // 1. Kitwe
    const kitwe = CITIES_TOWNS.find((c) => c.name === 'Kitwe');
    expect(kitwe).toBeDefined();
    expect(kitwe?.countryCode).toBe('ZM');
    expect(kitwe?.provinceId).toBe('zm-copperbelt');
    expect(kitwe?.districtId).toBe('dist-zm-kitwe');
    expect(kitwe?.coordinates.latitude).toBeCloseTo(-12.8024, 2);
    expect(kitwe?.coordinates.longitude).toBeCloseTo(28.2132, 2);

    // 2. Lusaka
    const lusaka = CITIES_TOWNS.find((c) => c.name === 'Lusaka');
    expect(lusaka).toBeDefined();
    expect(lusaka?.countryCode).toBe('ZM');
    expect(lusaka?.provinceId).toBe('zm-lusaka');
    expect(lusaka?.districtId).toBe('dist-zm-lusaka');

    // 3. Livingstone
    const livingstone = CITIES_TOWNS.find((c) => c.name === 'Livingstone');
    expect(livingstone).toBeDefined();
    expect(livingstone?.countryCode).toBe('ZM');
    expect(livingstone?.provinceId).toBe('zm-southern');
  });

  it('supports hierarchy traversal helper functions', () => {
    const zambiaProvinces = getProvincesByCountry('ZM');
    expect(zambiaProvinces.length).toBeGreaterThanOrEqual(8);

    const copperbeltDistricts = getDistrictsByProvince('zm-copperbelt');
    expect(copperbeltDistricts.map((d) => d.name)).toContain('Kitwe');
    expect(copperbeltDistricts.map((d) => d.name)).toContain('Ndola');

    const kitweDistrict = DISTRICTS.find((d) => d.id === 'dist-zm-kitwe');
    expect(kitweDistrict).toBeDefined();
    const kitweCities = getCitiesByDistrict(kitweDistrict!.id);
    expect(kitweCities.map((c) => c.name)).toContain('Kitwe');
  });

  it('generates unified HIERARCHICAL_LOCATIONS with full country context', () => {
    expect(HIERARCHICAL_LOCATIONS.length).toBeGreaterThan(0);
    const kitweLocation = HIERARCHICAL_LOCATIONS.find((l) => l.city === 'Kitwe');
    expect(kitweLocation).toBeDefined();
    expect(kitweLocation?.country).toBe('Zambia');
    expect(kitweLocation?.province).toBe('Copperbelt');
    expect(kitweLocation?.district).toBe('Kitwe');
    expect(kitweLocation?.countryCode).toBe('ZM');
  });
});
