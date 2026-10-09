import { describe, it, expect } from 'vitest';
import { getCapabilitiesForRole, STAFF_TIER_PERMISSIONS } from '../services/rbacService';
import { UserRole } from '../types';

describe('Platform User Types & RBAC Specification', () => {
  it('A. Public User has complete basic discovery with NO registration required', () => {
    const caps = getCapabilitiesForRole('public_user');
    expect(caps.searchBusinesses).toBe(true);
    expect(caps.browseCategories).toBe(true);
    expect(caps.viewBusinessProfiles).toBe(true);
    expect(caps.viewLocationsAndHours).toBe(true);
    expect(caps.viewRatingsAndReviews).toBe(true);
    expect(caps.viewPhotosAndContact).toBe(true);
    expect(caps.useMapDiscovery).toBe(true);
    expect(caps.useListDiscovery).toBe(true);

    // Cannot perform authenticated actions
    expect(caps.saveAndFavorite).toBe(false);
    expect(caps.writeReviewsAndRatings).toBe(false);
    expect(caps.manageBusinessProfile).toBe(false);
    expect(caps.fullPlatformAdministration).toBe(false);
  });

  it('B. Registered User has full engagement capabilities', () => {
    const caps = getCapabilitiesForRole('registered_user');
    expect(caps.searchBusinesses).toBe(true);
    expect(caps.saveAndFavorite).toBe(true);
    expect(caps.writeReviewsAndRatings).toBe(true);
    expect(caps.uploadReviewPhotos).toBe(true);
    expect(caps.reportIncorrectInformation).toBe(true);
    expect(caps.shareListings).toBe(true);
    expect(caps.managePersonalProfile).toBe(true);
    expect(caps.viewSearchHistory).toBe(true);
    expect(caps.receiveNotifications).toBe(true);
    expect(caps.registerBusiness).toBe(true);

    // Not a platform admin
    expect(caps.fullPlatformAdministration).toBe(false);
    expect(caps.reviewReportedContent).toBe(false);
  });

  it('C. Business Owner has full business control', () => {
    const caps = getCapabilitiesForRole('business_owner');
    expect(caps.registerBusiness).toBe(true);
    expect(caps.claimListing).toBe(true);
    expect(caps.manageBusinessProfile).toBe(true);
    expect(caps.manageProductsAndServices).toBe(true);
    expect(caps.publishPromotions).toBe(true);
    expect(caps.respondToReviews).toBe(true);
    expect(caps.viewBusinessAnalytics).toBe(true);
    expect(caps.manageEmployees).toBe(true); // Full business control
  });

  it('D. Business Staff has configurable tiers (Owner, Manager, Staff)', () => {
    const ownerPerms = STAFF_TIER_PERMISSIONS.owner;
    expect(ownerPerms.canEditProfile).toBe(true);
    expect(ownerPerms.canManageContent).toBe(true);
    expect(ownerPerms.canPublishPromotions).toBe(true);
    expect(ownerPerms.canRespondToReviews).toBe(true);
    expect(ownerPerms.canViewAnalytics).toBe(true);
    expect(ownerPerms.canManageStaff).toBe(true);

    const managerPerms = STAFF_TIER_PERMISSIONS.manager;
    expect(managerPerms.canEditProfile).toBe(true);
    expect(managerPerms.canManageContent).toBe(true);
    expect(managerPerms.canPublishPromotions).toBe(true);
    expect(managerPerms.canRespondToReviews).toBe(true);
    expect(managerPerms.canViewAnalytics).toBe(true);
    expect(managerPerms.canManageStaff).toBe(false); // No staff management

    const staffPerms = STAFF_TIER_PERMISSIONS.staff;
    expect(staffPerms.canEditProfile).toBe(false);
    expect(staffPerms.canManageContent).toBe(true); // Content management only
    expect(staffPerms.canPublishPromotions).toBe(false);
    expect(staffPerms.canRespondToReviews).toBe(false);
    expect(staffPerms.canViewAnalytics).toBe(false);
    expect(staffPerms.canManageStaff).toBe(false);
  });

  it('E. Moderator has content moderation and dispute capabilities', () => {
    const caps = getCapabilitiesForRole('moderator');
    expect(caps.reviewReportedContent).toBe(true);
    expect(caps.suspendInappropriateListings).toBe(true);
    expect(caps.handleDisputes).toBe(true);
    expect(caps.reviewVerificationRequests).toBe(true);
    expect(caps.manageCategoriesAndLocations).toBe(true);
    expect(caps.auditSystemActivity).toBe(true);
    expect(caps.fullPlatformAdministration).toBe(false);
  });

  it('F. Administrator has complete platform authority', () => {
    const caps = getCapabilitiesForRole('admin');
    expect(caps.fullPlatformAdministration).toBe(true);
    expect(caps.manageUsersAndTenants).toBe(true);
    expect(caps.manageCategoriesAndLocations).toBe(true);
    expect(caps.managePlatformConfig).toBe(true);
    expect(caps.auditSystemActivity).toBe(true);
    expect(caps.reviewReportedContent).toBe(true);
  });
});
