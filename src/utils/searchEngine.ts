import { Business, Professional, LocationArea } from '../types';
import { calculateDistanceKm } from '../data/mockData';

// Common Zambian commercial colloquialisms, abbreviations, and synonyms
export const ZAMBIAN_COLLOQUIALISMS: Record<string, string[]> = {
  hardware: ['spares', 'cement', 'tools', 'timber', 'pipes', 'steel', 'iron sheets', 'building materials', 'plumbing'],
  auto: ['spares', 'mechanic', 'garage', 'panel beating', 'tyres', 'batteries', 'auto electrician', 'car service'],
  food: ['nshima', 'restaurant', 'catering', 'takeaway', 'butchery', 'meat', 'bakery', 'bread', 'groceries', 'kantemba'],
  medical: ['clinic', 'pharmacy', 'chemist', 'drugs', 'doctor', 'hospital', 'dentist', 'laboratory'],
  tech: ['computer', 'laptop', 'software', 'phones', 'airtime', 'it support', 'developer', 'cctv', 'solar'],
  beauty: ['salon', 'barber', 'hair', 'braids', 'nails', 'cosmetics', 'spa'],
  fashion: ['clothes', 'boutique', 'chitenge', 'shoes', 'tailor', 'dresses'],
  logistics: ['delivery', 'transport', 'truck', 'courier', 'freight', 'moving'],
  financial: ['loans', 'mobile money', 'airtel money', 'mtn money', 'bureau de change', 'insurance'],
  services: ['plumber', 'electrician', 'welder', 'carpenter', 'painter', 'cleaning', 'borehole', 'tpin', 'pacra'],
};

export interface SearchMatchResult {
  business: Business;
  score: number;
  matchedFields: string[];
  distanceKm: number;
  highlightText?: string;
}

export interface ParsedSearchQuery {
  rawQuery: string;
  normalizedTokens: string[];
  detectedCity?: string;
  detectedIntent?: 'business' | 'service' | 'professional' | 'category' | 'emergency';
  expandedTerms: string[];
}

/**
 * Normalizes text for forgiving matching (removes accents, punctuation, extra spaces)
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses user input into search tokens and extracts location or category intent
 */
