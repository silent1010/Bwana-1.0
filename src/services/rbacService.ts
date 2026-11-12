import { UserRole, UserCapabilities, StaffPermissionTier, StaffPermissionConfig, UserAccount } from '../types';

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

    superAdminRootAccess: false,
    manageDatabaseSeeder: false,
    manageRelationalWorkbench: false,
    overrideAnyVerification: false,
    manageAdminRoles: false,
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

    superAdminRootAccess: false,
    manageDatabaseSeeder: false,
    manageRelationalWorkbench: false,
    overrideAnyVerification: false,
    manageAdminRoles: false,
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

    superAdminRootAccess: false,
    manageDatabaseSeeder: false,
    manageRelationalWorkbench: false,
    overrideAnyVerification: false,
    manageAdminRoles: false,
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

    superAdminRootAccess: false,
    manageDatabaseSeeder: false,
    manageRelationalWorkbench: false,
    overrideAnyVerification: false,
    manageAdminRoles: false,
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

    superAdminRootAccess: false,
    manageDatabaseSeeder: false,
    manageRelationalWorkbench: false,
    overrideAnyVerification: false,
    manageAdminRoles: false,
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

    superAdminRootAccess: false,
    manageDatabaseSeeder: true,
    manageRelationalWorkbench: true,
    overrideAnyVerification: true,
    manageAdminRoles: false,
  },

  // SUPER ADMINISTRATOR: Exclusive to m.mumba8@gmail.com with ALL privileges granted
  super_admin: {
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

    // Super Admin Root Authority
    superAdminRootAccess: true,
    manageDatabaseSeeder: true,
    manageRelationalWorkbench: true,
    overrideAnyVerification: true,
    manageAdminRoles: true,
  },
};

// Designated exclusive Super Administrator email
export const SUPER_ADMIN_EMAIL = 'm.mumba8@gmail.com';

/**
 * Checks if an email is the designated exclusive Super Administrator.
 * ONLY m.mumba8@gmail.com is authorized.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Checks if a user has Super Administrator privileges.
 * Strict enforcement: ONLY m.mumba8@gmail.com has super admin privileges.
 */
export function hasSuperAdminPrivileges(userOrEmail?: string | { email?: string; role?: string } | null): boolean {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === 'string') {
    return isSuperAdminEmail(userOrEmail);
  }
  return isSuperAdminEmail(userOrEmail.email);
}

// Aliases for compatibility
ROLE_CAPABILITIES.user = ROLE_CAPABILITIES.registered_user;
ROLE_CAPABILITIES.customer = ROLE_CAPABILITIES.registered_user;
ROLE_CAPABILITIES.business = ROLE_CAPABILITIES.business_owner;
ROLE_CAPABILITIES.bwana_staff = ROLE_CAPABILITIES.moderator;

/**
 * Retrieves capabilities for a given role, enforcing that super_admin privileges
 * are strictly granted ONLY to m.mumba8@gmail.com.
 */
export function getCapabilitiesForRole(role: UserRole, userEmail?: string | null): UserCapabilities {
  // If the user email is m.mumba8@gmail.com, grant ALL privileges without restriction
  if (isSuperAdminEmail(userEmail)) {
    return ROLE_CAPABILITIES.super_admin;
  }

  // If role is super_admin but email is NOT m.mumba8@gmail.com, prevent privilege escalation
  if (role === 'super_admin' && !isSuperAdminEmail(userEmail)) {
    return ROLE_CAPABILITIES.admin;
  }

  return ROLE_CAPABILITIES[role] || ROLE_CAPABILITIES.public_user;
}

export interface UserAccessPermissions {
  canBrowse: boolean;
  canGiveReview: boolean;
  canRateBusiness: boolean;
  orderAccess: boolean;
  deliveryAccess: boolean;
  requiresNrcVerification: boolean;
}

/**
 * Evaluates specific granular permissions for logged in users:
 * - Unverified users: can give reviews, but cannot rate businesses (1-5 stars) and cannot access orders or deliveries.
 * - Verified users: full rating impact, order checkout, and courier delivery access.
 */
export function getUserAccessPermissions(user: UserAccount | null | undefined): UserAccessPermissions {
  const isAuth = Boolean(user);
  const isVerified = Boolean(user?.isNrcVerified);

  return {
    canBrowse: true,
    canGiveReview: isAuth,
    canRateBusiness: isAuth && isVerified,
    orderAccess: isAuth && isVerified,
    deliveryAccess: isAuth && isVerified,
    requiresNrcVerification: isAuth && !isVerified,
  };
}

