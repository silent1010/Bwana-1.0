/**
 * Bwana World-Class Search Engine
 * Features:
 * - Synonym dictionary expansion
 * - Typo tolerance & token similarity
 * - Auto-expanding radius (25km -> 50km -> 100km) when local results are zero
 * - Intelligent ranking: Verified DESC, Rating DESC, Distance ASC
 * - Zero-result telemetry logging
 */

import { Business, LocationArea } from '../../types';
import { expandSearchQuery } from './synonyms';
import { logFailedSearch } from '../analytics/logFailedSearch';
import { calculateDistanceKm } from '../../data/geoHierarchy';

export interface SearchOptions {
  query: string;
  category?: string;
  serviceCategory?: string;
  currentLocation: LocationArea;
  initialRadiusKm?: number;
  verifiedOnly?: boolean;
  openNowOnly?: boolean;
  highestRatedOnly?: boolean;
  minRating?: number;
  offersDeliveryOnly?: boolean;
}

export interface SearchResultOutcome {
  results: Business[];
  expandedRadiusKm?: number;
  isExpanded: boolean;
  message?: string;
  totalMatches: number;
}

/**
 * Basic Levenshtein distance for typo tolerance (e.g. faramacy -> pharmacy, tmato -> tomato)
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function isFuzzyMatch(needle: string, haystack: string): boolean {
  needle = needle.toLowerCase().trim();
  haystack = haystack.toLowerCase().trim();

  if (!needle) return true;
  if (haystack.includes(needle)) return true;

  // Check word tokens in haystack
  const words = haystack.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(needle) || needle.startsWith(word)) return true;
    if (needle.length >= 4 && word.length >= 4) {
      const maxDistance = needle.length > 6 ? 2 : 1;
      if (levenshteinDistance(needle, word) <= maxDistance) return true;
    }
  }

  return false;
}

export function searchBusinesses(
  businesses: Business[],
  options: SearchOptions
): SearchResultOutcome {
  const {
    query,
    category = 'all',
    serviceCategory,
    currentLocation,
    initialRadiusKm = 25,
    verifiedOnly = false, // Default is OFF as instructed in Bwana agenda
    openNowOnly = false,
    highestRatedOnly = false,
    minRating,
    offersDeliveryOnly = false,
  } = options;

  const targetCategory = (serviceCategory && serviceCategory !== 'all') ? serviceCategory : category;

  const trimmedQuery = query.trim().toLowerCase();
  const searchTokens = expandSearchQuery(trimmedQuery);

  // Helper filter function for a given radius limit
  const filterAtRadius = (radiusLimitKm: number) => {
    return businesses
      .map((biz) => {
        const dist =
          biz.distanceKm !== undefined
            ? biz.distanceKm
            : calculateDistanceKm(
                currentLocation.coordinates.latitude,
                currentLocation.coordinates.longitude,
                biz.coordinates.latitude,
                biz.coordinates.longitude
              );
        return { ...biz, distanceKm: dist };
      })
      .filter((biz) => {
        // Radius filter
        if (radiusLimitKm > 0 && (biz.distanceKm || 0) > radiusLimitKm) {
          return false;
        }

        // Verified filter (only applied if explicitly requested by user)
        if (verifiedOnly && biz.verificationStatus !== 'verified') {
          return false;
        }

        // Open Now filter
        if (openNowOnly && !biz.isOpenNow) {
          return false;
        }

        // Highest Rated filter (rating >= 4.5 or custom minRating)
        const ratingFloor = minRating ?? (highestRatedOnly ? 4.5 : 0);
        if (ratingFloor > 0 && (biz.rating || 0) < ratingFloor) {
          return false;
        }

        // Offers Delivery filter
        if (offersDeliveryOnly) {
          const hasDelivery =
            biz.tags?.some((t) => t.toLowerCase().includes('delivery')) ||
            biz.attributes?.some((a) => a.toLowerCase().includes('delivery')) ||
            biz.description?.toLowerCase().includes('delivery') ||
            biz.services?.some((s) => s.name?.toLowerCase().includes('delivery'));
          if (!hasDelivery) {
            return false;
          }
        }

        // Category filter
        if (targetCategory !== 'all') {
          const catLower = targetCategory.toLowerCase();
          const matchesCategory =
            biz.categoryId === targetCategory ||
            biz.categoryId?.toLowerCase() === catLower ||
            biz.categoryName?.toLowerCase() === catLower ||
            (catLower === 'hospital' && (biz.categoryId === 'cat-hospital' || biz.categoryName?.toLowerCase().includes('hospital'))) ||
            (catLower === 'private-clinic' && (biz.categoryId === 'cat-private-clinic' || biz.categoryName?.toLowerCase().includes('clinic'))) ||
            (catLower === 'cat-hospital' && (biz.categoryId === 'cat-hospital' || biz.categoryName?.toLowerCase().includes('hospital'))) ||
            (catLower === 'cat-private-clinic' && (biz.categoryId === 'cat-private-clinic' || biz.categoryName?.toLowerCase().includes('clinic')));

          if (!matchesCategory) {
            return false;
          }
        }

        // Query matching (using synonym expansion and fuzzy token search)
        if (!trimmedQuery) return true;

        const searchableText = [
          biz.name,
          biz.tagline,
          biz.description,
          biz.categoryName,
          biz.area,
          biz.city,
          biz.address,
          ...(biz.tags || []),
          ...(biz.products?.map((p) => p.name) || []),
          ...(biz.services?.map((s) => s.name) || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchTokens.some((token) => isFuzzyMatch(token, searchableText));
      })
      .sort((a, b) => {
        // World standard ranking:
        // 1. Bwana Verified Merchants first
        const aVerified = a.verificationStatus === 'verified' || a.verificationTier === 'bwana_verified' ? 1 : 0;
        const bVerified = b.verificationStatus === 'verified' || b.verificationTier === 'bwana_verified' ? 1 : 0;
        if (bVerified !== aVerified) return bVerified - aVerified;

        // 2. Rating DESC
        if (b.rating !== a.rating) return b.rating - a.rating;

        // 3. Distance ASC (nearest first)
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      });
  };

  // 1. Initial Search at chosen radius (e.g. 25km)
  let results = filterAtRadius(initialRadiusKm);
  let expandedRadiusKm: number | undefined;
  let isExpanded = false;
  let message: string | undefined;

  // 2. Auto-expand radius if 0 results found (e.g., searching for "malls" or specialized services)
  if (results.length === 0 && trimmedQuery) {
    // Retry at 50km
    results = filterAtRadius(50);
    if (results.length > 0) {
      isExpanded = true;
      expandedRadiusKm = 50;
      message = `Expanded radius to 50km — Found ${results.length} result${results.length > 1 ? 's' : ''} near ${currentLocation.city}`;
    } else {
      // Retry at 100km
      results = filterAtRadius(100);
      if (results.length > 0) {
        isExpanded = true;
        expandedRadiusKm = 100;
        message = `Expanded radius to 100km across Copperbelt & Midlands — Found ${results.length} result${results.length > 1 ? 's' : ''}`;
      } else {
        // Log zero result search for daily Bwana team synonym backlog
        logFailedSearch(trimmedQuery, currentLocation.name, initialRadiusKm);
      }
    }
  }

  return {
    results,
    expandedRadiusKm,
    isExpanded,
    message,
    totalMatches: results.length,
  };
}
