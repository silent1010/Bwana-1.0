/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Store } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeScreen } from './components/discovery/HomeScreen';
import { SearchResults } from './components/discovery/SearchResults';
import { BusinessProfileModal } from './components/business/BusinessProfileModal';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { ClaimBusinessModal } from './components/business/ClaimBusinessModal';
import { ProfessionalsList } from './components/professionals/ProfessionalsList';
import { EventsList } from './components/events/EventsList';
import { OpportunitiesList } from './components/opportunities/OpportunitiesList';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BusinessRegistrationPortal } from './components/business/BusinessRegistrationPortal';
import { EngineeringSpec } from './components/architecture/EngineeringSpec';
import { LocationPickerModal } from './components/common/LocationPickerModal';
import { SearchEngineModal } from './components/common/SearchEngineModal';
import { AuthModal } from './components/auth/AuthModal';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';

import {
  Business,
  Category,
  LocationArea,
  Professional,
  EventItem,
  OpportunityItem,
  UserRole,
  BwanaNotification,
  VerificationRequest,
  AuditLogEntry,
  BusinessReview,
  SystemUser,
} from './types';

import {
  LOCATIONS,
  INITIAL_BUSINESSES,
  INITIAL_PROFESSIONALS,
  INITIAL_EVENTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_VERIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REVIEWS,
  SYSTEM_USERS,
  calculateDistanceKm,
} from './data/mockData';

