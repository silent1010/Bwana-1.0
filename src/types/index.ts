/**
 * Bwana Platform - Master TypeScript Type Definitions
 * Version 1.0 (Zambia & Southern Africa)
 */

/**
 * Platform User Roles:
 * A. Public User (unauthenticated visitor)
 * B. Registered User (customer / registered citizen)
 * C. Business Owner (merchant owner with full business control)
 * D. Business Staff (manager / staff member with configurable permissions)
 * E. Moderator (content dispute & verification compliance officer)
 * F. Administrator (super admin with full platform, system audit & tenant control)
 */
export type UserRole =
  | 'public_user'
  | 'registered_user'
  | 'user'
  | 'customer'
  | 'business_owner'
  | 'business'
  | 'business_staff'
  | 'moderator'
  | 'admin'
  | 'bwana_staff';

export type StaffPermissionTier = 'owner' | 'manager' | 'staff';

export interface StaffPermissionConfig {
  canEditProfile: boolean;
  canManageContent: boolean; // products, services, photos
  canPublishPromotions: boolean;
  canRespondToReviews: boolean;
  canViewAnalytics: boolean;
  canManageStaff: boolean;
}

export interface UserCapabilities {
  // Public capabilities (Available to all, no registration required)
  searchBusinesses: boolean;
  browseCategories: boolean;
  viewBusinessProfiles: boolean;
  viewLocationsAndHours: boolean;
  viewRatingsAndReviews: boolean;
  viewPhotosAndContact: boolean;
  useMapDiscovery: boolean;
  useListDiscovery: boolean;

  // Registered user capabilities
  createAccountAndLogin: boolean;
  saveAndFavorite: boolean;
  writeReviewsAndRatings: boolean;
  uploadReviewPhotos: boolean;
  reportIncorrectInformation: boolean;
  shareListings: boolean;
  managePersonalProfile: boolean;
  viewSearchHistory: boolean;
  receiveNotifications: boolean;

  // Business capabilities
  registerBusiness: boolean;
  claimListing: boolean;
  manageBusinessProfile: boolean;
  manageProductsAndServices: boolean;
  publishPromotions: boolean;
  respondToReviews: boolean;
  viewBusinessAnalytics: boolean;
  manageEmployees: boolean;

  // Moderator capabilities
  reviewReportedContent: boolean;
  suspendInappropriateListings: boolean;
  handleDisputes: boolean;
  reviewVerificationRequests: boolean;

  // Administrator capabilities
  fullPlatformAdministration: boolean;
  manageUsersAndTenants: boolean;
  manageCategoriesAndLocations: boolean;
  managePlatformConfig: boolean;
  auditSystemActivity: boolean;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  description: string;
  avatarColor: string;
  badge: string;
  staffTier?: StaffPermissionTier;
  permissions?: StaffPermissionConfig;
  businessId?: string;
  businessName?: string;
}

export type VerificationStatus = 'unverified' | 'claimed' | 'verified';

export type PriceType = 'fixed' | 'starting_from' | 'price_range' | 'contact_for_price' | 'negotiable';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Hierarchical Geographic Data Model
 * Country → Province/Region → District → City/Town → Area/Neighborhood → Coordinates
 * Enables multi-market expansion across Africa (Zambia, Zimbabwe, Botswana, Malawi, Namibia, Mozambique, South Africa, Tanzania, etc.)
 */
export interface Country {
  code: string; // ISO 3166-1 alpha-2 (e.g. 'ZM', 'ZW', 'BW')
  name: string; // e.g. 'Zambia'
  currency: string; // e.g. 'ZMW'
  currencySymbol: string;
  phonePrefix: string; // e.g. '+260'
  flagEmoji: string;
  isActive: boolean;
}

export interface ProvinceRegion {
  id: string;
  countryCode: string;
  name: string; // e.g. 'Copperbelt', 'Lusaka', 'Southern'
}

export interface District {
  id: string;
  provinceId: string;
  countryCode: string;
  name: string; // e.g. 'Kitwe', 'Ndola', 'Lusaka'
}

export interface CityTown {
  id: string;
  districtId: string;
  provinceId: string;
  countryCode: string;
  name: string; // e.g. 'Kitwe', 'Lusaka', 'Ndola', 'Livingstone'
  isMajorCity?: boolean;
  coordinates: LocationCoordinates;
}

export interface AreaNeighborhood {
  id: string;
  cityId: string;
  districtId: string;
  provinceId: string;
  countryCode: string;
  name: string; // e.g. 'Parklands', 'Riverside', 'Kabulonga', 'Town Centre'
  coordinates: LocationCoordinates;
}

export interface LocationArea {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  province: string;
  provinceId?: string;
  district: string;
  districtId?: string;
  city: string;
  cityId?: string;
  area?: string;
  areaId?: string;
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
  photoUrl?: string;
  photos?: string[];
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

export interface BusinessSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
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
  countryCode?: string; // 'ZM', 'ZW', 'BW', etc.
  country?: string; // 'Zambia'
  province: string;
  district?: string;
  city: string;
  area: string;
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
  tags?: string[];
  attributes?: string[];
  socialLinks?: BusinessSocialLinks;
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
