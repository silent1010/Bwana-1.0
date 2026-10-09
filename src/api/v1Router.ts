/**
 * Bwana REST API v1 Router & Dispatcher Engine
 * Endpoints:
 * - /api/v1/auth
 * - /api/v1/users
 * - /api/v1/businesses
 * - /api/v1/categories
 * - /api/v1/search
 * - /api/v1/reviews
 * - /api/v1/locations
 * - /api/v1/favorites
 * - /api/v1/reports
 * - /api/v1/admin
 */

import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  PaginatedQueryOptions
} from './types/apiContracts';
import { checkRateLimit } from './middleware/rateLimiter';
import { parseAuthorizationHeader, authorizeRoles } from './middleware/authMiddleware';
import {
  INITIAL_BUSINESSES,
  INITIAL_REVIEWS,
  CATEGORIES,
  SYSTEM_USERS,
  calculateDistanceKm
} from '../data/mockData';
import { HIERARCHICAL_LOCATIONS, SUPPORTED_COUNTRIES } from '../data/geoHierarchy';
import { Business, BusinessReview, UserRole, LocationArea } from '../types';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  ip?: string;
}

// In-memory persistent state for API actions
let apiBusinesses: Business[] = [...INITIAL_BUSINESSES];
let apiReviews: BusinessReview[] = [...INITIAL_REVIEWS];
let apiFavorites: Record<string, string[]> = {
  'usr-cust-01': ['biz-abc-hardware'],
};
let apiReports: Array<{
  id: string;
  targetType: 'business' | 'review';
  targetId: string;
  reason: string;
  reportedBy: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}> = [
  {
    id: 'rep-01',
    targetType: 'business',
    targetId: 'biz-abc-hardware',
    reason: 'Outdated Saturday closing hour',
    reportedBy: 'customer@kitwe.com',
    timestamp: new Date().toISOString(),
    status: 'pending',
  },
];