export default function App() {
  // Navigation & Role State (3 Isolated Security Roles: admin, business, user)
  const [currentTab, setCurrentTab] = useState<string>('discover');
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [currentLocation, setCurrentLocation] = useState<LocationArea>(LOCATIONS[0]); // Kitwe default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Core Data State
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [reviews, setReviews] = useState<BusinessReview[]>(INITIAL_REVIEWS);
  const [verifications, setVerifications] = useState<VerificationRequest[]>(INITIAL_VERIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [professionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  const [events] = useState<EventItem[]>(INITIAL_EVENTS);
  const [opportunities] = useState<OpportunityItem[]>(INITIAL_OPPORTUNITIES);
  const [notifications, setNotifications] = useState<BwanaNotification[]>(INITIAL_NOTIFICATIONS);
  const [savedBusinessIds, setSavedBusinessIds] = useState<string[]>(['biz-abc-hardware']);

  // Modals & Drawers State
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [claimModalBiz, setClaimModalBiz] = useState<Business | null>(null);

  // Authentication state (Preloaded as User Side: Michael Mumba)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('m.mumba8@gmail.com');
  const [currentUserName, setCurrentUserName] = useState<string>('Michael Mumba');

  // Security Role Switcher between the 3 users
  const handleSwitchUser = (u: SystemUser) => {
    setIsAuthenticated(true);
    setCurrentRole(u.role);
    setCurrentUserEmail(u.email);
    setCurrentUserName(u.name);
    if (u.role === 'admin') setCurrentTab('admin_dashboard');
    else if (u.role === 'business') setCurrentTab('business_dashboard');
    else setCurrentTab('discover');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentRole('user');
    setCurrentUserEmail('');
    setCurrentUserName('');
    if (currentTab === 'admin_dashboard' || currentTab === 'business_dashboard') {
      setCurrentTab('discover');
    }
  };

  // Interactive Action Handlers (Zero dead clicks per skill)
  const handleCall = (phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = (whatsappNumber: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNum}?text=Hello%20I%20found%20your%20business%20on%20Bwana%20Discovery`;
    window.open(url, '_blank');
  };

  const handleDirections = (biz: Business, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBusiness(biz);
  };

  const handleToggleSave = (bizId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (savedBusinessIds.includes(bizId)) {
      setSavedBusinessIds(savedBusinessIds.filter((id) => id !== bizId));
    } else {
      setSavedBusinessIds([...savedBusinessIds, bizId]);
    }
  };

  const handleSelectLocation = (newLoc: LocationArea) => {
    setCurrentLocation(newLoc);
    // Recalculate distance from new location
    const updated = businesses.map((b) => ({
      ...b,
      distanceKm: calculateDistanceKm(
        newLoc.coordinates.latitude,
        newLoc.coordinates.longitude,
        b.coordinates.latitude,
        b.coordinates.longitude
      ),
    }));
    setBusinesses(updated);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentTab('businesses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterBusiness = (newBusiness: Business, newVerification: VerificationRequest) => {
    // Add business (initial status unverified, pending statutory review)
    setBusinesses((prev) => [newBusiness, ...prev]);

    // Add verification request to administrative queue
    setVerifications((prev) => [newVerification, ...prev]);

    // Add immutable compliance audit log entry
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: newVerification.applicantEmail || 'applicant@bwana.africa',
      role: 'business_owner',
      action: 'BUSINESS_REGISTERED_PENDING_VERIFICATION',
      targetEntity: 'Business',
      targetId: newBusiness.id,
      details: `New registration for "${newBusiness.name}" submitted with PACRA #${newVerification.pacraRegistrationNo} and ZRA TPIN #${newVerification.tpinNumber}.`,
      ipAddress: '102.144.92.14 (Zambia IP)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Send notifications to both owner and platform admin
    const ownerNotif: BwanaNotification = {
      id: `notif-${Date.now()}-1`,
      recipientType: 'business',
      title: 'Registration Submitted for Verification',
      message: `Your registration for "${newBusiness.name}" was received and queued for statutory PACRA & ZRA verification.`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: newBusiness.id,
    };
    const adminNotif: BwanaNotification = {
      id: `notif-${Date.now()}-2`,
      recipientType: 'system',
      title: `Action Required: New Business Registration (${newBusiness.name})`,
      message: `${newVerification.applicantName} submitted PACRA #${newVerification.pacraRegistrationNo} in ${newBusiness.city}.`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: newBusiness.id,
    };
    setNotifications((prev) => [adminNotif, ownerNotif, ...prev]);
  };

  const handleApproveVerification = (requestId: string, businessId: string) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId ? { ...b, verificationStatus: 'verified' } : b
      )
    );

    setVerifications((prev) =>
      prev.map((v) =>
        v.id === requestId
          ? {
              ...v,
              status: 'approved',
              reviewedBy: 'Admin (Compliance Desk)',
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : v
      )
    );

    const approvedBiz = businesses.find((b) => b.id === businessId);

    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'admin@bwana.africa',
      role: 'admin',
      action: 'VERIFICATION_APPROVED',
      targetEntity: 'Business',
      targetId: businessId,
      details: `Approved statutory PACRA & TPIN verification for ${approvedBiz?.name || businessId}. Verified badge (✓) activated.`,
      ipAddress: '102.144.92.10 (Internal)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Notify user
    const newNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'business',
      title: 'Official Verification Approved ✓',
      message: `Congratulations! ${approvedBiz?.name || 'Your business'} has been granted the official Bwana Verified Badge (✓).`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: businessId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleRejectVerification = (requestId: string, reason: string) => {
    setVerifications((prev) =>
      prev.map((v) =>
        v.id === requestId
          ? {
              ...v,
              status: 'rejected',
              notes: `Rejected by Compliance Officer: ${reason}`,
              reviewedBy: 'Admin (Compliance Desk)',
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : v
      )
    );

    const req = verifications.find((v) => v.id === requestId);
    if (req) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === req.businessId ? { ...b, verificationStatus: 'unverified' } : b
        )
      );
    }

    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: 'admin@bwana.africa',
      role: 'admin',
      action: 'VERIFICATION_REJECTED',
      targetEntity: 'Business',
      targetId: req?.businessId || requestId,
      details: `Rejected verification application for ${req?.businessName || requestId}. Reason: ${reason}`,
      ipAddress: '102.144.92.10 (Internal)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    const newNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'business',
      title: 'Verification Requires Revision',
      message: `Bwana compliance officer note: ${reason}`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleClaimSubmit = (claimData: {
    businessId: string;
    businessName: string;
    applicantName: string;
    applicantPhone: string;
    applicantEmail: string;
    pacraNo: string;
    tpin: string;
  }) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === claimData.businessId ? { ...b, verificationStatus: 'claimed' } : b
      )
    );

    const claimVerificationReq: VerificationRequest = {
      id: `ver-claim-${Date.now()}`,
      businessId: claimData.businessId,
      businessName: claimData.businessName,
      applicantName: claimData.applicantName,
      applicantEmail: claimData.applicantEmail,
      applicantPhone: claimData.applicantPhone,
      pacraRegistrationNo: claimData.pacraNo,
      tpinNumber: claimData.tpin,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending',
      notes: `Business Claim submitted by ${claimData.applicantName} for review.`,
      documents: [
        { type: 'PACRA Claim Certificate', name: `PACRA_${claimData.pacraNo}.pdf`, status: 'uploaded' },
        { type: 'ZRA TPIN Document', name: `ZRA_${claimData.tpin}.pdf`, status: 'uploaded' }
      ]
    };
    setVerifications((prev) => [claimVerificationReq, ...prev]);

    const newNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'system',
      title: `New Verification Request: ${claimData.businessName}`,
      message: `${claimData.applicantName} submitted PACRA #${claimData.pacraNo} for review.`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: claimData.businessId,
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleUpdateBusiness = (updated: Business) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
  };

  const handleAddReview = (
    businessId: string,
    rating: number,
    comment: string,
    tags: string[],
    verifiedVisit: boolean
  ) => {
    const authorName = currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'Verified Customer');
    const newRev: BusinessReview = {
      id: `rev-${Date.now()}`,
      businessId,
      userId: currentUserEmail || `usr-${Date.now()}`,
      userName: authorName,
      rating,
      comment,
      tags,
      createdAt: 'Just now',
      helpfulCount: 0,
      verifiedVisit,
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);

    // Recompute business average rating & reviewsCount
    const bizReviews = updatedReviews.filter((r) => r.businessId === businessId);
    const newCount = bizReviews.length;
    const newAvg = Math.round((bizReviews.reduce((sum, r) => sum + r.rating, 0) / newCount) * 10) / 10;

    // Update in master businesses state
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId
          ? {
              ...b,
              rating: newAvg,
              reviewsCount: newCount,
            }
          : b
      )
    );

    // Update in selectedBusiness state if currently open in modal
    setSelectedBusiness((prev) => {
      if (!prev || prev.id !== businessId) return prev;
      return {
        ...prev,
        rating: newAvg,
        reviewsCount: newCount,
      };
    });

    const targetBiz = businesses.find((b) => b.id === businessId);

    // Add immutable compliance & activity audit log entry
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: currentUserEmail || 'customer@bwana.africa',
      role: currentRole,
      action: 'CUSTOMER_REVIEW_PUBLISHED',
      targetEntity: 'BusinessReview',
      targetId: newRev.id,
      details: `Published ${rating}-star customer review for "${targetBiz?.name || businessId}": "${comment.slice(0, 60)}..."`,
      ipAddress: '102.144.92.14 (Zambia IP)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Send platform notification to business owner
    const reviewNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'business',
      title: `New ${rating}-Star Customer Review`,
      message: `${newRev.userName} reviewed ${targetBiz?.name || 'your business'}: "${comment.slice(0, 60)}..."`,
      timestamp: 'Just now',
      read: false,
      iconType: 'review',
      linkAction: businessId,
    };
    setNotifications((prev) => [reviewNotif, ...prev]);
  };

  const handleHelpfulVote = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      )
    );
  };

  const handleRespondToReview = (
    reviewId: string,
    responseComment: string,
    responderName: string
  ) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              response: {
                comment: responseComment,
                respondedAt: 'Just now',
                responderName,
              },
            }
          : r
      )
    );

    const targetRev = reviews.find((r) => r.id === reviewId);
    const targetBiz = businesses.find((b) => b.id === targetRev?.businessId);

    // Notify customer
    const replyNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'customer',
      title: `Official response from ${responderName}`,
      message: `${targetBiz?.name || 'The merchant'} replied to your review: "${responseComment.slice(0, 60)}..."`,
      timestamp: 'Just now',
      read: false,
      iconType: 'review',
      linkAction: targetRev?.businessId,
    };
    setNotifications((prev) => [replyNotif, ...prev]);
  };

  // Canonical ABC Hardware business for owner dashboard view
  const abcHardwareBiz =
    businesses.find((b) => b.id === 'biz-abc-hardware') || businesses[0];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. Header Navigation Contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        currentLocation={currentLocation}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={unreadCount}
        isAuthenticated={isAuthenticated}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        onSignOut={handleSignOut}
        onSwitchUser={handleSwitchUser}
      />

      {/* 2. Main Application Body Router */}
      <main className="flex-1">
        {currentTab === 'discover' && (
          <HomeScreen
            businesses={businesses}
            currentLocation={currentLocation}
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onDirections={handleDirections}
            savedBusinessIds={savedBusinessIds}
            onToggleSave={handleToggleSave}
            onSelectCategory={handleCategorySelect}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'businesses' && (
          <SearchResults
            businesses={businesses}
            currentLocation={currentLocation}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onDirections={handleDirections}
            savedBusinessIds={savedBusinessIds}
            onToggleSave={handleToggleSave}
            onOpenClaimModal={(biz) => setClaimModalBiz(biz)}
          />
        )}

        {currentTab === 'professionals' && (
          <ProfessionalsList
            professionals={professionals}
            currentLocation={currentLocation}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
          />
        )}

        {currentTab === 'events' && (
          <EventsList
            events={events}
            currentLocation={currentLocation}
            onCall={handleCall}
          />
        )}

        {currentTab === 'opportunities' && (
          <OpportunitiesList opportunities={opportunities} />
        )}

        {currentTab === 'business_dashboard' && (
          <BusinessDashboard
            business={abcHardwareBiz}
            onUpdateBusiness={handleUpdateBusiness}
            onSwitchView={(tab) => setCurrentTab(tab)}
            reviews={reviews}
            onRespondToReview={handleRespondToReview}
          />
        )}

        {currentTab === 'register_business' && (
          <BusinessRegistrationPortal
            onRegisterBusiness={handleRegisterBusiness}
            onNavigateToAdmin={() => {
              setCurrentRole('admin');
              setCurrentTab('admin_dashboard');
            }}
            onNavigateToDiscovery={(bizId) => {
              setCurrentTab('businesses');
              if (bizId) {
                const found = businesses.find((b) => b.id === bizId);
                if (found) setSelectedBusiness(found);
              }
            }}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            businesses={businesses}
            verifications={verifications}
            auditLogs={auditLogs}
            onApproveVerification={handleApproveVerification}
            onRejectVerification={handleRejectVerification}
            onNavigateToBusiness={(bizId) => {
              const found = businesses.find((b) => b.id === bizId);
              if (found) {
                setSelectedBusiness(found);
              }
            }}
          />
        )}

        {currentTab === 'architecture' && <EngineeringSpec />}
      </main>

      {/* 3. Footer */}
      <Footer onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* 4. Global Modals */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      <SearchEngineModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        businesses={businesses}
        professionals={professionals}
        currentLocation={currentLocation}
        onSelectBusiness={(biz) => setSelectedBusiness(biz)}
        onSelectProfessional={(pro) => {
          setCurrentTab('professionals');
        }}
      />

      <BusinessProfileModal
        business={selectedBusiness}
        isOpen={Boolean(selectedBusiness)}
        onClose={() => setSelectedBusiness(null)}
        onCall={handleCall}
        onWhatsApp={handleWhatsApp}
        onDirections={handleDirections}
        isSaved={selectedBusiness ? savedBusinessIds.includes(selectedBusiness.id) : false}
        onToggleSave={handleToggleSave}
        onOpenClaimModal={(biz) => {
          setSelectedBusiness(null);
          setClaimModalBiz(biz);
        }}
        allReviews={reviews}
        onAddReview={handleAddReview}
        onHelpfulVote={handleHelpfulVote}
        currentUser={{
          isAuthenticated,
          email: currentUserEmail,
          name: currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'Verified Customer'),
          role: currentRole,
        }}
        onRequireLogin={() => setAuthModalOpen(true)}
      />

      <ClaimBusinessModal
        business={claimModalBiz}
        isOpen={Boolean(claimModalBiz)}
        onClose={() => setClaimModalBiz(null)}
        onSubmitClaim={handleClaimSubmit}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(email, role) => {
          setIsAuthenticated(true);
          setCurrentUserEmail(email);
          setCurrentRole(role);
          setCurrentUserName(email.includes('mumba') ? 'Michael Mumba' : email.split('@')[0]);
          if (role === 'business_owner') setCurrentTab('business_dashboard');
        }}
      />

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
        }}
        onSelectNotification={(notif) => {
          if (notif.linkAction) {
            const matchedBiz = businesses.find((b) => b.id === notif.linkAction);
            if (matchedBiz) setSelectedBusiness(matchedBiz);
          }
        }}
      />
    </div>
  );
}
