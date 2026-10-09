import React, { useState } from 'react';
import {
  Database,
  Layers,
  Server,
  Code2,
  Copy,
  Check,
  Compass,
  Play,
  Terminal,
  Cpu,
  FileCode,
  Shield,
  MapPin
} from 'lucide-react';
import { LOCATIONS, INITIAL_BUSINESSES, calculateDistanceKm } from '../../data/mockData';
import { ServicesSpecView } from './ServicesSpecView';

export const EngineeringSpec: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedSpecTab, setSelectedSpecTab] = useState<'architecture' | 'services_spec' | 'schema' | 'spatial_sandbox' | 'api_gateway'>('services_spec');

  // Interactive Spatial Query Sandbox state
  const [originCity, setOriginCity] = useState('loc-kitwe');
  const [radiusKm, setRadiusKm] = useState(10);
  const [sandboxExecuted, setSandboxExecuted] = useState(true);

  const selectedLoc = LOCATIONS.find((l) => l.id === originCity) || LOCATIONS[0];

  // Calculated spatial query results simulating PostGIS ST_DWithin
  const spatialResults = INITIAL_BUSINESSES.map((b) => {
    const dist = calculateDistanceKm(
      selectedLoc.coordinates.latitude,
      selectedLoc.coordinates.longitude,
      b.coordinates.latitude,
      b.coordinates.longitude
    );
    return {
      ...b,
      calculatedDistKm: dist,
      isWithinRadius: dist <= radiusKm,
    };
  }).filter((b) => b.isWithinRadius);

  const sqlDDLSchema = `-- =========================================================================
-- BWANA PLATFORM MASTER DATABASE DESIGN
-- Engine: PostgreSQL 16+ with PostGIS 3.4 Spatial Extensions
-- Primary Market: Republic of Zambia & Southern African Development Community (SADC)
-- =========================================================================

-- 1. Enable Required Spatial & Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Trigram search for fuzzy business names

-- 2. Enumerated Domain Types
CREATE TYPE user_role_enum AS ENUM ('customer', 'business_owner', 'professional', 'bwana_staff', 'admin');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'claimed', 'verified');
CREATE TYPE price_type_enum AS ENUM ('fixed', 'starting_from', 'price_range', 'contact_for_price', 'negotiable');
CREATE TYPE opportunity_type_enum AS ENUM ('job', 'tender', 'internship', 'scholarship', 'business_grant');

-- 3. Hierarchical Geographic & Administrative Data Model (Multi-Country Ready)
-- Model: Country → Province/Region → District → City/Town → Area/Neighborhood → Coordinates
CREATE TABLE countries (
    code VARCHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2 (e.g., 'ZM', 'ZW', 'BW', 'MW', 'NA', 'MZ', 'ZA', 'TZ')
    name VARCHAR(100) NOT NULL, -- e.g., 'Zambia', 'Zimbabwe', 'Botswana'
    currency_code VARCHAR(3) NOT NULL, -- e.g., 'ZMW', 'USD', 'BWP'
    currency_symbol VARCHAR(10) NOT NULL, -- e.g., 'K', '$', 'P'
    phone_prefix VARCHAR(10) NOT NULL, -- e.g., '+260', '+263', '+267'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE provinces_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code VARCHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., 'Copperbelt', 'Lusaka', 'Southern', 'Harare Province'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_provinces_country ON provinces_regions(country_code);

CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID NOT NULL REFERENCES provinces_regions(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., 'Kitwe', 'Ndola', 'Livingstone', 'Lusaka'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_districts_province ON districts(province_id);

CREATE TABLE cities_towns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    province_id UUID NOT NULL REFERENCES provinces_regions(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g., 'Kitwe', 'Ndola', 'Lusaka', 'Solwezi', 'Kasama', 'Mongu'
    is_major_city BOOLEAN NOT NULL DEFAULT FALSE,
    geom GEOGRAPHY(Point, 4326) NOT NULL, -- WGS84 Spatial Geography Point
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cities_geom ON cities_towns USING GIST (geom);
CREATE INDEX idx_cities_district ON cities_towns(district_id);

CREATE TABLE areas_neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities_towns(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g., 'Parklands', 'Riverside', 'Kabulonga', 'Town Centre'
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_areas_geom ON areas_neighborhoods USING GIST (geom);

-- 4. User Accounts & Identity
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(32) UNIQUE, -- Format: +26097xxxxxxx
    password_hash VARCHAR(255),
    role user_role_enum NOT NULL DEFAULT 'customer',
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);

-- 5. Business Categories Taxonomy
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    icon_identifier VARCHAR(100),
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_categories_slug ON categories(slug);

-- 6. Core Business Entity with PostGIS Spatial Geography
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(500),
    description TEXT,
    primary_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    verification_status verification_status_enum NOT NULL DEFAULT 'unverified',
    claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(64) NOT NULL,
    whatsapp_number VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    website_url TEXT,
    street_address TEXT NOT NULL,
    area_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    
    -- Spatial Geography Column (Coordinates: lon, lat in WGS84)
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    reviews_count INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crucial: PostGIS Spatial GIST Index for Sub-Millisecond Distance Searches
CREATE INDEX idx_businesses_geom ON businesses USING GIST (geom);
CREATE INDEX idx_businesses_trgm_name ON businesses USING GIN (name gin_trgm_ops);
CREATE INDEX idx_businesses_category ON businesses(primary_category_id);
CREATE INDEX idx_businesses_rating ON businesses(average_rating DESC);

-- 7. Products Catalog with Zambian Kwacha (ZMW) Pricing Models
CREATE TABLE business_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    price_type price_type_enum NOT NULL DEFAULT 'fixed',
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    category_label VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_business_products_biz ON business_products(business_id);

-- 8. Services Catalog with Pricing Models
CREATE TABLE business_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    price_type price_type_enum NOT NULL DEFAULT 'starting_from',
    estimated_duration VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_business_services_biz ON business_services(business_id);

-- 9. Active Promotions & Weekend Deals
CREATE TABLE business_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    tagline TEXT NOT NULL,
    discount_percentage INT CHECK (discount_percentage BETWEEN 1 AND 100),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    terms_conditions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_promotions_active_dates ON business_promotions(valid_from, valid_until) WHERE is_active = TRUE;

-- 10. Independent Professionals (Michael M. Software Developer, Contractors, Trades)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    professional_title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    skills_array TEXT[] NOT NULL,
    hourly_rate_zmw NUMERIC(10,2),
    bio TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_professionals_geom ON professionals USING GIST (geom);
CREATE INDEX idx_professionals_skills ON professionals USING GIN (skills_array);

-- 11. Customer Reviews with Anti-Abuse Controls & Business Responses
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment_text TEXT NOT NULL,
    is_verified_visit BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_upvotes INT NOT NULL DEFAULT 0,
    is_flagged_for_spam BOOLEAN NOT NULL DEFAULT FALSE,
    business_response_text TEXT,
    business_responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE UNIQUE INDEX idx_unique_user_business_review ON reviews(business_id, user_id);

-- 12. Statutory Verification Dossier (PACRA & ZRA TPIN)
CREATE TABLE business_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    applicant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pacra_registration_no VARCHAR(100) NOT NULL,
    zra_tpin_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_staff_id UUID REFERENCES users(id),
    decision_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);
CREATE INDEX idx_verifications_status ON business_verifications(status);

-- 13. System Audit Log Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    actor_email VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details JSONB,
    client_ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlDDLSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 mb-8 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                PRD SECTIONS 20, 22 & 23
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-300">Engineering Specification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight mt-1">
              Bwana 1.0 System Architecture & PostGIS Schema
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              From idea to engineering specification: High-throughput microservice boundaries, PostGIS spatial indexing, and PostgreSQL 16 relational design.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL DDL Copied!' : 'Copy PostgreSQL DDL'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedSpecTab('services_spec')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            selectedSpecTab === 'services_spec'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Services Spec (Gateway, Identity, Discovery, Business)</span>
        </button>

        <button
          onClick={() => setSelectedSpecTab('architecture')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            selectedSpecTab === 'architecture'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>System Topology Overview</span>
        </button>

        <button
          onClick={() => setSelectedSpecTab('schema')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            selectedSpecTab === 'schema'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL + PostGIS Schema (DDL)</span>
        </button>

        <button
          onClick={() => setSelectedSpecTab('spatial_sandbox')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            selectedSpecTab === 'spatial_sandbox'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Spatial Query Sandbox (ST_DWithin)</span>
        </button>

        <button
          onClick={() => setSelectedSpecTab('api_gateway')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            selectedSpecTab === 'api_gateway'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>API Gateway Endpoints Specification</span>
        </button>
      </div>

      {/* SERVICES SPECIFICATION TAB */}
      {selectedSpecTab === 'services_spec' && <ServicesSpecView />}

      {/* ARCHITECTURE DIAGRAM TAB */}
      {selectedSpecTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-display text-stone-900">
                Bwana Ecosystem Multi-Tier Architecture (PRD Section 22 & 23)
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Decoupled domain boundaries: client tier, unified API gateway with rate-limiting, stateless microservice layer, and persistent geo-spatial storage.
              </p>
            </div>

            {/* Architecture Visual Topology Box */}
            <div className="bg-stone-950 text-stone-100 p-6 rounded-xl font-mono text-xs overflow-x-auto border border-stone-800 leading-relaxed">
              <div className="text-emerald-400 font-bold mb-3">// 1. CLIENT PLATFORMS TIER</div>
              <div className="pl-4 text-stone-300">
                [Web SPA (React 19)]  ───  [Android Mobile App]  ───  [iOS Mobile App]
              </div>
              <div className="pl-24 text-stone-500">│</div>
              <div className="pl-24 text-stone-500">▼ (HTTPS / TLS 1.3 · JWT Access Tokens · Brotli)</div>

              <div className="text-emerald-400 font-bold mt-4 mb-3">// 2. API GATEWAY & EDGE INGRESS</div>
              <div className="pl-4 text-stone-300">
                ┌────────────────────────────────────────────────────────────────────────┐
                <br />│  BWANA API GATEWAY (Rate Limiting · JWT Auth Validator · CORS · Telemetry) │
                <br />└────────────────────────────────────────────────────────────────────────┘
              </div>
              <div className="pl-24 text-stone-500">│</div>
              <div className="pl-24 text-stone-500">▼ (gRPC / Internal High-Speed Mesh)</div>

              <div className="text-emerald-400 font-bold mt-4 mb-3">// 3. DOMAIN MICROSERVICES (PRD SECTION 22)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-stone-200">
                <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                  <div className="text-amber-400 font-bold">IDENTITY SERVICE</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    • Phone OTP (+260 SMS Gateway)<br />
                    • Google OAuth & Email/Pass<br />
                    • RBAC (5 Roles) & Sessions
                  </div>
                </div>

                <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                  <div className="text-emerald-400 font-bold">DISCOVERY SERVICE</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    • PostGIS ST_DWithin Geofence<br />
                    • Query Intent NLP & Categories<br />
                    • Distance Ranking Engine
                  </div>
                </div>

                <div className="p-3 bg-stone-900 border border-stone-800 rounded">
                  <div className="text-blue-400 font-bold">BUSINESS SERVICE</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    • Profiles & Catalog (Kwacha ZMW)<br />
                    • Promotions & Lead Metrics<br />
                    • PACRA & ZRA TPIN Queue
                  </div>
                </div>
              </div>

              <div className="pl-24 text-stone-500 mt-2">│</div>
              <div className="pl-24 text-stone-500">▼</div>

              <div className="text-emerald-400 font-bold mt-2 mb-3">// 4. PERSISTENT STORAGE & CACHE LAYER</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-stone-200">
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded">
                  <div className="text-emerald-300 font-bold">PostgreSQL 16 + PostGIS</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Authoritative spatial geometry, relational schema, GIST indexes
                  </div>
                </div>

                <div className="p-3 bg-red-950/40 border border-red-800 rounded">
                  <div className="text-red-300 font-bold">Redis 7 Cluster</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Rate limiting, active sessions, location geo-hashes & hot caches
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/40 border border-cyan-800 rounded">
                  <div className="text-cyan-300 font-bold">Search Index</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Trigram fuzzy matching for business names & Zambian colloquialisms
                  </div>
                </div>

                <div className="p-3 bg-purple-950/40 border border-purple-800 rounded">
                  <div className="text-purple-300 font-bold">Object Storage</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    S3/GCS bucket for storefront imagery, PACRA PDFs & evidence
                  </div>
                </div>
              </div>
            </div>

            {/* Architectural Decisions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Why PostGIS Geography Over Simple Lat/Lng Floats?</span>
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  Treating latitude and longitude as ordinary floating-point numbers causes severe Euclidean distortion on spherical earth surfaces, making radius queries inaccurate across Zambia (spanning ~1,200 km). PostGIS uses ellipsoidal spatial mathematics (WGS84 spheroids) with fast R-tree GIST indexing, calculating sub-millisecond bounding boxes for millions of records.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>Zambian Market Network Optimization</span>
                </h4>
                <p className="text-stone-600 leading-relaxed">
                  To ensure rapid loading on 3G and 4G mobile networks across the Copperbelt, Lusaka, and Southern provinces, the API uses compressed payloads, local device caching of category taxonomies, and WhatsApp direct deep-links that bypass heavy native messaging overhead.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEMA DDL TAB */}
      {selectedSpecTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-stone-900">
                Production PostgreSQL 16 + PostGIS 3.4 DDL Schema
              </h3>
              <p className="text-xs text-stone-500">
                13 core relational tables, primary keys, foreign key constraints, and spatial GIST indexes.
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 overflow-x-auto max-h-[700px]">
            <pre className="text-xs font-mono text-stone-200 leading-relaxed">
              <code>{sqlDDLSchema}</code>
            </pre>
          </div>
        </div>
      )}

      {/* LIVE SPATIAL QUERY SANDBOX TAB */}
      {selectedSpecTab === 'spatial_sandbox' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold font-display text-stone-900">
                Interactive PostGIS Spatial Query Simulator
              </h3>
              <p className="text-xs text-stone-500">
                Test the actual SQL distance calculations executed when a user searches in Kitwe or Lusaka.
              </p>
            </div>

            {/* Sandbox Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Origin Reference Coordinate (GPS / City)
                </label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-800"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.coordinates.latitude.toFixed(4)}, {loc.coordinates.longitude.toFixed(4)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  PostGIS ST_DWithin Radius (km)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-stone-900 w-12 text-right">
                    {radiusKm} km
                  </span>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setSandboxExecuted(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Spatial Query</span>
                </button>
              </div>
            </div>

            {/* Generated PostGIS SQL Statement */}
            <div className="p-4 bg-stone-950 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto border border-stone-800 space-y-1">
              <div className="text-stone-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulated Backend Query to PostgreSQL 16 + PostGIS:</span>
              </div>
              <div className="text-emerald-300 pt-1">
                SELECT id, name, area_name, city,
                <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ST_Distance(geom, ST_SetSRID(ST_MakePoint({selectedLoc.coordinates.longitude}, {selectedLoc.coordinates.latitude}), 4326)::geography) / 1000.0 AS distance_km
                <br />FROM businesses
                <br />WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint({selectedLoc.coordinates.longitude}, {selectedLoc.coordinates.latitude}), 4326)::geography, {radiusKm * 1000})
                <br />ORDER BY distance_km ASC
                <br />LIMIT 25;
              </div>
            </div>

            {/* Query Results */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                <span>Returned Spatial Matches ({spatialResults.length})</span>
                <span className="text-[11px] font-mono text-emerald-700">Query Time: ~0.84ms (GIST Index Hit)</span>
              </div>

              {spatialResults.length === 0 ? (
                <div className="p-6 text-center text-stone-500 bg-stone-50 rounded-xl text-xs">
                  No businesses found within {radiusKm} km of {selectedLoc.name}. Increase radius or change origin location.
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {spatialResults.map((b) => (
                    <div key={b.id} className="p-3.5 bg-white flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-stone-900">{b.name}</div>
                        <div className="text-stone-500 text-[11px]">{b.area}, {b.city} ({b.province})</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {b.calculatedDistKm} km
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">True Spherical Dist</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API GATEWAY ENDPOINTS TAB */}
      {selectedSpecTab === 'api_gateway' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-display text-stone-900">
                Bwana v1.0 Production REST API Endpoints Specification
              </h3>
              <p className="text-xs text-stone-500">
                Standardized contracts with request validation, DTOs, rate-limiting, error structures, filtering, sorting, and pagination.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
              Consistent Response: ApiResponse&lt;T&gt;
            </span>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Method</th>
                  <th className="p-3 font-mono">Endpoint Path</th>
                  <th className="p-3">Auth & RBAC</th>
                  <th className="p-3">Features & DTO Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                <tr>
                  <td className="p-3"><span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">POST</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/auth/login</td>
                  <td className="p-3 text-stone-600 font-sans">Public (60 req/min)</td>
                  <td className="p-3 text-stone-600 font-sans">Body: {`{ email/phone, role }`}. Issues JWT Bearer token & session DTO.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/users</td>
                  <td className="p-3 text-stone-600 font-sans">Registered / Admin</td>
                  <td className="p-3 text-stone-600 font-sans">Returns authenticated users, profiles, and configurable staff permissions.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/businesses</td>
                  <td className="p-3 text-stone-600 font-sans">Public (No Auth Req)</td>
                  <td className="p-3 text-stone-600 font-sans">Filtering (category, city, verified), Sorting (rating, reviewsCount), Pagination (page, limit, totalPages).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">POST</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/businesses</td>
                  <td className="p-3 text-stone-600 font-sans">Owner / Admin</td>
                  <td className="p-3 text-stone-600 font-sans">Request validation DTO. Creates listing and queues verification request.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/categories</td>
                  <td className="p-3 text-stone-600 font-sans">Public (Cached CDN)</td>
                  <td className="p-3 text-stone-600 font-sans">Returns commercial category taxonomy with merchant count badges.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/search</td>
                  <td className="p-3 text-stone-600 font-sans">Public (PostGIS Spatial)</td>
                  <td className="p-3 text-stone-600 font-sans">Params: lat, lng, radius_km, q. Orders by spherical distance & keyword match.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/reviews</td>
                  <td className="p-3 text-stone-600 font-sans">Public</td>
                  <td className="p-3 text-stone-600 font-sans">Filter by businessId. Returns ratings, verified visit badges, and responses.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">POST</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/reviews</td>
                  <td className="p-3 text-stone-600 font-sans">Registered User (Bearer)</td>
                  <td className="p-3 text-stone-600 font-sans">Validation: rating (1-5), comment. Updates aggregate business score.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/locations</td>
                  <td className="p-3 text-stone-600 font-sans">Public</td>
                  <td className="p-3 text-stone-600 font-sans">Returns 6-tier hierarchical locations (Country → Province → District → Town).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">POST</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/favorites/toggle</td>
                  <td className="p-3 text-stone-600 font-sans">Registered User (Bearer)</td>
                  <td className="p-3 text-stone-600 font-sans">Body: {`{ businessId }`}. Toggles saved state and updates bookmarks count.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">POST</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/reports</td>
                  <td className="p-3 text-stone-600 font-sans">Registered / Public</td>
                  <td className="p-3 text-stone-600 font-sans">Body: {`{ targetType, targetId, reason }`}. Queues for moderation desk.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">GET</span></td>
                  <td className="p-3 font-semibold text-stone-900">/api/v1/admin/stats</td>
                  <td className="p-3 text-stone-600 font-sans">Admin Only (RBAC)</td>
                  <td className="p-3 text-stone-600 font-sans">Platform health, verified enterprise ratio, pending reports, audit telemetry.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
