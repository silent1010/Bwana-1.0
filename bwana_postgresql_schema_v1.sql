-- ==============================================================================
-- BWANA PLATFORM: POSTGRESQL 16+ & POSTGIS 3.x MASTER PRODUCTION SCHEMA (V1.0)
-- Zambian Commercial Discovery, Trade & Logistics Network
-- ==============================================================================
-- Addresses all relational-integrity constraints, PostGIS spatial indexing,
-- composite business/branch foreign keys, recursive hierarchy cycle prevention,
-- business owner invariants, and complete multi-domain platform architecture.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ------------------------------------------------------------------------------
-- 2. GEOGRAPHIC HIERARCHY & SPATIAL DATA
-- ------------------------------------------------------------------------------

-- Countries (ISO 3166-1 alpha-2 / alpha-3)
CREATE TABLE IF NOT EXISTS public.countries (
    id TEXT PRIMARY KEY,                       -- e.g. 'ZM', 'AO', 'CD'
    iso_code_2 VARCHAR(2) NOT NULL UNIQUE,     -- 'ZM'
    iso_code_3 VARCHAR(3) NOT NULL UNIQUE,     -- 'ZMB'
    name TEXT NOT NULL,                        -- 'Zambia'
    currency_code VARCHAR(3) NOT NULL,         -- 'ZMW'
    currency_symbol TEXT NOT NULL DEFAULT 'K', -- 'K' or 'ZMW'
    dial_code VARCHAR(10) NOT NULL,            -- '+260'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Administrative Areas (Provinces, Districts, Wards) with Composite Key on (id, country_id)
CREATE TABLE IF NOT EXISTS public.administrative_areas (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE RESTRICT,
    parent_id TEXT REFERENCES public.administrative_areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    area_type TEXT NOT NULL CHECK (area_type IN ('province', 'district', 'ward', 'zone')),
    code VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_admin_area_country UNIQUE (id, country_id),
    CONSTRAINT chk_admin_area_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

-- Recursive Hierarchy Cycle Prevention for Administrative Areas
CREATE OR REPLACE FUNCTION public.check_admin_area_cycle()
RETURNS TRIGGER AS $$
DECLARE
    visited_ids TEXT[];
    curr_parent TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    visited_ids := ARRAY[NEW.id];
    curr_parent := NEW.parent_id;

    WHILE curr_parent IS NOT NULL LOOP
        IF curr_parent = ANY(visited_ids) THEN
            RAISE EXCEPTION 'Cyclic administrative hierarchy detected for area % at parent %', NEW.id, curr_parent;
        END IF;
        visited_ids := array_append(visited_ids, curr_parent);

        SELECT parent_id INTO curr_parent
        FROM public.administrative_areas
        WHERE id = curr_parent;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_admin_area_cycle ON public.administrative_areas;
CREATE TRIGGER trg_check_admin_area_cycle
    BEFORE INSERT OR UPDATE OF parent_id ON public.administrative_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.check_admin_area_cycle();

-- Locations (Cities, Towns, Compounds) with PostGIS Point(4326) and Composite Country FK
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE RESTRICT,
    administrative_area_id TEXT REFERENCES public.administrative_areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,                        -- e.g. 'Kitwe', 'Ndola', 'Lusaka'
    urban_type TEXT DEFAULT 'city' CHECK (urban_type IN ('city', 'town', 'municipality', 'compound', 'rural_hub')),
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_locations_area_country 
        FOREIGN KEY (administrative_area_id, country_id) 
        REFERENCES public.administrative_areas(id, country_id) 
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_locations_geom_gist ON public.locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_locations_country ON public.locations (country_id);

-- ------------------------------------------------------------------------------
-- 3. USERS, IDENTITIES & ROLE-BASED ACCESS CONTROL (RBAC)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    national_id_masked TEXT,                   -- Zambian NRC e.g. 2948.../1
    is_nrc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    platform_role TEXT NOT NULL DEFAULT 'user' CHECK (platform_role IN ('user', 'merchant', 'scout', 'moderator', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Linked Authentication Identities (Google, Phone OTP, Supabase Auth)
CREATE TABLE IF NOT EXISTS public.auth_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'phone', 'email', 'supabase', 'firebase')),
    provider_user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);

-- Roles & Permissions M:N
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES & TAXONOMY (WITH CYCLE PREVENTION)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_categories_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE OR REPLACE FUNCTION public.check_category_cycle()
RETURNS TRIGGER AS $$
DECLARE
    visited_ids TEXT[];
    curr_parent TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    visited_ids := ARRAY[NEW.id];
    curr_parent := NEW.parent_id;

    WHILE curr_parent IS NOT NULL LOOP
        IF curr_parent = ANY(visited_ids) THEN
            RAISE EXCEPTION 'Cyclic category hierarchy detected for category % at parent %', NEW.id, curr_parent;
        END IF;
        visited_ids := array_append(visited_ids, curr_parent);

        SELECT parent_id INTO curr_parent
        FROM public.categories
        WHERE id = curr_parent;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_category_cycle ON public.categories;
CREATE TRIGGER trg_check_category_cycle
    BEFORE INSERT OR UPDATE OF parent_id ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.check_category_cycle();

-- ------------------------------------------------------------------------------
-- 5. BUSINESSES & MEMBERSHIP INVARIANTS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    primary_category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'claimed', 'verified')),
    pacra_registration_no TEXT,
    tpin_number TEXT,
    created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON public.businesses USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses (primary_category_id);

