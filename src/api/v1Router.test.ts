import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiV1Request } from './v1Router';
import { resetRateLimits } from './middleware/rateLimiter';

describe('Bwana Versioned REST API (v1)', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  // 1. /api/v1/auth
  it('handles /api/v1/auth/login and returns token and user payload', async () => {
    const res = await handleApiV1Request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'm.mumba8@gmail.com', role: 'registered_user' },
    });

    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('token');
    expect(res.data.token).toContain('bwana_token_registered_user_');
    expect(res.data.user.email).toBe('m.mumba8@gmail.com');
  });

  // 2. /api/v1/businesses with pagination, filtering & sorting
  it('handles /api/v1/businesses with pagination, sorting, and filters', async () => {
    const res = await handleApiV1Request('/api/v1/businesses?page=1&limit=5&sortBy=rating&sortOrder=desc');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeLessThanOrEqual(5);
    expect(res.meta).toBeDefined();
    expect(res.meta?.page).toBe(1);
    expect(res.meta?.limit).toBe(5);
    expect(res.meta?.total).toBeGreaterThan(0);
    expect(res.meta?.totalPages).toBeGreaterThan(0);
  });

  // 3. /api/v1/categories
  it('handles /api/v1/categories and returns taxonomy', async () => {
    const res = await handleApiV1Request('/api/v1/categories');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('slug');
  });

  // 4. /api/v1/search with PostGIS spatial radius calculation
  it('handles /api/v1/search with spatial radius calculations', async () => {
    const res = await handleApiV1Request('/api/v1/search?lat=-12.8024&lng=28.2132&radius_km=15&q=Hardware');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    if (res.data.length > 0) {
      expect(res.data[0]).toHaveProperty('calculatedDistanceKm');
      expect(res.data[0].calculatedDistanceKm).toBeLessThanOrEqual(15);
    }
  });

  // 5. /api/v1/reviews & validation
  it('validates request parameters on /api/v1/reviews POST', async () => {
    // Missing auth
    const unauthRes = await handleApiV1Request('/api/v1/reviews', {
      method: 'POST',
      body: { businessId: 'biz-abc-hardware', rating: 5, comment: 'Great' },
    });
    expect(unauthRes.success).toBe(false);
    expect(unauthRes.error?.code).toBe('UNAUTHORIZED');

    // Authenticated
    const authRes = await handleApiV1Request('/api/v1/reviews', {
      method: 'POST',
      headers: { Authorization: 'Bearer bwana_token_registered_user_123' },
      body: { businessId: 'biz-abc-hardware', rating: 5, comment: 'Superior quality cement and tools' },
    });
    expect(authRes.success).toBe(true);
    expect(authRes.data.rating).toBe(5);
  });

  // 6. /api/v1/locations
  it('returns hierarchical countries and locations under /api/v1/locations', async () => {
    const res = await handleApiV1Request('/api/v1/locations');
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('countries');
    expect(res.data).toHaveProperty('locations');
    expect(Array.isArray(res.data.locations)).toBe(true);
  });

  // 7. /api/v1/favorites
  it('manages favorites with /api/v1/favorites/toggle', async () => {
    const res = await handleApiV1Request('/api/v1/favorites/toggle', {
      method: 'POST',
      headers: { Authorization: 'Bearer bwana_token_registered_user_usr-cust-01' },
      body: { businessId: 'biz-abc-hardware' },
    });
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('isFavorited');
  });

  // 8. /api/v1/reports & RBAC
  it('enforces RBAC on /api/v1/reports GET', async () => {
    // Ordinary user cannot view moderation reports
    const userRes = await handleApiV1Request('/api/v1/reports', {
      headers: { Authorization: 'Bearer bwana_token_registered_user_123' },
    });
    expect(userRes.success).toBe(false);
    expect(userRes.error?.code).toBe('FORBIDDEN');

    // Moderator or Admin can view reports
    const modRes = await handleApiV1Request('/api/v1/reports', {
      headers: { Authorization: 'Bearer bwana_token_moderator_mod-01' },
    });
    expect(modRes.success).toBe(true);
    expect(Array.isArray(modRes.data)).toBe(true);
  });

  // 9. /api/v1/admin
  it('enforces super administrator authorization on /api/v1/admin/stats', async () => {
    // Ordinary user denied
    const userRes = await handleApiV1Request('/api/v1/admin/stats', {
      headers: { Authorization: 'Bearer bwana_token_registered_user_123' },
    });
    expect(userRes.success).toBe(false);
    expect(userRes.error?.code).toBe('FORBIDDEN');

    // Admin allowed
    const adminRes = await handleApiV1Request('/api/v1/admin/stats', {
      headers: { Authorization: 'Bearer bwana_token_admin_admin-01' },
    });
    expect(adminRes.success).toBe(true);
    expect(adminRes.data).toHaveProperty('totalBusinesses');
    expect(adminRes.data.systemStatus).toBe('healthy');
  });
});