export async function handleApiV1Request<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const method = options.method || 'GET';
  const clientIp = options.ip || '127.0.0.1';

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp, 120, 60);
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
      `Too many requests. Please wait ${rateLimit.resetInSeconds} seconds before retrying.`
    ) as unknown as ApiResponse<T>;
  }

  // Parse path and query string
  const [cleanPath, queryString] = path.split('?');
  const queryParams = new URLSearchParams(queryString || '');
  const authContext = parseAuthorizationHeader(options.headers?.Authorization || options.headers?.authorization);

  try {
    // -------------------------------------------------------------------------
    // 1. /api/v1/auth
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/auth/login' && method === 'POST') {
      const { email, phone, role } = options.body || {};
      if (!email && !phone) {
        return createErrorResponse('VALIDATION_ERROR', 'Email or Phone is required to authenticate', [
          { field: 'email', message: 'Required if phone omitted' }
        ]) as unknown as ApiResponse<T>;
      }

      const assignedRole: UserRole = role || 'registered_user';
      const token = `bwana_token_${assignedRole}_${Date.now()}`;
      return createSuccessResponse({
        token,
        tokenType: 'Bearer',
        expiresIn: 86400,
        user: {
          id: `usr-${Date.now()}`,
          email: email || `${phone}@bwana.africa`,
          role: assignedRole,
          name: email ? email.split('@')[0] : 'Citizen User',
        },
      }, undefined, 'Authenticated successfully') as unknown as ApiResponse<T>;
    }

    if (cleanPath === '/api/v1/auth/me' && method === 'GET') {
      if (!authContext) {
        return createErrorResponse('UNAUTHORIZED', 'Authentication credentials missing or invalid') as unknown as ApiResponse<T>;
      }
      return createSuccessResponse(authContext) as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 2. /api/v1/users
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/users' && method === 'GET') {
      return createSuccessResponse(SYSTEM_USERS, {
        total: SYSTEM_USERS.length,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 3. /api/v1/businesses
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/businesses' && method === 'GET') {
      const page = parseInt(queryParams.get('page') || '1', 10);
      const limit = parseInt(queryParams.get('limit') || '10', 10);
      const category = queryParams.get('category');
      const city = queryParams.get('city');
      const verifiedOnly = queryParams.get('verified') === 'true';
      const sortBy = queryParams.get('sortBy') || 'rating';
      const sortOrder = (queryParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

      let results = [...apiBusinesses];

      if (category && category !== 'all') {
        results = results.filter((b) => b.categoryId === category);
      }
      if (city && city !== 'all') {
        results = results.filter((b) => b.city.toLowerCase() === city.toLowerCase());
      }
      if (verifiedOnly) {
        results = results.filter((b) => b.verificationStatus === 'verified');
      }

      // Sorting
      results.sort((a, b) => {
        if (sortBy === 'rating') {
          return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        }
        if (sortBy === 'reviewsCount') {
          return sortOrder === 'asc' ? a.reviewsCount - b.reviewsCount : b.reviewsCount - a.reviewsCount;
        }
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });

      // Pagination
      const total = results.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = results.slice(startIndex, startIndex + limit);

      return createSuccessResponse(paginatedData, {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        sortBy,
        sortOrder,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    if (cleanPath.startsWith('/api/v1/businesses/') && method === 'GET') {
      const id = cleanPath.replace('/api/v1/businesses/', '');
      const business = apiBusinesses.find((b) => b.id === id);
      if (!business) {
        return createErrorResponse('NOT_FOUND', `Business with ID ${id} not found`) as unknown as ApiResponse<T>;
      }
      return createSuccessResponse(business) as unknown as ApiResponse<T>;
    }

    if (cleanPath === '/api/v1/businesses' && method === 'POST') {
      if (!authContext || !authorizeRoles(['business_owner', 'admin', 'registered_user'], authContext.role)) {
        return createErrorResponse('FORBIDDEN', 'Only business owners and authorized users can register a business') as unknown as ApiResponse<T>;
      }

      const body = options.body;
      if (!body.name || !body.city || !body.phone) {
        return createErrorResponse('VALIDATION_ERROR', 'Missing required business attributes (name, city, phone)', [
          { field: 'name', message: 'Business name is required' },
          { field: 'city', message: 'City location is required' },
          { field: 'phone', message: 'Direct phone is required' }
        ]) as unknown as ApiResponse<T>;
      }

      const newBiz: Business = {
        ...body,
        id: `biz-${Date.now()}`,
        verificationStatus: 'unverified',
        rating: 5.0,
        reviewsCount: 0,
        coordinates: body.coordinates || { latitude: -12.8024, longitude: 28.2132 },
        coverImage: body.coverImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
        galleryImages: [],
        isOpenNow: true,
        hours: [],
      };

      apiBusinesses = [newBiz, ...apiBusinesses];
      return createSuccessResponse(newBiz, undefined, 'Business registered successfully') as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 4. /api/v1/categories
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/categories' && method === 'GET') {
      return createSuccessResponse(CATEGORIES, {
        total: CATEGORIES.length,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 5. /api/v1/search (PostGIS Simulated Radius Search & Natural Language Query)
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/search' && method === 'GET') {
      const q = queryParams.get('q') || queryParams.get('query') || '';
      const lat = parseFloat(queryParams.get('lat') || '-12.8024');
      const lng = parseFloat(queryParams.get('lng') || '28.2132');
      const radiusKm = parseFloat(queryParams.get('radius_km') || '25');

      let matches = apiBusinesses.map((b) => {
        const distance = calculateDistanceKm(lat, lng, b.coordinates.latitude, b.coordinates.longitude);
        return {
          ...b,
          calculatedDistanceKm: distance,
        };
      });

      // Filter by radius if requested
      matches = matches.filter((b) => b.calculatedDistanceKm <= radiusKm);

      // Filter by keyword query if present
      if (q) {
        const lowerQ = q.toLowerCase();
        matches = matches.filter(
          (b) =>
            b.name.toLowerCase().includes(lowerQ) ||
            b.tagline.toLowerCase().includes(lowerQ) ||
            b.description.toLowerCase().includes(lowerQ) ||
            b.categoryName.toLowerCase().includes(lowerQ) ||
            b.tags?.some((t) => t.toLowerCase().includes(lowerQ)) ||
            b.products?.some((p) => p.name.toLowerCase().includes(lowerQ))
        );
      }

      matches.sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm);

      return createSuccessResponse(matches, {
        total: matches.length,
        filtersApplied: { query: q, lat, lng, radiusKm },
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 6. /api/v1/reviews
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/reviews' && method === 'GET') {
      const businessId = queryParams.get('businessId');
      let reviews = [...apiReviews];
      if (businessId) {
        reviews = reviews.filter((r) => r.businessId === businessId);
      }
      return createSuccessResponse(reviews, {
        total: reviews.length,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    if (cleanPath === '/api/v1/reviews' && method === 'POST') {
      if (!authContext) {
        return createErrorResponse('UNAUTHORIZED', 'Login required to submit reviews and star ratings') as unknown as ApiResponse<T>;
      }

      const { businessId, rating, comment, verifiedVisit } = options.body || {};
      if (!businessId || !rating || !comment) {
        return createErrorResponse('VALIDATION_ERROR', 'businessId, rating (1-5), and comment are required', [
          { field: 'rating', message: 'Rating must be an integer between 1 and 5' },
          { field: 'comment', message: 'Review feedback is required' }
        ]) as unknown as ApiResponse<T>;
      }

      const newRev: BusinessReview = {
        id: `rev-${Date.now()}`,
        businessId,
        userId: authContext.userId,
        userName: authContext.email.split('@')[0],
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment,
        createdAt: 'Just now',
        verifiedVisit: !!verifiedVisit,
        helpfulCount: 0,
      };

      apiReviews = [newRev, ...apiReviews];

      // Update business review count and average
      const bizIndex = apiBusinesses.findIndex((b) => b.id === businessId);
      if (bizIndex >= 0) {
        const targetBiz = apiBusinesses[bizIndex];
        const newCount = targetBiz.reviewsCount + 1;
        const newRating = Math.round(((targetBiz.rating * targetBiz.reviewsCount + Number(rating)) / newCount) * 10) / 10;
        apiBusinesses[bizIndex] = {
          ...targetBiz,
          reviewsCount: newCount,
          rating: newRating,
        };
      }

      return createSuccessResponse(newRev, undefined, 'Review published successfully') as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 7. /api/v1/locations
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/locations' && method === 'GET') {
      return createSuccessResponse({
        countries: SUPPORTED_COUNTRIES,
        locations: HIERARCHICAL_LOCATIONS,
      }, {
        total: HIERARCHICAL_LOCATIONS.length,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 8. /api/v1/favorites
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/favorites' && method === 'GET') {
      if (!authContext) {
        return createErrorResponse('UNAUTHORIZED', 'Login required to view saved favorites') as unknown as ApiResponse<T>;
      }
      const userFavs = apiFavorites[authContext.userId] || [];
      const favBusinesses = apiBusinesses.filter((b) => userFavs.includes(b.id));
      return createSuccessResponse(favBusinesses, {
        total: favBusinesses.length,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    if (cleanPath === '/api/v1/favorites/toggle' && method === 'POST') {
      if (!authContext) {
        return createErrorResponse('UNAUTHORIZED', 'Login required to favorite businesses') as unknown as ApiResponse<T>;
      }
      const { businessId } = options.body || {};
      if (!businessId) {
        return createErrorResponse('VALIDATION_ERROR', 'businessId is required') as unknown as ApiResponse<T>;
      }

      const current = apiFavorites[authContext.userId] || [];
      const isFav = current.includes(businessId);
      const updated = isFav ? current.filter((id) => id !== businessId) : [...current, businessId];
      apiFavorites[authContext.userId] = updated;

      return createSuccessResponse({
        businessId,
        isFavorited: !isFav,
        totalFavorites: updated.length,
      }, undefined, isFav ? 'Removed from saved favorites' : 'Saved to favorites') as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 9. /api/v1/reports
    // -------------------------------------------------------------------------
    if (cleanPath === '/api/v1/reports' && method === 'POST') {
      const { targetType, targetId, reason } = options.body || {};
      if (!targetType || !targetId || !reason) {
        return createErrorResponse('VALIDATION_ERROR', 'targetType, targetId, and reason are required') as unknown as ApiResponse<T>;
      }

      const report = {
        id: `rep-${Date.now()}`,
        targetType,
        targetId,
        reason,
        reportedBy: authContext ? authContext.email : 'anonymous-visitor',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
      };
      apiReports = [report, ...apiReports];

      return createSuccessResponse(report, undefined, 'Report received and queued for moderator review') as unknown as ApiResponse<T>;
    }

    if (cleanPath === '/api/v1/reports' && method === 'GET') {
      if (!authContext || !authorizeRoles(['moderator', 'admin'], authContext.role)) {
        return createErrorResponse('FORBIDDEN', 'Moderator or Administrator privilege required to view reports') as unknown as ApiResponse<T>;
      }
      return createSuccessResponse(apiReports, {
        total: apiReports.length,
        executionTimeMs: Date.now() - startTime,
      }) as unknown as ApiResponse<T>;
    }

    // -------------------------------------------------------------------------
    // 10. /api/v1/admin
    // -------------------------------------------------------------------------
    if (cleanPath.startsWith('/api/v1/admin')) {
      if (!authContext || !authorizeRoles(['admin'], authContext.role)) {
        return createErrorResponse('FORBIDDEN', 'Super Administrator privilege required') as unknown as ApiResponse<T>;
      }

      if (cleanPath === '/api/v1/admin/stats') {
        return createSuccessResponse({
          totalBusinesses: apiBusinesses.length,
          verifiedBusinesses: apiBusinesses.filter((b) => b.verificationStatus === 'verified').length,
          totalReviews: apiReviews.length,
          pendingReports: apiReports.filter((r) => r.status === 'pending').length,
          totalUsers: SYSTEM_USERS.length,
          locationsSupported: HIERARCHICAL_LOCATIONS.length,
          systemStatus: 'healthy',
        }) as unknown as ApiResponse<T>;
      }

      if (cleanPath === '/api/v1/admin/businesses/verify' && method === 'POST') {
        const { businessId, status } = options.body || {};
        const bIndex = apiBusinesses.findIndex((b) => b.id === businessId);
        if (bIndex === -1) {
          return createErrorResponse('NOT_FOUND', `Business with ID ${businessId} not found`) as unknown as ApiResponse<T>;
        }
        apiBusinesses[bIndex] = {
          ...apiBusinesses[bIndex],
          verificationStatus: status || 'verified',
        };
        return createSuccessResponse(apiBusinesses[bIndex], undefined, `Business status set to ${status || 'verified'}`) as unknown as ApiResponse<T>;
      }
    }

    // Fallback 404
    return createErrorResponse('NOT_FOUND', `Endpoint ${method} ${cleanPath} not found in Bwana API v1 router`) as unknown as ApiResponse<T>;
  } catch (err: any) {
    return createErrorResponse('INTERNAL_SERVER_ERROR', err?.message || 'Unexpected server error') as unknown as ApiResponse<T>;
  }
}