export function parseSearchQuery(query: string, currentLocation?: LocationArea): ParsedSearchQuery {
  const normalized = normalizeSearchText(query);
  const rawTokens = normalized.split(' ').filter((t) => t.length > 1);

  let detectedCity: string | undefined;
  let detectedIntent: ParsedSearchQuery['detectedIntent'] = 'business';
  const expandedTerms: Set<string> = new Set(rawTokens);

  // Check for common city prefixes / phrases
  const lowerQuery = query.toLowerCase();
  const knownCities = [
    'kitwe', 'lusaka', 'ndola', 'livingstone', 'solwezi', 'chipata',
    'kasama', 'mansa', 'mongu', 'kabwe', 'chingola', 'mufulira', 'luanshya'
  ];

  for (const city of knownCities) {
    if (lowerQuery.includes(`in ${city}`) || lowerQuery.includes(`at ${city}`) || rawTokens.includes(city)) {
      detectedCity = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  if (lowerQuery.includes('near me') && currentLocation) {
    detectedCity = currentLocation.city;
  }

  // Detect Emergency or Priority Services
  if (
    lowerQuery.includes('hospital') ||
    lowerQuery.includes('emergency') ||
    lowerQuery.includes('police') ||
    lowerQuery.includes('ambulance')
  ) {
    detectedIntent = 'emergency';
  } else if (
    lowerQuery.includes('plumber') ||
    lowerQuery.includes('electrician') ||
    lowerQuery.includes('developer') ||
    lowerQuery.includes('welder') ||
    lowerQuery.includes('lawyer')
  ) {
    detectedIntent = 'professional';
  } else if (lowerQuery.includes('buy') || lowerQuery.includes('price') || lowerQuery.includes('cost')) {
    detectedIntent = 'category';
  }

  // Expand query tokens with Zambian synonyms & colloquialisms
  for (const token of rawTokens) {
    for (const [key, synonyms] of Object.entries(ZAMBIAN_COLLOQUIALISMS)) {
      if (token === key || synonyms.includes(token)) {
        expandedTerms.add(key);
        synonyms.slice(0, 4).forEach((s) => expandedTerms.add(s));
      }
    }
  }

  return {
    rawQuery: query,
    normalizedTokens: rawTokens,
    detectedCity,
    detectedIntent,
    expandedTerms: Array.from(expandedTerms),
  };
}

/**
 * Executes a multi-token weighted hybrid search over businesses
 */
export function searchBusinesses(
  businesses: Business[],
  query: string,
  userLocation: LocationArea,
  filters?: {
    category?: string;
    verifiedOnly?: boolean;
    openNowOnly?: boolean;
    maxDistanceKm?: number;
    offersDeliveryOnly?: boolean;
  }
): SearchMatchResult[] {
  if (!query.trim() && (!filters || filters.category === 'all')) {
    // If no query, return businesses sorted by proximity
    return businesses
      .map((b) => {
        const dist = calculateDistanceKm(
          userLocation.coordinates.latitude,
          userLocation.coordinates.longitude,
          b.coordinates.latitude,
          b.coordinates.longitude
        );
        return {
          business: { ...b, distanceKm: dist },
          score: 1,
          matchedFields: ['proximity'],
          distanceKm: dist,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  const parsed = parseSearchQuery(query, userLocation);
  const results: SearchMatchResult[] = [];

  for (const b of businesses) {
    // 1. Calculate distance from user's active coordinate
    const distanceKm = calculateDistanceKm(
      userLocation.coordinates.latitude,
      userLocation.coordinates.longitude,
      b.coordinates.latitude,
      b.coordinates.longitude
    );

    // Apply strict filters
    if (filters?.maxDistanceKm && distanceKm > filters.maxDistanceKm) {
      continue;
    }
    if (filters?.verifiedOnly && b.verificationStatus !== 'verified') {
      continue;
    }
    if (filters?.openNowOnly && !b.isOpenNow) {
      continue;
    }
    if (filters?.category && filters.category !== 'all' && b.categoryId !== filters.category && b.categoryName !== filters.category) {
      continue;
    }

    // 2. Score text relevance across multiple fields
    let score = 0;
    const matchedFields: string[] = [];

    const normName = normalizeSearchText(b.name);
    const normCategory = normalizeSearchText(b.categoryName || b.categoryId || '');
    const normCity = normalizeSearchText(b.city);
    const normArea = normalizeSearchText(b.area || '');
    const normDesc = normalizeSearchText(b.description || '');
    const normTags = (b.tags || []).map(normalizeSearchText).join(' ');
    const normProducts = (b.products || []).map((p) => normalizeSearchText(p.name)).join(' ');

    // Match City if detected
    if (parsed.detectedCity) {
      const targetCity = parsed.detectedCity.toLowerCase();
      if (normCity.includes(targetCity) || normArea.includes(targetCity)) {
        score += 15;
        matchedFields.push(`City: ${parsed.detectedCity}`);
      }
    }

    // Exact name match bonus
    if (query.trim().length > 2 && normName.includes(normalizeSearchText(query))) {
      score += 40;
      matchedFields.push('Business Name (Exact)');
    }

    // Match against each token
    for (const token of parsed.normalizedTokens) {
      if (normName.includes(token)) {
        score += 20;
        if (!matchedFields.includes('Name')) matchedFields.push('Name');
      } else if (normCategory.includes(token)) {
        score += 15;
        if (!matchedFields.includes('Category')) matchedFields.push('Category');
      } else if (normProducts.includes(token)) {
        score += 12;
        if (!matchedFields.includes('Products')) matchedFields.push('Products');
      } else if (normTags.includes(token)) {
        score += 8;
        if (!matchedFields.includes('Tags')) matchedFields.push('Tags');
      } else if (normDesc.includes(token)) {
        score += 5;
        if (!matchedFields.includes('Description')) matchedFields.push('Description');
      }
    }

    // Expanded Zambian colloquialism bonus
    for (const exp of parsed.expandedTerms) {
      if (normCategory.includes(exp) || normTags.includes(exp) || normProducts.includes(exp)) {
        score += 6;
      }
    }

    // Verification boost
    if (b.verificationStatus === 'verified') {
      score += 5;
    }

    // High rating boost
    if (b.rating >= 4.5) {
      score += 4;
    }

    // Proximity penalty/bonus: closer businesses rank higher when scores are comparable
    const proximityScore = Math.max(0, 15 - distanceKm);
    score += proximityScore;

    if (score > 5 || (!query.trim() && filters?.category)) {
      results.push({
        business: { ...b, distanceKm },
        score,
        matchedFields,
        distanceKm,
      });
    }
  }

  // Sort by highest score first, then by shortest distance
  return results.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 8) {
      return b.score - a.score;
    }
    return a.distanceKm - b.distanceKm;
  });
}