-- Business Members (M:N with Roles & Ownership Invariant)
CREATE TABLE IF NOT EXISTS public.business_members (
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
    is_primary_owner BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (business_id, user_id)
);

-- Trigger: When a business is created by a user, automatically grant them active owner membership
CREATE OR REPLACE FUNCTION public.auto_assign_business_creator_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NOT NULL THEN
        INSERT INTO public.business_members (business_id, user_id, role, is_primary_owner, status)
        VALUES (NEW.id, NEW.created_by, 'owner', TRUE, 'active')
        ON CONFLICT (business_id, user_id) 
        DO UPDATE SET role = 'owner', is_primary_owner = TRUE, status = 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_assign_business_owner ON public.businesses;
CREATE TRIGGER trg_auto_assign_business_owner
    AFTER INSERT ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_business_creator_owner();

-- Business Secondary Categories M:N
CREATE TABLE IF NOT EXISTS public.business_categories (
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (business_id, category_id)
);

-- ------------------------------------------------------------------------------
-- 6. BUSINESS LOCATIONS / BRANCHES (WITH POSTGIS & COMPOSITE KEY)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_locations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
    branch_name TEXT NOT NULL DEFAULT 'Main Branch',
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    is_headquarters BOOLEAN NOT NULL DEFAULT FALSE,
    is_open_now BOOLEAN NOT NULL DEFAULT TRUE,
    opening_hours JSONB DEFAULT '[]'::jsonb,   -- Array of {day: "Monday", open: "08:00", close: "17:00", isClosed: false}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- CRITICAL COMPOSITE CONSTRAINT: Enables child entities to guarantee matching business
    CONSTRAINT uq_business_location_id_business UNIQUE (id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_business_locations_geom_gist ON public.business_locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_business_locations_biz ON public.business_locations (business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_city ON public.business_locations (city);

-- Business Contact Channels with Composite FK on (business_location_id, business_id)
CREATE TABLE IF NOT EXISTS public.business_contact_channels (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_location_id TEXT,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('phone', 'whatsapp', 'email', 'website', 'facebook', 'instagram')),
    channel_value TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_contact_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 7. CATALOG ITEMS & INVENTORY (WITH COMPOSITE BRANCH/BUSINESS INTEGRITY)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.catalog_items (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_location_id TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL DEFAULT 'product' CHECK (item_type IN ('product', 'service', 'trade_quote')),
    name TEXT NOT NULL,
    description TEXT,
    price_minor_units BIGINT NOT NULL CHECK (price_minor_units >= 0), -- Stored in minor units (Ngwee for ZMW, e.g. K150.00 = 15000)
    currency_code VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    is_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- RELATIONAL INTEGRITY FIX: Branch must belong to the exact same business
    CONSTRAINT fk_catalog_items_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_business ON public.catalog_items (business_id);

-- Catalog Media / Images
CREATE TABLE IF NOT EXISTS public.catalog_item_media (
    id TEXT PRIMARY KEY,
    catalog_item_id TEXT NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. REVIEWS & MERCHANT RESPONSES (WITH COMPOSITE INTEGRITY)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_location_id TEXT,
    author_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    verified_visit BOOLEAN NOT NULL DEFAULT FALSE,
    is_nrc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Enforce 1 review per user per business (with update capability)
    CONSTRAINT uq_author_business_review UNIQUE (author_user_id, business_id),
    -- Composite unique key to bind review responses safely
    CONSTRAINT uq_review_id_business UNIQUE (id, business_id),
    -- RELATIONAL INTEGRITY FIX: Branch must belong to referenced business
    CONSTRAINT fk_reviews_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_biz ON public.reviews (business_id);

-- Review Responses (Guaranteed Match to Review Business)
CREATE TABLE IF NOT EXISTS public.review_responses (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL UNIQUE,
    business_id TEXT NOT NULL,
    responder_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- RELATIONAL INTEGRITY FIX: Response business must match review business
    CONSTRAINT fk_review_responses_review_business 
        FOREIGN KEY (review_id, business_id) 
        REFERENCES public.reviews(id, business_id) 
        ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 9. PROMOTIONS & FLASH DEALS (WITH COMPOSITE BRANCH INTEGRITY)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_location_id TEXT,
    title TEXT NOT NULL,
    tagline TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed_amount', 'bogo', 'free_shipping')),
    discount_value NUMERIC(10, 2) NOT NULL,
    terms TEXT,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_promo_discount_percent CHECK (discount_type <> 'percent' OR (discount_value > 0 AND discount_value <= 100)),
    CONSTRAINT chk_promo_valid_dates CHECK (valid_until >= valid_from),
    -- RELATIONAL INTEGRITY FIX: Branch must belong to referenced business
    CONSTRAINT fk_promotions_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_promotions_business ON public.promotions (business_id);
CREATE INDEX IF NOT EXISTS idx_promotions_validity ON public.promotions (valid_from, valid_until) WHERE is_active = TRUE;

-- ------------------------------------------------------------------------------
-- 10. STATUTORY VERIFICATIONS, CLAIMS & DISPUTES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_verification_requests (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    submitted_by_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    pacra_registration_no TEXT NOT NULL,
    tpin_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    notes TEXT,
    reviewed_by_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_documents (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES public.business_verification_requests(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('pacra_cert', 'zra_tpin', 'council_permit', 'utility_bill', 'nrc_director')),
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Claims & Ownership Dispute Workflow
CREATE TABLE IF NOT EXISTS public.business_claims (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    claimant_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    business_email TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (claim_status IN ('pending', 'verified', 'rejected', 'disputed')),
    official_role TEXT NOT NULL,
    notes TEXT,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. WIDER PRODUCT DOMAINS: PROFESSIONALS, EVENTS, OPPORTUNITIES
-- ------------------------------------------------------------------------------

-- Verified Professionals & Artisan Directory
CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    headline TEXT NOT NULL,
    field_of_expertise TEXT NOT NULL,         -- e.g. 'Electrical Engineering', 'Plumbing'
    bio TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    hourly_rate_zmw NUMERIC(10, 2),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professionals_geom_gist ON public.professionals USING GIST (geom);

CREATE TABLE IF NOT EXISTS public.professional_skills (
    professional_id TEXT NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    PRIMARY KEY (professional_id, skill_name)
);

CREATE TABLE IF NOT EXISTS public.professional_portfolio (
    id TEXT PRIMARY KEY,
    professional_id TEXT NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    completed_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community Events & Trade Expos
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
    organizer_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    ticket_price_zmw NUMERIC(10, 2) DEFAULT 0.0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_events_geom_gist ON public.events USING GIST (geom);

-- Opportunities: Jobs, Tenders & Kantemba Bulk Restock Bids
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('job', 'tender', 'scholarship', 'wholesale_bulk')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    location_city TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    proposal_text TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. IMMUTABLE AUDIT LOGGING (TAMPER-RESISTANT TRIGGER)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    payload JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent any UPDATE or DELETE on audit logs to ensure statutory immutability
CREATE OR REPLACE FUNCTION public.enforce_audit_log_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE or DELETE operations are strictly forbidden.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_audit_log_immutability();

-- ------------------------------------------------------------------------------
-- 13. SPATIAL DISCOVERY STORED PROCEDURE (POSTGIS ST_DWithin)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_nearby_businesses(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 5000,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    business_id TEXT,
    business_name TEXT,
    branch_name TEXT,
    address TEXT,
    city TEXT,
    distance_km DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating NUMERIC(3, 2),
    reviews_count INTEGER,
    verification_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id AS business_id,
        b.name AS business_name,
        bl.branch_name,
        bl.address,
        bl.city,
        (ST_Distance(bl.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000.0)::DOUBLE PRECISION AS distance_km,
        bl.latitude,
        bl.longitude,
        b.rating,
        b.reviews_count,
        b.verification_status
    FROM public.business_locations bl
    JOIN public.businesses b ON b.id = bl.business_id
    WHERE ST_DWithin(
        bl.geom, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radius_meters
    )
    AND b.is_active = TRUE
    ORDER BY ST_Distance(bl.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
