import { UserRole, UserCapabilities, StaffPermissionTier, StaffPermissionConfig } from '../types';

/**
 * Granular Role-Based Access Control (RBAC) definitions
 * for the 6 Major Platform User Types:
 * A. Public User
 * B. Registered User
 * C. Business Owner
 * D. Business Staff
 * E. Moderator
 * F. Administrator
 */

export const STAFF_TIER_PERMISSIONS: Record<StaffPermissionTier, StaffPermissionConfig> = {
  owner: {
    canEditProfile: true,
    canManageContent: true,
    canPublishPromotions: true,
    canRespondToReviews: true,
    canViewAnalytics: true,
    canManageStaff: true,
  },
  manager: {
    canEditProfile: true,
    canManageContent: true,
    canPublishPromotions: true,
    canRespondToReviews: true,
    canViewAnalytics: true,
    canManageStaff: false,
  },
  staff: {
    canEditProfile: false,
    canManageContent: true,
    canPublishPromotions: false,
    canRespondToReviews: false,
    canViewAnalytics: false,
    canManageStaff: false,
  },
};

export const ROLE_CAPABILITIES: Record<string, UserCapabilities> = {
  public_user: {
    searchBusinesses: true,
    browseCategories: true,
    viewBusinessProfiles: true,
    viewLocationsAndHours: true,
    viewRatingsAndReviews: true,
    viewPhotosAndContact: true,
    useMapDiscovery: true,
    useListDiscovery: true,

    createAccountAndLogin: true, // Can initiate
    saveAndFavorite: false,
    writeReviewsAndRatings: false,
    uploadReviewPhotos: false,
    reportIncorrectInformation: false,
    shareListings: true,
    managePersonalProfile: false,
    viewSearchHistory: false,
    receiveNotifications: false,

    registerBusiness: false,
    claimListing: false,
    manageBusinessProfile: false,
    manageProductsAndServices: false,
    publishPromotions: false,
    respondToReviews: false,
    viewBusinessAnalytics: false,
    manageEmployees: false,

    reviewReportedContent: false,
    suspendInappropriateListings: false,
    handleDisputes: false,
    reviewVerificationRequests: false,

    fullPlatformAdministration: false,
    manageUsersAndTenants: false,
    manageCategoriesAndLocations: false,
    managePlatformConfig: false,
    auditSystemActivity: false,
  },

  registered_user: {
    searchBusinesses: true,
    browseCategories: true,
    viewBusinessProfiles: true,
    viewLocationsAndHours: true,
    viewRatingsAndReviews: true,
    viewPhotosAndContact: true,
    useMapDiscovery: true,
    useListDiscovery: true,

    createAccountAndLogin: true,
    saveAndFavorite: true,
    writeReviewsAndRatings: true,
    uploadReviewPhotos: true,
    reportIncorrectInformation: true,
    shareListings: true,
    managePersonalProfile: true,
    viewSearchHistory: true,
    receiveNotifications: true,

    registerBusiness: true, // Can register their own business
    claimListing: true,
    manageBusinessProfile: false,
    manageProductsAndServices: false,
    publishPromotions: false,
    respondToReviews: false,
    viewBusinessAnalytics: false,
    manageEmployees: false,

    reviewReportedContent: false,
    suspendInappropriateListings: false,
    handleDisputes: false,
    reviewVerificationRequests: false,

    fullPlatformAdministration: false,
    manageUsersAndTenants: false,
    manageCategoriesAndLocations: false,
    managePlatformConfig: false,
    auditSystemActivity: false,
  },

  business_owner: {
    searchBusinesses: true,
    browseCategories: true,
    viewBusinessProfiles: true,
    viewLocationsAndHours: true,
    viewRatingsAndReviews: true,
    viewPhotosAndContact: true,
    useMapDiscovery: true,
    useListDiscovery: true,

    createAccountAndLogin: true,
    saveAndFavorite: true,
    writeReviewsAndRatings: true,
    uploadReviewPhotos: true,
    reportIncorrectInformation: true,
    shareListings: true,
    managePersonalProfile: true,
    viewSearchHistory: true,
    receiveNotifications: true,

    registerBusiness: true,
    claimListing: true,
    manageBusinessProfile: true,
    manageProductsAndServices: true,
    publishPromotions: true,
    respondToReviews: true,
    viewBusinessAnalytics: true,
    manageEmployees: true, // FULL BUSINESS CONTROL

    reviewReportedContent: false,
    suspendInappropriateListings: false,
    handleDisputes: false,
    reviewVerificationRequests: false,

    fullPlatformAdministration: false,
    manageUsersAndTenants: false,
    manageCategoriesAndLocations: false,
    managePlatformConfig: false,
    auditSystemActivity: false,
  },

  business_staff: {
    searchBusinesses: true,
    browseCategories: true,
    viewBusinessProfiles: true,
    viewLocationsAndHours: true,
    viewRatingsAndReviews: true,
    viewPhotosAndContact: true,
    useMapDiscovery: true,
    useListDiscovery: true,

    createAccountAndLogin: true,
    saveAndFavorite: true,
    writeReviewsAndRatings: true,
    uploadReviewPhotos: true,
    reportIncorrectInformation: true,
    shareListings: true,
    managePersonalProfile: true,
    viewSearchHistory: true,
    receiveNotifications: true,

    registerBusiness: false,
    claimListing: false,
    manageBusinessProfile: false, // Determined by staff tier
    manageProductsAndServices: true, // Content management only
    publishPromotions: false,
    respondToReviews: false,
    viewBusinessAnalytics: false,
    manageEmployees: false,

    reviewReportedContent: false,
    suspendInappropriateListings: false,
    handleDisputes: false,
    reviewVerificationRequests: false,

    fullPlatformAdministration: false,
    manageUsersAndTenants: false,
    manageCategoriesAndLocations: false,
    managePlatformConfig: false,
    auditSystemActivity: false,
  },

  moderator: {
    searchBusinesses: true,
    browseCategories: true,
    viewBusinessProfiles: true,
    viewLocationsAndHours: true,
    viewRatingsAndReviews: true,
    viewPhotosAndContact: true,
    useMapDiscovery: true,
    useListDiscovery: true,

    createAccountAndLogin: true,
    saveAndFavorite: true,
    writeReviewsAndRatings: true,
    uploadReviewPhotos: true,
    reportIncorrectInformation: true,
    shareListings: true,
    managePersonalProfile: true,
    viewSearchHistory: true,
    receiveNotifications: true,

    registerBusiness: false,
    claimListing: false,
    manageBusinessProfile: false,
    manageProductsAndServices: false,
    publishPromotions: false,
    respondToReviews: false,
    viewBusinessAnalytics: true,
    manageEmployees: false,

    reviewReportedContent: true,
    suspendInappropriateListings: true,
    handleDisputes: true,
    reviewVerificationRequests: true,

    fullPlatformAdministration: false,
    manageUsersAndTenants: false,
    manageCategoriesAndLocations: true, // Moderate categories
    managePlatformConfig: false,
    auditSystemActivity: true,
  },

  admin: {
    searchBusinesses: true,
    browseCategories: true,
    viewBusinessProfiles: true,
    viewLocationsAndHours: true,
    viewRatingsAndReviews: true,
    viewPhotosAndContact: true,
    useMapDiscovery: true,
    useListDiscovery: true,

    createAccountAndLogin: true,
    saveAndFavorite: true,
    writeReviewsAndRatings: true,
    uploadReviewPhotos: true,
    reportIncorrectInformation: true,
    shareListings: true,
    managePersonalProfile: true,
    viewSearchHistory: true,
    receiveNotifications: true,

    registerBusiness: true,
    claimListing: true,
    manageBusinessProfile: true,
    manageProductsAndServices: true,
    publishPromotions: true,
    respondToReviews: true,
    viewBusinessAnalytics: true,
    manageEmployees: true,

    reviewReportedContent: true,
    suspendInappropriateListings: true,
    handleDisputes: true,
    reviewVerificationRequests: true,

    fullPlatformAdministration: true,
    manageUsersAndTenants: true,
    manageCategoriesAndLocations: true,
    managePlatformConfig: true,
    auditSystemActivity: true,
  },
};

// Aliases for compatibility
ROLE_CAPABILITIES.user = ROLE_CAPABILITIES.registered_user;
ROLE_CAPABILITIES.customer = ROLE_CAPABILITIES.registered_user;
ROLE_CAPABILITIES.business = ROLE_CAPABILITIES.business_owner;
ROLE_CAPABILITIES.bwana_staff = ROLE_CAPABILITIES.moderator;

export function getCapabilitiesForRole(role: UserRole): UserCapabilities {
  return ROLE_CAPABILITIES[role] || ROLE_CAPABILITIES.public_user;
}
