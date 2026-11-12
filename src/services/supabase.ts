import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, BusinessReview, VerificationRequest, BwanaNotification, ChatMessage, ChatConversation } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project-ref') && 
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

// Fallback dummy client if credentials not provided
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

export async function fetchBusinessesFromSupabase(): Promise<Business[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.warn('Supabase fetch businesses notice:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline || '',
      description: row.description || '',
      categoryId: row.category_id || '',
      categoryName: row.category_name || '',
      secondaryCategories: row.secondary_categories || [],
      verificationStatus: row.verification_status || 'unverified',
      verificationTier: row.verification_tier,
      rating: Number(row.rating || 5.0),
      reviewsCount: Number(row.reviews_count || 0),
      phone: row.phone || '',
      whatsapp: row.whatsapp || '',
      email: row.email,
      website: row.website,
      address: row.address || '',
      country: row.country || 'Zambia',
      countryCode: row.country_code || 'ZM',
      province: row.province || 'Copperbelt',
      city: row.city || 'Kitwe',
      area: row.area || '',
      coordinates: {
        latitude: Number(row.latitude || -12.8024),
        longitude: Number(row.longitude || 28.2132),
      },
      coverImage: row.cover_image || '',
      galleryImages: row.gallery_images || [],
      isOpenNow: Boolean(row.is_open_now),
      hours: row.hours || [],
      claimedByUserId: row.claimed_by_user_id,
      products: row.products || [],
      services: row.services || [],
      promotions: row.promotions || [],
    }));
  } catch (err) {
    console.warn('Supabase fetch error:', err);
    return [];
  }
}

export async function insertBusinessIntoSupabase(business: Business): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: business.id,
      name: business.name,
      tagline: business.tagline,
      description: business.description,
      category_id: business.categoryId,
      category_name: business.categoryName,
      secondary_categories: business.secondaryCategories,
      verification_status: business.verificationStatus,
      verification_tier: business.verificationTier,
      rating: business.rating,
      reviews_count: business.reviewsCount,
      phone: business.phone,
      whatsapp: business.whatsapp,
      email: business.email,
      website: business.website,
      address: business.address,
      country: business.country,
      country_code: business.countryCode,
      province: business.province,
      city: business.city,
      area: business.area,
      latitude: business.coordinates.latitude,
      longitude: business.coordinates.longitude,
      cover_image: business.coverImage,
      gallery_images: business.galleryImages,
      is_open_now: business.isOpenNow,
      hours: business.hours,
      claimed_by_user_id: business.claimedByUserId,
      products: business.products,
      services: business.services,
      promotions: business.promotions,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('businesses').upsert(payload);
    if (error) {
      console.warn('Supabase upsert business notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert business error:', err);
    return false;
  }
}

export async function insertReviewIntoSupabase(review: BusinessReview): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: review.id,
      business_id: review.businessId,
      user_id: review.userId,
      user_name: review.userName,
      user_avatar: review.userAvatar,
      rating: review.rating,
      comment: review.comment,
      tags: review.tags,
      photos: review.photos,
      helpful_count: review.helpfulCount || 0,
      verified_visit: review.verifiedVisit,
      is_nrc_verified: review.isNrcVerified,
      nrc_number_masked: review.nrcNumberMasked,
      response: review.response,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('reviews').upsert(payload);
    if (error) {
      console.warn('Supabase upsert review notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert review error:', err);
    return false;
  }
}

export async function insertNotificationIntoSupabase(notif: BwanaNotification): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: notif.id,
      recipient_type: notif.recipientType,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      icon_type: notif.iconType,
      link_action: notif.linkAction,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('notifications').upsert(payload);
    if (error) {
      console.warn('Supabase insert notification notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert notification error:', err);
    return false;
  }
}

// PostGIS Geodesic Spatial Proximity Query via RPC
export async function queryNearbyBusinessesPostGis(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.rpc('get_nearby_businesses', {
      user_lat: userLat,
      user_lng: userLng,
      radius_meters: radiusMeters,
      limit_count: 20,
    });
    if (error) {
      console.warn('PostGIS get_nearby_businesses notice:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('PostGIS query error:', err);
    return [];
  }
}

