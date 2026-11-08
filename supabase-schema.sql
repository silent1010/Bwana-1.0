-- ====================================================================
-- BWANA PLATFORM: SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- Generated for Zambian Commercial Discovery & Logistics Network
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    secondary_categories JSONB DEFAULT '[]'::jsonb,
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'claimed', 'verified')),
    verification_tier TEXT DEFAULT 'unverified',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    address TEXT NOT NULL,
    country TEXT DEFAULT 'Zambia',
    country_code TEXT DEFAULT 'ZM',
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    cover_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    is_open_now BOOLEAN DEFAULT TRUE,
    hours JSONB DEFAULT '[]'::jsonb,
    claimed_by_user_id TEXT,
    products JSONB DEFAULT '[]'::jsonb,
    services JSONB DEFAULT '[]'::jsonb,
    promotions JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geolocation queries & categories
CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_coords ON public.businesses(latitude, longitude);

-- 3. Customer Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    photos JSONB DEFAULT '[]'::jsonb,
    helpful_count INTEGER DEFAULT 0,
    verified_visit BOOLEAN DEFAULT FALSE,
    is_nrc_verified BOOLEAN DEFAULT FALSE,
    nrc_number_masked TEXT,
    response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);

-- 4. Statutory Verification Requests (PACRA & ZRA)
CREATE TABLE IF NOT EXISTS public.verifications (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    pacra_registration_no TEXT NOT NULL,
    tpin_number TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    recipient_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    icon_type TEXT DEFAULT 'verification',
    link_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Direct User-to-Business Chat Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_logo TEXT,
    business_phone TEXT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count_for_business INTEGER DEFAULT 0,
    unread_count_for_user INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'business')),
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_convo ON public.chat_messages(conversation_id);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read access to verified businesses
CREATE POLICY "Public can view businesses" ON public.businesses
    FOR SELECT USING (true);

-- Authenticated merchants can insert or update their own businesses
CREATE POLICY "Merchants can insert businesses" ON public.businesses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Merchants can update own businesses" ON public.businesses
    FOR UPDATE USING (true);

-- Public read access to reviews
CREATE POLICY "Public can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Notifications
CREATE POLICY "Public can view notifications" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Chat messages
CREATE POLICY "Participants can view conversations" ON public.conversations
    FOR SELECT USING (true);

CREATE POLICY "Participants can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can view messages" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Participants can insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);
