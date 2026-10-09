# BWANA — RESTful API Specification (v1)

## 1. Standard Response Envelope

All API endpoints return a predictable JSON envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 128,
    "timestamp": "2026-09-28T04:30:00Z"
  },
  "error": null
}
```

---

## 2. Core Endpoints

### 2.1 Discovery & Spatial Search
- **`GET /api/v1/search`**
  - **Query Params:**
    - `q` (string): Keyword search (e.g. `cement`, `mechanic`, `t-bone`)
    - `lat` (float): Latitude (e.g. `-12.8041`)
    - `lng` (float): Longitude (e.g. `28.2145`)
    - `radius_km` (number): Proximity radius (default: `10`)
    - `category_id` (string): Category identifier
    - `tag` (string): Attribute filter (e.g. `24/7 Open`, `Wheelchair Accessible`)
    - `verified_only` (boolean): Filter for PACRA/ZRA verified
    - `sort` (enum: `distance`, `rating`, `reviews`)
  - **Response 200 OK:** Returns list of matching `Business` objects with computed `distanceKm`.

### 2.2 Businesses
- **`GET /api/v1/businesses/{id}`**: Returns detailed business profile, products, services, operating hours, and social links.
- **`POST /api/v1/businesses`**: Register a new enterprise.
- **`PATCH /api/v1/businesses/{id}`**: Update catalog, operating hours, phone, or address (Owner/Admin only).

### 2.3 Reviews & Ratings
- **`GET /api/v1/businesses/{id}/reviews`**: Fetch customer reviews and responses.
- **`POST /api/v1/businesses/{id}/reviews`**: Submit review (validates rating between 1 and 5).
- **`POST /api/v1/reviews/{id}/helpful`**: Increment helpful vote counter.
- **`POST /api/v1/reviews/{id}/response`**: Merchant response to customer review.

### 2.4 Statutory Verifications
- **`POST /api/v1/verifications`**: Submit PACRA registration and ZRA TPIN for review.
- **`GET /api/v1/admin/verifications`**: List pending verification applications.
- **`POST /api/v1/admin/verifications/{id}/approve`**: Approve verification, mark business as verified, notify owner, write audit log.
- **`POST /api/v1/admin/verifications/{id}/reject`**: Reject verification with explicit statutory reason.

---

## 3. Error Handling (RFC 7807)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_RATING_BOUNDARY",
    "message": "Rating must be an integer between 1 and 5 stars.",
    "details": { "field": "rating", "received": 6 },
    "requestId": "req-98f2-11ef"
  }
}
```
