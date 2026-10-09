# BWANA — Database Architecture & Spatial Engineering

## 1. Entity-Relationship Diagram (ERD)

```
       +--------------------+
       |     COUNTRIES      |
       +--------------------+
                 | 1
                 | has many
                 v N
       +--------------------+
       |    PROVINCES       |
       +--------------------+
                 | 1
                 | has many
                 v N
       +--------------------+
       |      CITIES        |
       +--------------------+
                 | 1
                 | has many
                 v N
       +--------------------+          1:N         +--------------------+
       |  LOCATION_AREAS    |--------------------->|     BUSINESSES     |
       +--------------------+                      +--------------------+
                                                             |
                 +-------------------+-----------------------+-------------------+
                 | 1:N               | 1:N                   | 1:N               | 1:N
                 v                   v                       v                   v
       +--------------------+ +--------------------+ +--------------------+ +--------------------+
       |      PRODUCTS      | |     SERVICES       | |    PROMOTIONS      | |     REVIEWS        |
       +--------------------+ +--------------------+ +--------------------+ +--------------------+
                                                                                 | 1:N
                                                                                 v
                                                                            +--------------------+
                                                                            |  REVIEW_RESPONSES  |
                                                                            +--------------------+

       +--------------------+         1:N          +--------------------+
       |   SYSTEM_USERS     |--------------------->|    AUDIT_LOGS      |
       +--------------------+                      +--------------------+
                 | 1:N
                 v
       +--------------------+
       |   VERIFICATIONS    |
       +--------------------+
```

---

## 2. PostgreSQL + PostGIS Spatial Schema DDL

```sql
-- Enable PostGIS extension for high-performance spatial queries
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Geographical Hierarchy (Zambia & Southern Africa Ready)
CREATE TABLE countries (
    id VARCHAR(3) PRIMARY KEY, -- e.g. 'ZMB', 'ZWE', 'BWA'
    name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    dial_code VARCHAR(5) NOT NULL DEFAULT '+260'
);

CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id VARCHAR(3) REFERENCES countries(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID REFERENCES provinces(id),
    name VARCHAR(100) NOT NULL,
    coordinates GEOGRAPHY(Point, 4326) NOT NULL
);

-- 2. Core Business Entity with Spatial Geography
CREATE TABLE businesses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    tagline VARCHAR(300),
    description TEXT,
    category_id VARCHAR(64) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified', 'claimed', 'verified', 'suspended')),
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    reviews_count INT NOT NULL DEFAULT 0,
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    email VARCHAR(120),
    website VARCHAR(255),
    address VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL, -- PostGIS Coordinate point
    is_open_now BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    claimed_by_user_id VARCHAR(64),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PostGIS Spatial GIST Index for Sub-Millisecond Radius Searching
CREATE INDEX idx_businesses_location_gist ON businesses USING GIST (location);
CREATE INDEX idx_businesses_category ON businesses (category_id);
CREATE INDEX idx_businesses_verification ON businesses (verification_status);
CREATE INDEX idx_businesses_tags ON businesses USING GIN (tags);

-- 4. Customer Reviews Table with Constraints
CREATE TABLE reviews (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    helpful_count INT NOT NULL DEFAULT 0,
    verified_visit BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    response_comment TEXT,
    response_responded_at TIMESTAMPTZ,
    response_responder_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_business_id ON reviews (business_id);

-- 5. Statutory Verification Requests (PACRA & ZRA TPIN Audit Trail)
CREATE TABLE verifications (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) REFERENCES businesses(id),
    business_name VARCHAR(200) NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(120) NOT NULL,
    applicant_phone VARCHAR(30) NOT NULL,
    pacra_registration_no VARCHAR(50) NOT NULL,
    tpin_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(120)
);

-- 6. Immutable Append-Only Audit Log Table
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL,
    action VARCHAR(60) NOT NULL,
    target_entity VARCHAR(60) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
```

---

## 3. PostGIS Query Examples

### Find Verified Businesses within 5 km of User GPS Coordinates
```sql
SELECT 
    id, 
    name, 
    category_name, 
    rating, 
    reviews_count, 
    ROUND((ST_Distance(location, ST_SetSRID(ST_MakePoint(28.2145, -12.8041), 4326)) / 1000)::numeric, 1) AS distance_km
FROM businesses
WHERE 
    verification_status = 'verified'
    AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(28.2145, -12.8041), 4326), 5000)
ORDER BY location <-> ST_SetSRID(ST_MakePoint(28.2145, -12.8041), 4326)
LIMIT 20;
```

---

## 4. Cloud Firestore Live Schema Mapping

The live app utilizes Cloud Firestore (`ai-studio-bwana-d9336748-f031-436d-bcac-cb70413ff046`) matching this schema:
- `/businesses/{businessId}`: Complete business profile, coordinates, operating hours, catalog products, and tag array.
- `/reviews/{reviewId}`: Customer reviews with ratings (1–5) and merchant responses.
- `/verifications/{verificationId}`: Statutory compliance applications.
- `/auditLogs/{logId}`: Append-only compliance log.
- `/notifications/{notificationId}`: Real-time user & merchant alerts.
