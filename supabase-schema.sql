-- ==============================================================================
-- BWANA PLATFORM: SUPABASE POSTGRESQL PRODUCTION MIGRATION & RLS POLICIES
-- Target: Supabase PostgreSQL 16+ & PostGIS 3.x
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. GEOGRAPHIC HIERARCHY
CREATE TABLE IF NOT EXISTS public.countries (
    id TEXT PRIMARY KEY,
    iso_code_2 VARCHAR(2) NOT NULL UNIQUE,
    iso_code_3 VARCHAR(3) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    dial_code VARCHAR(10) NOT NULL DEFAULT '+260',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.countries (id, iso_code_2, iso_code_3, name, currency_code, dial_code)
VALUES ('ZM', 'ZM', 'ZMB', 'Zambia', 'ZMW', '+260')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.administrative_areas (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE RESTRICT,
    parent_id TEXT REFERENCES public.administrative_areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    area_type TEXT NOT NULL CHECK (area_type IN ('province', 'district', 'ward', 'zone')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_admin_area_country UNIQUE (id, country_id),
    CONSTRAINT chk_admin_area_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL REFERENCES public.countries(id) ON DELETE RESTRICT,
    administrative_area_id TEXT REFERENCES public.administrative_areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
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

-- 3. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    national_id_masked TEXT,
    is_nrc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    platform_role TEXT NOT NULL DEFAULT 'user' CHECK (platform_role IN ('user', 'merchant', 'scout', 'moderator', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_categories_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

-- 5. BUSINESSES
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
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON public.businesses USING GIN (name gin_trgm_ops);

-- Business Members & Roles (Guarantees owner invariant)
CREATE TABLE IF NOT EXISTS public.business_members (
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
    is_primary_owner BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (business_id, user_id)
);

-- Auto-grant owner role to creator
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

-- 6. BUSINESS LOCATIONS / BRANCHES (Composite Unique Key)
CREATE TABLE IF NOT EXISTS public.business_locations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES public.locations(id) ON DELETE SET NULL,
    branch_name TEXT NOT NULL DEFAULT 'Main Branch',
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    is_open_now BOOLEAN NOT NULL DEFAULT TRUE,
    opening_hours JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_business_location_id_business UNIQUE (id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_business_locations_geom_gist ON public.business_locations USING GIST (geom);

-- 7. CATALOG ITEMS (Composite FK)
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_location_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price_minor_units BIGINT NOT NULL CHECK (price_minor_units >= 0),
    currency_code VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    is_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_catalog_items_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

-- 8. REVIEWS & RESPONSES (Composite FK)
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_author_business_review UNIQUE (author_user_id, business_id),
    CONSTRAINT uq_review_id_business UNIQUE (id, business_id),
    CONSTRAINT fk_reviews_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.review_responses (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL UNIQUE,
    business_id TEXT NOT NULL,
    responder_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_review_responses_review_business 
        FOREIGN KEY (review_id, business_id) 
        REFERENCES public.reviews(id, business_id) 
        ON DELETE CASCADE
);

-- 9. PROMOTIONS (Composite FK)
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
    CONSTRAINT fk_promotions_branch_business 
        FOREIGN KEY (business_location_id, business_id) 
        REFERENCES public.business_locations(id, business_id) 
        ON DELETE CASCADE
);

-- 10. PROFESSIONALS, EVENTS, OPPORTUNITIES & CLAIMS
CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    headline TEXT NOT NULL,
    field_of_expertise TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hourly_rate_zmw NUMERIC(10, 2),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    city TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    ticket_price_zmw NUMERIC(10, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE CASCADE,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('job', 'tender', 'scholarship', 'wholesale_bulk')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    location_city TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_claims (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    claimant_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    business_email TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (claim_status IN ('pending', 'verified', 'rejected')),
    official_role TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS (Immutable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrative_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for public commercial discovery
CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Public read business_locations" ON public.business_locations FOR SELECT USING (true);
CREATE POLICY "Public read catalog_items" ON public.catalog_items FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read review_responses" ON public.review_responses FOR SELECT USING (true);
CREATE POLICY "Public read promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Public read professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read opportunities" ON public.opportunities FOR SELECT USING (true);

-- Authenticated member policies
CREATE POLICY "Users can create businesses" ON public.businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Members can update businesses" ON public.businesses FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.business_members bm 
        WHERE bm.business_id = id AND bm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Business owners can reply to reviews" ON public.review_responses FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.business_members bm 
        WHERE bm.business_id = business_id AND bm.role IN ('owner', 'admin', 'manager')
    )
);
