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
  | 'super_admin'
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

  // Super Administrator exclusive capabilities (Reserved for m.mumba8@gmail.com)
  superAdminRootAccess: boolean;
  manageDatabaseSeeder: boolean;
  manageRelationalWorkbench: boolean;
  overrideAnyVerification: boolean;
  manageAdminRoles: boolean;
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
  isSuperAdmin?: boolean;
  staffTier?: StaffPermissionTier;
  permissions?: StaffPermissionConfig;
  businessId?: string;
  businessName?: string;
}

export type AuthProviderType = 'google' | 'facebook' | 'phone' | 'email';

export interface UserNrcVerification {
  nrcNumber: string; // e.g. "294812/67/1"
  fullName: string;
  dateOfBirth?: string;
  nrcFrontUrl?: string;
  nrcBackUrl?: string;
  selfieUrl?: string;
  facialMatchScore?: number; // e.g. 98.4
  livenessVerified: boolean;
  verifiedAt?: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  authProvider: AuthProviderType;
  avatar?: string;
  role: UserRole;
  isNrcVerified: boolean;
  nrcVerification?: UserNrcVerification;
  accountNumber?: string; // Standard Zambian Commercial Format: BWN-xxxxxxxx
  preferredOtpChannel?: 'whatsapp' | 'sms' | 'email';
  createdAt: string;
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

export interface ProductVariant {
  id: string;
  name: string; // e.g. "500g Pack", "1kg Bag", "Size L - Emerald"
  sku?: string;
  priceAdjustment: number; // e.g. +20 or 0
  stock: number;
  attributes?: Record<string, string>; // e.g. { size: '1kg', color: 'Green' }
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  priceType: PriceType;
  priceMax?: number;
  currency: string; // 'ZMW'
  imageUrl?: string;
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  category?: string;
  variants?: ProductVariant[];
  sku?: string;
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
  isNrcVerified?: boolean;
  nrcNumberMasked?: string;
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
  isOpen?: boolean;
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
  logoUrl?: string;
  photos?: string[];
  isOpenNow: boolean;
  hours: BusinessOpeningHours[];
  claimedByUserId?: string;
  isFeatured?: boolean;
  verificationTier?: 'bwana_verified' | 'community_verified' | 'unverified';
  isKantemba?: boolean;
  isWholesaler?: boolean;
  minOrderAmount?: number;
  scoutOnboardedBy?: string;
  bountyPaid?: boolean;
  products?: BusinessProduct[];
  services?: BusinessService[];
  promotions?: BusinessPromotion[];
  createdYear?: number;
  tags?: string[];
  attributes?: string[];
  socialLinks?: BusinessSocialLinks;
  googleMapsRegistered?: boolean;
  placeType?: 'mall' | 'hospital' | 'clinic' | 'commercial' | 'general';
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
  field?: string; // Primary field/industry: 'Software & IT', 'Electrical Engineering', 'Building & Construction', 'Accounting & Finance', 'Health & Nursing', 'Plumbing & Mechanics', etc.
  qualificationDocName?: string;
  qualificationDocType?: string; // 'TEVETA Craft Certificate', 'EIZ Practicing License', 'ZICA Chartered Accountant', 'Degree / Diploma', 'National Registration Card (NRC)'
  qualificationDocVerified?: boolean;
  yearsExperience?: number;
  registrationNumber?: string;
  createdAt?: string;
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
  isZppaTender?: boolean;
  tenderNumber?: string; // e.g. 'ZPPA/MOH/ONB/024/2026'
  procuringEntity?: string;
  zppaPortalUrl?: string; // e.g. 'https://eprocure.zppa.org.zm'
  procurementCategory?: string; // 'Goods' | 'Works' | 'Consulting Services' | 'Non-Consulting Services'
  procurementMethod?: string; // 'Open National Bidding (ONB)' | 'Open International Bidding (OIB)' | 'Simplified Bidding'
  closingTime?: string;
  createdAt?: string;
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
  highestRatedOnly?: boolean;
  offersDeliveryOnly?: boolean;
  serviceCategory?: string;
  sortBy?: 'distance' | 'rating' | 'popular' | 'reviews';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'business';
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  businessPhone?: string;
  businessCity?: string;
  businessArea?: string;
  businessIsOpenNow?: boolean;
  userId: string;
  userName: string;
  userPhone?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCountForUser: number;
  unreadCountForBusiness: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourierDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'van';
  vehiclePlate: string;
  rating: number;
  currentLocation: LocationCoordinates;
  status: 'available' | 'busy' | 'offline';
  completedTrips: number;
}

export interface RideRequest {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: number;
  baseFare: number; // K20
  perKmRate: number; // K4/km
  totalFare: number;
  status: 'requested' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  driverName?: string;
  createdAt: string;
}

export interface BwanaWalletTransaction {
  id: string;
  userId: string;
  type: 'order_payment' | 'keep_change' | 'topup' | 'seller_payout' | 'scout_bounty' | 'cashout';
  amount: number;
  fee: number;
  netAmount: number;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  description: string;
  createdAt: string;
}

export interface ScoutOnboardingRecord {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  compound: string;
  city: string;
  category: string;
  scoutName: string;
  bountyZMW: number;
  status: 'verified' | 'pending_review';
  audioNoteBemba?: string;
  createdAt: string;
}

export interface BusinessFollow {
  id: string;
  userId: string;
  businessId: string;
  followedAt: string;
}

export interface BusinessPost {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  businessCity?: string;
  title: string;
  content: string;
  type: 'announcement' | 'promotion' | 'new_product' | 'flash_sale';
  imageUrl?: string;
  discountCode?: string;
  discountPercentage?: number;
  productId?: string;
  productPrice?: number;
  createdAt: string;
  likesCount?: number;
}

export interface CartItem {
  product: BusinessProduct;
  selectedVariant?: ProductVariant;
  businessId: string;
  businessName: string;
  quantity: number;
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'bwana_wallet' | 'cash_on_delivery';

export interface Order {
  id: string;
  businessId: string;
  businessName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformSplitFee: number; // 1% Bwana platform split
  merchantPayout: number;   // 99% payout to merchant
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'received' | 'accepted' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber: string;
  courierName?: string;
  courierPhone?: string;
  createdAt: string;
}

