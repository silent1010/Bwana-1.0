/**
 * Bwana Platform - Master TypeScript Type Definitions
 * Version 1.0 (Zambia & Southern Africa)
 */

export type UserRole = 'admin' | 'business' | 'user' | 'customer' | 'business_owner';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'business' | 'user';
  roleLabel: string;
  description: string;
  avatarColor: string;
  badge: string;
  businessId?: string;
  businessName?: string;
}

export type VerificationStatus = 'unverified' | 'claimed' | 'verified';

export type PriceType = 'fixed' | 'starting_from' | 'price_range' | 'contact_for_price' | 'negotiable';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationArea {
  id: string;
  name: string;
  district: string;
  province: string;
  country: string;
  coordinates: LocationCoordinates;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  count: number;
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  priceType: PriceType;
  priceMax?: number;
  currency: string; // 'ZMW'
  imageUrl?: string;
  inStock: boolean;
  category?: string;
}

export interface BusinessService {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  priceType: PriceType;
  priceMax?: number;
  currency: string; // 'ZMW'
  duration?: string;
  category?: string;
}

export interface BusinessPromotion {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  tagline: string;
  discountPercentage?: number;
  validFrom: string;
  validUntil: string;
  terms: string;
  isFeatured?: boolean;
  bannerColor?: string;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  helpfulCount: number;
  verifiedVisit?: boolean;
  tags?: string[];
  response?: {
    comment: string;
    respondedAt: string;
    responderName: string;
  };
}

export interface BusinessOpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface Business {
  id: string;
  name: string;
  tagline: string;
  description: string;
  categoryId: string;
  categoryName: string;
  secondaryCategories?: string[];
  verificationStatus: VerificationStatus;
  rating: number;
  reviewsCount: number;
  phone: string;
  whatsapp: string;
  email?: string;
  website?: string;
  address: string;
  area: string;
  city: string;
  province: string;
  coordinates: LocationCoordinates;
  distanceKm?: number;
  coverImage: string;
  galleryImages: string[];
  isOpenNow: boolean;
  hours: BusinessOpeningHours[];
  claimedByUserId?: string;
  isFeatured?: boolean;
  products?: BusinessProduct[];
  services?: BusinessService[];
  promotions?: BusinessPromotion[];
  createdYear?: number;
}

export interface Professional {
  id: string;
  userId?: string;
  name: string;
  title: string;
  avatar: string;
  city: string;
  province: string;
  coordinates: LocationCoordinates;
  skills: string[];
  rating: number;
  reviewsCount: number;
  availableFor: string[];
  hourlyRate?: number;
  priceModel: PriceType;
  currency: string;
  bio: string;
  isVerified: boolean;
  phone: string;
  whatsapp: string;
  portfolio: { title: string; client: string; year: string; description: string }[];
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  category: string;
  date: string;
  time: string;
  locationName: string;
  city: string;
  coordinates: LocationCoordinates;
  description: string;
  ticketPrice: number;
  ticketCurrency: string;
  isFree?: boolean;
  coverImage: string;
  contactPhone: string;
  attendeesCount: number;
}

export interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  type: 'job' | 'tender' | 'internship' | 'scholarship' | 'business_grant';
  location: string;
  deadline: string;
  description: string;
  requirements: string[];
  remunerationOrBudget?: string;
  applyUrlOrContact: string;
  isVerifiedOrg: boolean;
}

export interface VerificationRequest {
  id: string;
  businessId: string;
  businessName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  pacraRegistrationNo: string;
  tpinNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  documents: { type: string; name: string; status: 'uploaded' | 'verified' }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  ipAddress: string;
}

export interface BwanaNotification {
  id: string;
  recipientType: 'customer' | 'business' | 'professional' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkAction?: string;
  iconType: 'promotion' | 'review' | 'verification' | 'inquiry' | 'system';
}

export interface SearchQueryParams {
  query: string;
  category?: string;
  locationAreaId?: string;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  openNowOnly?: boolean;
  sortBy?: 'distance' | 'rating' | 'popular';
}
