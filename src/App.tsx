/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Store, Compass, Truck, ShoppingBag, User, Clock, X, LogOut, CheckCircle2, MapPin } from 'lucide-react';
import { useCart } from './context/CartContext';
import {
  checkIsSessionExpired,
  recordUserActivity,
  clearAllAuthSessions,
  getStoredBusinessSession,
  saveBusinessSession,
} from './services/sessionTimeoutService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeScreen } from './components/discovery/HomeScreen';
import { SearchResults } from './components/discovery/SearchResults';
import { SavedFavoritesView } from './components/discovery/SavedFavoritesView';
import { BusinessProfileModal } from './components/business/BusinessProfileModal';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { ClaimBusinessModal } from './components/business/ClaimBusinessModal';
import { ProfessionalsList } from './components/professionals/ProfessionalsList';
import { EventsList } from './components/events/EventsList';
import { OpportunitiesList } from './components/opportunities/OpportunitiesList';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BusinessRegistrationPortal } from './components/business/BusinessRegistrationPortal';
import { EngineeringSpec } from './components/architecture/EngineeringSpec';
import { UserDashboard } from './components/user/UserDashboard';
import { LocationPickerModal } from './components/common/LocationPickerModal';
import { SearchEngineModal } from './components/common/SearchEngineModal';
import { UserAuthModal } from './components/auth/UserAuthModal';
import { NrcFacialVerificationModal } from './components/auth/NrcFacialVerificationModal';
import { BusinessLoginModal } from './components/auth/BusinessLoginModal';
import { UnifiedAuthModal } from './components/auth/UnifiedAuthModal';
import { BusinessRegistrationPage } from './components/business/BusinessRegistrationPage';
import { AdminGateModal } from './components/auth/AdminGateModal';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { ApiConsoleModal } from './components/common/ApiConsoleModal';
import { CartDrawer } from './components/common/CartDrawer';
import { BwanaScoutsModal } from './components/scouts/BwanaScoutsModal';
import { CourierLogisticsModal } from './components/logistics/CourierLogisticsModal';
import { WholesaleDirectoryModal } from './components/wholesalers/WholesaleDirectoryModal';
import { BwanaWalletModal } from './components/wallet/BwanaWalletModal';
import { QrStickerModal } from './components/common/QrStickerModal';
import { SidebarDrawer } from './components/layout/SidebarDrawer';
import { OfflineCacheBanner } from './components/common/OfflineCacheBanner';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { DirectChatModal } from './components/chat/DirectChatModal';
import { DockedChatDrawer } from './components/chat/DockedChatDrawer';
import { UserConversationsDrawer } from './components/chat/UserConversationsDrawer';
import { FollowingFeed } from './components/discovery/FollowingFeed';
import { DATABASE_CATEGORIES } from './services/dbSeeder';
import { APIProvider } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
  UserAccount,
} from './types';

import {
  LOCATIONS,
  SYSTEM_USERS,
  calculateDistanceKm,
} from './data/mockData';

import {
  subscribeToBusinesses,
  subscribeToReviews,
  subscribeToVerifications,
  subscribeToAuditLogs,
  subscribeToNotifications,
  subscribeToProfessionals,
  subscribeToEvents,
  subscribeToOpportunities,
  createBusinessInFirestore,
  updateBusinessInFirestore,
  createReviewInFirestore,
  updateReviewInFirestore,
  createVerificationInFirestore,
  updateVerificationStatusInFirestore,
  createAuditLogInFirestore,
  createNotificationInFirestore,
  markNotificationReadInFirestore,
  createProfessionalInFirestore,
  createOpportunityInFirestore,
  subscribeToCategories,
  subscribeToUserConversations,
} from './services/firebase';

export default function App() {
  // Navigation & Role State (3 Isolated Security Roles: admin, business, user)
  const [currentTab, setCurrentTab] = useState<string>('discover');
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [currentLocation, setCurrentLocation] = useState<LocationArea>(LOCATIONS[0]); // Kitwe default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Google Maps API Quota alert state
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<{ message: string; type: 'info' | 'denied' } | null>(null);

  useEffect(() => {
    const quotaHandler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', quotaHandler);
    return () => window.removeEventListener('gmp-quota-exceeded', quotaHandler);
  }, []);

  // Safe browser location detection on first visit
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    // Only attempt if not already saved in local session
    const hasPrompted = sessionStorage.getItem('bwana_gps_checked');
    if (hasPrompted) return;
    sessionStorage.setItem('bwana_gps_checked', 'true');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Match closest Zambian location
        let closest = LOCATIONS[0];
        let minD = Infinity;
        for (const loc of LOCATIONS) {
          const d = Math.hypot(
            loc.coordinates.latitude - latitude,
            loc.coordinates.longitude - longitude
          );
          if (d < minD) {
            minD = d;
            closest = loc;
          }
        }
        setCurrentLocation(closest);
      },
      (err) => {
        if (err.code === 1) {
          // User denied permission: inform them gently with manual change option
          setLocationNotice({
            message: 'Location access was not enabled. Defaulting to Kitwe Central — tap to change your city anytime.',
            type: 'denied',
          });
        }
      },
      { timeout: 6000, maximumAge: 600000 }
    );
  }, []);

  // Core Data State (Pure live synchronization with Firestore database)
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [notifications, setNotifications] = useState<BwanaNotification[]>([]);
  const [savedBusinessIds, setSavedBusinessIds] = useState<string[]>([]);

  // Modals & Drawers State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [nrcModalOpen, setNrcModalOpen] = useState(false);
  const [businessLoginModalOpen, setBusinessLoginModalOpen] = useState(false);
  const [adminGateModalOpen, setAdminGateModalOpen] = useState(false);
  const [apiConsoleModalOpen, setApiConsoleModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [scoutsModalOpen, setScoutsModalOpen] = useState(false);
  const [logisticsModalOpen, setLogisticsModalOpen] = useState(false);
  const [wholesaleModalOpen, setWholesaleModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [qrStickerModalBiz, setQrStickerModalBiz] = useState<Business | null>(null);
  const { totalItems: totalCartItems } = useCart();
  const [categories, setCategories] = useState<Category[]>(DATABASE_CATEGORIES);
  const [directChatBiz, setDirectChatBiz] = useState<Business | null>(null);
  const [conversationsDrawerOpen, setConversationsDrawerOpen] = useState(false);
  const [unreadChatMessagesCount, setUnreadChatMessagesCount] = useState(0);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [claimModalBiz, setClaimModalBiz] = useState<Business | null>(null);
  const [activeRouteDestination, setActiveRouteDestination] = useState<Business | null>(null);

  // Inactivity timeout notice state (10-minute timeout)
  const [sessionTimeoutNotice, setSessionTimeoutNotice] = useState<string | null>(() => {
    if (checkIsSessionExpired()) {
      clearAllAuthSessions();
      return 'You were automatically logged out because the app has not been opened or active for more than 10 minutes.';
    }
    return null;
  });

  // Authenticated User Account (with NRC & Biometric Verification status)
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(() => {
    try {
      if (checkIsSessionExpired()) return null;
      const stored = localStorage.getItem('bwana_user_account_v1');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Stored Business Merchant Session
  const [businessSession, setBusinessSession] = useState<{ email: string; role: UserRole; name: string } | null>(() => {
    if (checkIsSessionExpired()) return null;
    return getStoredBusinessSession() as { email: string; role: UserRole; name: string } | null;
  });

  // Authentication state (Synced with currentUserAccount or active session)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (checkIsSessionExpired()) return false;
      return Boolean(localStorage.getItem('bwana_user_account_v1') || localStorage.getItem('bwana_business_session_v1'));
    } catch {
      return false;
    }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    try {
      if (checkIsSessionExpired()) return '';
      const userStored = localStorage.getItem('bwana_user_account_v1');
      if (userStored) {
        const u = JSON.parse(userStored);
        return u.email || u.phone || '';
      }
      const biz = getStoredBusinessSession();
      if (biz) return biz.email || '';
    } catch {}
    return '';
  });
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    try {
      if (checkIsSessionExpired()) return '';
      const userStored = localStorage.getItem('bwana_user_account_v1');
      if (userStored) {
        const u = JSON.parse(userStored);
        return u.name || '';
      }
      const biz = getStoredBusinessSession();
      if (biz) return biz.name || '';
    } catch {}
    return '';
  });

  // Active Merchant Business ID (for dynamic BusinessDashboard routing)
  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    try {
      const biz = getStoredBusinessSession();
      return (biz as any)?.businessId || 'biz-abc-hardware';
    } catch {
      return 'biz-abc-hardware';
    }
  });
  const [currentBusinessOwnerBiz, setCurrentBusinessOwnerBiz] = useState<Business | null>(null);

  // Visual success notification banner for business registration
  const [registrationSuccessToast, setRegistrationSuccessToast] = useState<{
    businessName: string;
    city: string;
    businessId: string;
  } | null>(null);

  // Unified Handler for newly registered businesses: sets owner state, switches dashboard, and sends notification
  const handleBusinessRegistrationSuccess = (newBiz: Business, applicantEmail?: string) => {
    setBusinesses((prev) => [newBiz, ...prev.filter((b) => b.id !== newBiz.id)]);
    setCurrentBusinessOwnerBiz(newBiz);
    setActiveBusinessId(newBiz.id);
    setIsAuthenticated(true);
    setCurrentRole('business_owner');
    setCurrentUserEmail(applicantEmail || newBiz.email || 'merchant@bwana.zm');
    setCurrentUserName(newBiz.name);
    setCurrentTab('business_dashboard');

    const session = {
      email: applicantEmail || newBiz.email || 'merchant@bwana.zm',
      role: 'business_owner' as UserRole,
      name: newBiz.name,
      businessId: newBiz.id,
      businessName: newBiz.name,
    };
    setBusinessSession(session);
    saveBusinessSession(session);
    recordUserActivity();
    setSessionTimeoutNotice(null);

    const regNotif: BwanaNotification = {
      id: `notif-reg-${Date.now()}`,
      recipientType: 'business',
      title: 'Business Registration Successful 🎉',
      message: `${newBiz.name} is now registered in ${newBiz.city} and discoverable on Bwana.`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: newBiz.id,
    };
    setNotifications((prev) => [regNotif, ...prev]);

    setRegistrationSuccessToast({
      businessName: newBiz.name,
      city: newBiz.city,
      businessId: newBiz.id,
    });
  };

  // Real-Time Firestore Synchronization
  useEffect(() => {
    // Purge any stale mock data left in client localStorage
    try {
      const stored = localStorage.getItem('bwana_offline_businesses_v1');
      if (stored && (stored.includes('biz-abc-hardware') || stored.includes('Copper & Thyme') || stored.includes('Riverside Master'))) {
        localStorage.removeItem('bwana_offline_businesses_v1');
        localStorage.removeItem('bwana_offline_meta_v1');
      }
      const savedIds = localStorage.getItem('bwana_saved_biz_ids');
      if (savedIds && savedIds.includes('biz-abc-hardware')) {
        localStorage.removeItem('bwana_saved_biz_ids');
      }
      const savedOrders = localStorage.getItem('bwana_orders');
      if (savedOrders && savedOrders.includes('ord-1001')) {
        localStorage.removeItem('bwana_orders');
      }
    } catch {}

    const unsubBiz = subscribeToBusinesses((liveBiz) => {
      setBusinesses(liveBiz);
      setIsLiveConnected(true);
    });

    const unsubRev = subscribeToReviews((liveReviews) => {
      setReviews(liveReviews);
    });

    const unsubVer = subscribeToVerifications((liveVerifications) => {
      setVerifications(liveVerifications);
    });

    const unsubLogs = subscribeToAuditLogs((liveLogs) => {
      setAuditLogs(liveLogs);
    });

    const unsubNotifs = subscribeToNotifications((liveNotifs) => {
      setNotifications(liveNotifs);
    });

    const unsubProf = subscribeToProfessionals((liveProf) => {
      setProfessionals(liveProf);
    });

    const unsubEvents = subscribeToEvents((liveEvents) => {
      setEvents(liveEvents);
    });

    const unsubOpp = subscribeToOpportunities((liveOpp) => {
      setOpportunities(liveOpp);
    });

    const unsubCats = subscribeToCategories((liveCats) => {
      setCategories(liveCats);
    });

    return () => {
      if (typeof unsubBiz === 'function') unsubBiz();
      if (typeof unsubRev === 'function') unsubRev();
      if (typeof unsubVer === 'function') unsubVer();
      if (typeof unsubLogs === 'function') unsubLogs();
      if (typeof unsubNotifs === 'function') unsubNotifs();
      if (typeof unsubProf === 'function') unsubProf();
      if (typeof unsubEvents === 'function') unsubEvents();
      if (typeof unsubOpp === 'function') unsubOpp();
      if (typeof unsubCats === 'function') unsubCats();
    };
  }, []);

  // Real-time listener for user in-app chat conversations & unread badges
  useEffect(() => {
    const effectiveUserId =
      currentUserAccount?.id || localStorage.getItem('bwana_chat_guest_id') || '';
    if (!effectiveUserId) return;

    const unsubUserConvos = subscribeToUserConversations(effectiveUserId, (convos) => {
      const totalUnread = convos.reduce((acc, c) => acc + (c.unreadCountForUser || 0), 0);
      setUnreadChatMessagesCount(totalUnread);
    });

    return () => {
      if (typeof unsubUserConvos === 'function') unsubUserConvos();
    };
  }, [currentUserAccount]);

  // Sync selectedBusiness with live businesses if modified in Firestore
  useEffect(() => {
    if (selectedBusiness) {
      const found = businesses.find((b) => b.id === selectedBusiness.id);
      if (found && JSON.stringify(found) !== JSON.stringify(selectedBusiness)) {
        setSelectedBusiness(found);
      }
    }
  }, [businesses, selectedBusiness]);

  // 10-Minute Inactivity & Auto-Logout Tracker (logs out any user who hasn't opened/used app for >10 mins)
  useEffect(() => {
    if (!isAuthenticated) return;

    recordUserActivity();

    let lastRecordTime = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastRecordTime > 10000) {
        lastRecordTime = now;
        recordUserActivity(now);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (checkIsSessionExpired()) {
          handleAutoSignOut('Session Expired: You were automatically logged out after 10 minutes of inactivity.');
        } else {
          lastRecordTime = Date.now();
          recordUserActivity();
        }
      } else if (document.visibilityState === 'hidden') {
        recordUserActivity();
      }
    };

    const intervalId = window.setInterval(() => {
      if (checkIsSessionExpired()) {
        handleAutoSignOut('Session Expired: You were automatically logged out after 10 minutes of inactivity.');
      }
    }, 15000);

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  // Handler for User Registration/Login via Google, Facebook, Phone, or Email
  const handleUserAuthSuccess = (user: UserAccount, startVerificationImmediately = false) => {
    setCurrentUserAccount(user);
    setIsAuthenticated(true);
    setCurrentUserEmail(user.email || user.phone || '');
    setCurrentUserName(user.name);
    setCurrentRole('user');
    try {
      localStorage.setItem('bwana_user_account_v1', JSON.stringify(user));
      recordUserActivity();
    } catch {}
    setSessionTimeoutNotice(null);
    setAuthModalOpen(false);
    if (startVerificationImmediately && !user.isNrcVerified) {
      setNrcModalOpen(true);
    } else {
      setCurrentTab('user_dashboard');
    }
  };

  // Handler for successful NRC upload + live facial recognition verification
  const handleNrcVerificationComplete = (updatedUser: UserAccount) => {
    setCurrentUserAccount(updatedUser);
    setIsAuthenticated(true);
    setCurrentUserName(updatedUser.name);
    if (updatedUser.email) setCurrentUserEmail(updatedUser.email);
    try {
      localStorage.setItem('bwana_user_account_v1', JSON.stringify(updatedUser));
    } catch {}
    setNrcModalOpen(false);

    // Audit log entry for approved biometric verification
    const log: AuditLogEntry = {
      id: `aud-nrc-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: updatedUser.email || updatedUser.phone || updatedUser.name,
      role: 'user',
      action: 'NRC_FACIAL_VERIFICATION_APPROVED',
      targetEntity: 'UserAccount',
      targetId: updatedUser.id,
      details: `Customer "${updatedUser.name}" completed Zambian NRC document validation (#${updatedUser.nrcVerification?.nrcNumber}) with live facial scan confidence score ${updatedUser.nrcVerification?.facialMatchScore}%. Granted verified reviewer status.`,
      ipAddress: '102.144.92.14 (Zambia IP)',
    };
    setAuditLogs((prev) => [log, ...prev]);
    createAuditLogInFirestore(log).catch(console.error);

    // Notification of unlocked review privileges
    const nrcNotif: BwanaNotification = {
      id: `notif-nrc-${Date.now()}`,
      recipientType: 'customer',
      title: 'NRC Verification Approved ✓',
      message: 'Your green NRC document and live facial match are approved. You now have full privileges to rate businesses and write customer reviews!',
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
    };
    setNotifications((prev) => [nrcNotif, ...prev]);
    createNotificationInFirestore(nrcNotif).catch(console.error);
  };

  // Security Role Switcher between system users
  const handleSwitchUser = (u: SystemUser) => {
    setIsAuthenticated(true);
    const isSuper = u.email.toLowerCase() === 'm.mumba8@gmail.com' || u.role === 'super_admin';
    const effectiveRole: UserRole = isSuper ? 'super_admin' : u.role;
    setCurrentRole(effectiveRole);
    setCurrentUserEmail(u.email);
    setCurrentUserName(isSuper ? 'Super Administrator (M. Mumba)' : u.name);
    if (effectiveRole === 'admin' || effectiveRole === 'super_admin') setCurrentTab('admin_dashboard');
    else if (effectiveRole === 'business' || effectiveRole === 'business_owner') setCurrentTab('business_dashboard');
    else setCurrentTab('user_dashboard');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentRole('user');
    setCurrentUserEmail('');
    setCurrentUserName('');
    setCurrentUserAccount(null);
    setBusinessSession(null);
    clearAllAuthSessions();
    if (currentTab === 'admin_dashboard' || currentTab === 'business_dashboard' || currentTab === 'user_dashboard') {
      setCurrentTab('discover');
    }
  };

  const handleAutoSignOut = (message: string) => {
    handleSignOut();
    setSessionTimeoutNotice(message);
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
    setSelectedBusiness(null); // Close profile modal so user is taken directly to map
    setActiveRouteDestination(biz);
    setCurrentTab('discover');
    setTimeout(() => {
      const el = document.getElementById('businesses-near-you-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  const handleRegisterBusiness = async (newBusiness: Business, newVerification: VerificationRequest) => {
    // Optimistic UI updates
    setBusinesses((prev) => [newBusiness, ...prev]);
    setVerifications((prev) => [newVerification, ...prev]);

    // Add compliance audit log entry
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

    // Live Firestore Persistence (Real-Time Database)
    try {
      await createBusinessInFirestore(newBusiness);
      await createVerificationInFirestore(newVerification);
      await createAuditLogInFirestore(newLog);
      await createNotificationInFirestore(ownerNotif);
      await createNotificationInFirestore(adminNotif);
    } catch (err) {
      console.error('Failed to persist business registration to Firestore:', err);
    }
  };

  const handleApproveVerification = async (requestId: string, businessId: string) => {
    const approvedBiz = businesses.find((b) => b.id === businessId);

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

    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: currentUserEmail || 'admin@bwana.africa',
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

    // Live Firestore Persistence
    try {
      await updateVerificationStatusInFirestore(requestId, 'approved', businessId);
      await createAuditLogInFirestore(newLog);
      await createNotificationInFirestore(newNotif);
    } catch (err) {
      console.error('Failed to approve verification in Firestore:', err);
    }
  };

  const handleRejectVerification = async (requestId: string, reason: string) => {
    const req = verifications.find((v) => v.id === requestId);

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
      actor: currentUserEmail || 'admin@bwana.africa',
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

    // Live Firestore Persistence
    try {
      if (req?.businessId) {
        await updateVerificationStatusInFirestore(requestId, 'rejected', req.businessId);
      }
      await createAuditLogInFirestore(newLog);
      await createNotificationInFirestore(newNotif);
    } catch (err) {
      console.error('Failed to reject verification in Firestore:', err);
    }
  };

  const handleApproveGoogleMapsBusiness = async (businessId: string) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId
          ? { ...b, verificationStatus: 'verified', verificationTier: 'bwana_verified' }
          : b
      )
    );

    const biz = businesses.find((b) => b.id === businessId);
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: currentUserEmail || 'm.mumba8@gmail.com',
      role: 'admin',
      action: 'GOOGLE_MAPS_BUSINESS_VERIFIED',
      targetEntity: 'Business',
      targetId: businessId,
      details: `Google Maps listed business "${biz?.name || businessId}" approved & verified by Admin. Granted Bwana Verified Badge (✓).`,
      ipAddress: '102.144.92.10 (Internal)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    const newNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'business',
      title: 'Google Maps Place Verified ✓',
      message: `${biz?.name || 'Business'} has been verified from Google Maps records and awarded official Bwana Verified status.`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: businessId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    try {
      await updateBusinessInFirestore(businessId, {
        verificationStatus: 'verified',
        verificationTier: 'bwana_verified',
      });
      await createAuditLogInFirestore(newLog);
      await createNotificationInFirestore(newNotif);
    } catch (err) {
      console.error('Failed to verify Google Maps business in Firestore:', err);
    }
  };

  const handleClaimSubmit = async (claimData: {
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
    setNotifications((prev) => [newNotif, ...prev]);

    // Live Firestore Persistence
    try {
      await updateBusinessInFirestore(claimData.businessId, { verificationStatus: 'claimed' });
      await createVerificationInFirestore(claimVerificationReq);
      await createNotificationInFirestore(newNotif);
    } catch (err) {
      console.error('Failed to persist business claim to Firestore:', err);
    }
  };

  const handleUpdateBusiness = async (updated: Business) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    try {
      await updateBusinessInFirestore(updated.id, updated);
    } catch (err) {
      console.error('Failed to update business in Firestore:', err);
    }
  };

  const handleAddReview = async (
    businessId: string,
    rating: number,
    comment: string,
    tags: string[],
    verifiedVisit: boolean,
    photoUrl?: string,
    photos?: string[]
  ) => {
    const authorName = currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'Verified Customer');
    const isNrcVerified = Boolean(currentUserAccount?.isNrcVerified);
    const nrcNumberMasked = currentUserAccount?.nrcVerification?.nrcNumber
      ? currentUserAccount.nrcVerification.nrcNumber.slice(0, 4) + '.../' + currentUserAccount.nrcVerification.nrcNumber.slice(-1)
      : undefined;

    const newRev: BusinessReview = {
      id: `rev-${Date.now()}`,
      businessId,
      userId: currentUserAccount?.id || currentUserEmail || `usr-${Date.now()}`,
      userName: authorName,
      rating,
      comment,
      tags,
      photoUrl,
      photos,
      createdAt: 'Just now',
      helpfulCount: 0,
      verifiedVisit,
      isNrcVerified,
      nrcNumberMasked,
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);

    // Recompute business average rating & reviewsCount
    const bizReviews = updatedReviews.filter((r) => r.businessId === businessId);
    const newCount = bizReviews.length;
    const ratedReviews = bizReviews.filter((r) => r.rating > 0);
    const currentBiz = businesses.find((b) => b.id === businessId);
    const newAvg = ratedReviews.length > 0
      ? Math.round((ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length) * 10) / 10
      : (currentBiz?.rating || 5.0);

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

    // Add compliance & activity audit log entry
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

    // Live Firestore Persistence
    try {
      await createReviewInFirestore(newRev);
      await createAuditLogInFirestore(newLog);
      await createNotificationInFirestore(reviewNotif);
    } catch (err) {
      console.error('Failed to create review in Firestore:', err);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    const newCount = (target?.helpfulCount || 0) + 1;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: newCount } : r
      )
    );
    try {
      await updateReviewInFirestore(reviewId, { helpfulCount: newCount });
    } catch (err) {
      console.error('Failed to update helpful vote in Firestore:', err);
    }
  };

  const handleRespondToReview = async (
    reviewId: string,
    responseComment: string,
    responderName: string
  ) => {
    const resObj = {
      comment: responseComment,
      respondedAt: 'Just now',
      responderName,
    };

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              response: resObj,
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

    try {
      await updateReviewInFirestore(reviewId, { response: resObj });
      await createNotificationInFirestore(replyNotif);
    } catch (err) {
      console.error('Failed to respond to review in Firestore:', err);
    }
  };

  const handleAddProfessional = async (newPro: Professional) => {
    // Real-time optimistic state update
    setProfessionals((prev) => [newPro, ...prev]);

    // Send platform notification
    const proNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'professional',
      title: 'Skill Showcase Published Online',
      message: `${newPro.name} has been published to the Zambia Pros Directory in ${newPro.field || 'Contractor Services'} (${newPro.isVerified ? 'Verified Credentials' : 'Standard'}).`,
      timestamp: 'Just now',
      read: false,
      iconType: 'verification',
      linkAction: newPro.id,
    };
    setNotifications((prev) => [proNotif, ...prev]);

    // Record audit trail
    const proAudit: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUserEmail || newPro.name,
      role: currentRole,
      action: 'PROFESSIONAL_SKILL_SHOWCASE_CREATED',
      targetEntity: 'professional',
      targetId: newPro.id,
      details: `Showcased ${newPro.name} (${newPro.title}) in ${newPro.field} with documentation: ${newPro.qualificationDocType || 'None'}`,
      ipAddress: '102.140.231.84',
    };
    setAuditLogs((prev) => [proAudit, ...prev]);

    try {
      await createProfessionalInFirestore(newPro);
      await createNotificationInFirestore(proNotif);
      await createAuditLogInFirestore(proAudit);
    } catch (err) {
      console.error('Failed to save professional in Firestore:', err);
    }
  };

  const handleCreateOpportunity = async (newOpp: OpportunityItem) => {
    // Real-time optimistic update
    setOpportunities((prev) => [newOpp, ...prev]);

    const oppNotif: BwanaNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'business',
      title: 'New Tender / Opportunity Published',
      message: `${newOpp.title} by ${newOpp.organization} is now live on the tenders board.`,
      timestamp: 'Just now',
      read: false,
      iconType: 'promotion',
      linkAction: newOpp.id,
    };
    setNotifications((prev) => [oppNotif, ...prev]);

    try {
      await createOpportunityInFirestore(newOpp);
      await createNotificationInFirestore(oppNotif);
    } catch (err) {
      console.error('Failed to save opportunity in Firestore:', err);
    }
  };

  // Canonical ABC Hardware business for owner dashboard view
  const abcHardwareBiz =
    businesses.find((b) => b.id === 'biz-abc-hardware') || businesses[0];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} region="ZM" language="en">
      <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
        {/* Google Maps Quota Exhaustion Sticky Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-between">
            <div className="flex-1 text-center">
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </div>
            <button
              onClick={() => setQuotaExceeded(false)}
              className="p-1 hover:bg-amber-100 rounded text-amber-800 ml-2 cursor-pointer"
              aria-label="Dismiss quota notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Header Navigation Contract */}
        <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        currentLocation={currentLocation}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenApiConsole={() => setApiConsoleModalOpen(true)}
        onOpenBusinessLogin={() => setBusinessLoginModalOpen(true)}
        onOpenRegisterBusiness={() => setCurrentTab('register_business')}
        onOpenAdminGate={() => setAdminGateModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenMessages={() => setConversationsDrawerOpen(true)}
        unreadMessagesCount={unreadChatMessagesCount}
        unreadCount={unreadCount}
        isAuthenticated={isAuthenticated}
        isNrcVerified={Boolean(currentUserAccount?.isNrcVerified)}
        onOpenNrcModal={() => setNrcModalOpen(true)}
        currentUserName={currentUserName}
        onSignOut={handleSignOut}
        savedCount={savedBusinessIds.length}
      />

      {/* Visual Success Notification for New Business Registration */}
      {registrationSuccessToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-lg flex items-center justify-between gap-3 animate-fade-in transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <span>Business Registered Successfully!</span>
                <span className="bg-emerald-700/80 px-2 py-0.5 rounded text-[10px] font-mono">Live on Bwana</span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                "{registrationSuccessToast.businessName}" is now active in {registrationSuccessToast.city}. You are logged into your merchant dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const biz = businesses.find((b) => b.id === registrationSuccessToast.businessId);
                if (biz) setSelectedBusiness(biz);
              }}
              className="px-3 py-1.5 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
            >
              View Listing
            </button>
            <button
              onClick={() => setRegistrationSuccessToast(null)}
              className="p-1 hover:bg-white/20 rounded text-emerald-100 hover:text-white cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 10-Minute Inactivity Session Timeout Alert Notice */}
      {sessionTimeoutNotice && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in transition-colors">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{sessionTimeoutNotice}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSessionTimeoutNotice(null);
                setAuthModalOpen(true);
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Sign In
            </button>
            <button
              onClick={() => setSessionTimeoutNotice(null)}
              className="p-1 text-amber-700 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white rounded cursor-pointer"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GPS Location Permission / Fallback Informational Banner */}
      {locationNotice && (
        <div className="bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in transition-colors">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{locationNotice.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setLocationNotice(null);
                setLocationModalOpen(true);
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Change City
            </button>
            <button
              onClick={() => setLocationNotice(null)}
              className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded cursor-pointer"
              title="Dismiss location notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Offline Status & Directory Cache Notification */}
      <OfflineCacheBanner
        businesses={businesses}
        isLiveConnected={isLiveConnected}
      />

      {/* 2. Main Application Body Router */}
      <main className="flex-1 pb-20 md:pb-6">
        {currentTab === 'discover' && (
          <HomeScreen
            businesses={businesses}
            categories={categories}
            currentLocation={currentLocation}
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onDirections={handleDirections}
            onChat={(biz) => setDirectChatBiz(biz)}
            savedBusinessIds={savedBusinessIds}
            onToggleSave={handleToggleSave}
            onSelectCategory={handleCategorySelect}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenLogistics={() => setLogisticsModalOpen(true)}
            onOpenScouts={() => setScoutsModalOpen(true)}
            onOpenCart={() => setCartDrawerOpen(true)}
            activeRouteDestination={activeRouteDestination}
            onClearActiveRoute={() => setActiveRouteDestination(null)}
          />
        )}

        {currentTab === 'businesses' && (
          <SearchResults
            businesses={businesses}
            categories={categories}
            currentLocation={currentLocation}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onDirections={handleDirections}
            onChat={(biz) => setDirectChatBiz(biz)}
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
            currentUser={{
              isAuthenticated,
              email: currentUserEmail,
              name: currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'Public Viewer'),
              role: currentRole,
              isNrcVerified: Boolean(currentUserAccount?.isNrcVerified),
              userAccount: currentUserAccount,
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            onAddProfessional={handleAddProfessional}
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
          <OpportunitiesList
            opportunities={opportunities}
            currentUser={{
              isAuthenticated,
              email: currentUserEmail,
              name: currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'Public Viewer'),
              role: currentRole,
            }}
            onCreateOpportunity={handleCreateOpportunity}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'following' && (
          <FollowingFeed
            currentUserId={currentUserAccount?.id || currentUserEmail || 'guest_user'}
            allBusinesses={businesses}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onOpenChatWithBusiness={(biz) => setDirectChatBiz(biz)}
            onNavigateToDiscovery={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'favorites' && (
          <SavedFavoritesView
            businesses={businesses}
            savedBusinessIds={savedBusinessIds}
            onToggleSave={handleToggleSave}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
            onDirections={handleDirections}
            onNavigateToDiscover={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'business_dashboard' && (
          <BusinessDashboard
            business={
              currentBusinessOwnerBiz ||
              businesses.find((b) => b.id === activeBusinessId) ||
              abcHardwareBiz
            }
            onUpdateBusiness={(updated) => {
              if (currentBusinessOwnerBiz && currentBusinessOwnerBiz.id === updated.id) {
                setCurrentBusinessOwnerBiz(updated);
              }
              handleUpdateBusiness(updated);
            }}
            onSwitchView={(tab) => setCurrentTab(tab)}
            reviews={reviews}
            onRespondToReview={handleRespondToReview}
            onSignOut={handleSignOut}
          />
        )}

        {currentTab === 'register_business' && (
          <BusinessRegistrationPage
            onSuccess={(email, role, name, business) => {
              if (business) {
                handleBusinessRegistrationSuccess(business, email);
              } else {
                setIsAuthenticated(true);
                setCurrentUserEmail(email);
                setCurrentRole('business_owner');
                setCurrentUserName(name || 'Business Owner');
                setCurrentTab('business_dashboard');
                recordUserActivity();
                setSessionTimeoutNotice(null);
              }
            }}
            onBusinessRegistered={(newBiz) => {
              handleBusinessRegistrationSuccess(newBiz);
            }}
            onNavigateHome={() => setCurrentTab('discover')}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            businesses={businesses}
            verifications={verifications}
            auditLogs={auditLogs}
            currentUserEmail={currentUserEmail || 'm.mumba8@gmail.com'}
            currentRole={currentRole}
            onApproveVerification={handleApproveVerification}
            onRejectVerification={handleRejectVerification}
            onApproveGoogleMapsBusiness={handleApproveGoogleMapsBusiness}
            onNavigateToBusiness={(bizId) => {
              const found = businesses.find((b) => b.id === bizId);
              if (found) {
                setSelectedBusiness(found);
              }
            }}
            onDirections={handleDirections}
          />
        )}

        {currentTab === 'user_dashboard' && (
          <UserDashboard
            currentUser={currentUserAccount}
            currentUserName={currentUserName}
            currentUserEmail={currentUserEmail}
            onStartNrcVerification={() => setNrcModalOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            savedBusinessCount={savedBusinessIds.length}
            userReviews={reviews}
            businesses={businesses}
            onSelectBusiness={(biz) => setSelectedBusiness(biz)}
            onOpenCart={() => setCartDrawerOpen(true)}
            onOpenLogistics={() => setLogisticsModalOpen(true)}
            onSignOut={handleSignOut}
          />
        )}

        {currentTab === 'architecture' && <EngineeringSpec />}
      </main>

      {/* 3. Footer */}
      <Footer
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAdminGate={() => setAdminGateModalOpen(true)}
        onOpenBusinessLogin={() => setBusinessLoginModalOpen(true)}
        onOpenScouts={() => setScoutsModalOpen(true)}
        onOpenLogistics={() => setLogisticsModalOpen(true)}
        onOpenWholesale={() => setWholesaleModalOpen(true)}
        onOpenWallet={() => setWalletModalOpen(true)}
      />

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
        onChat={(biz) => setDirectChatBiz(biz)}
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
          name: currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'Public Viewer'),
          role: currentRole,
          isNrcVerified: Boolean(currentUserAccount?.isNrcVerified),
          userAccount: currentUserAccount,
        }}
        onRequireLogin={() => setAuthModalOpen(true)}
        onStartNrcVerification={() => setNrcModalOpen(true)}
        allBusinesses={businesses}
        onSelectBusiness={(biz) => setSelectedBusiness(biz)}
        onFilterDirectoryByTag={(tag) => {
          setSelectedBusiness(null);
          setSelectedTag(tag);
          setCurrentTab('businesses');
        }}
      />

      <ClaimBusinessModal
        business={claimModalBiz}
        isOpen={Boolean(claimModalBiz)}
        onClose={() => setClaimModalBiz(null)}
        onSubmitClaim={handleClaimSubmit}
      />

      {/* Unified User & Customer Authentication & Registration Modal */}
      <UnifiedAuthModal
        isOpen={authModalOpen}
        initialPersona="customer"
        initialMode="signin"
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(email, role, name, business) => {
          if (business) {
            handleBusinessRegistrationSuccess(business, email);
          } else {
            setIsAuthenticated(true);
            setCurrentUserEmail(email);

            // Auto-detect if user owns or registered any business
            const cleanEmail = email.trim().toLowerCase();
            const matchedBiz = businesses.find(
              (b) =>
                (b.email && b.email.trim().toLowerCase() === cleanEmail) ||
                (b.claimedByUserId && b.claimedByUserId.trim().toLowerCase() === cleanEmail)
            );

            const isSuperAdmin = cleanEmail === 'm.mumba8@gmail.com';
            const isAdmin =
              isSuperAdmin ||
              role === 'admin' ||
              role === 'super_admin';

            const isBizOwner =
              !isAdmin && (
                role === 'business_owner' ||
                role === 'business' ||
                Boolean(matchedBiz)
              );

            const effectiveRole: UserRole = isSuperAdmin
              ? 'super_admin'
              : isAdmin
              ? 'admin'
              : isBizOwner
              ? 'business_owner'
              : 'user';

            setCurrentRole(effectiveRole);
            setCurrentUserName(
              isSuperAdmin
                ? 'Super Administrator (M. Mumba)'
                : isAdmin
                ? name || 'Platform Administrator'
                : matchedBiz?.name || name || email.split('@')[0]
            );

            if (isAdmin) {
              setCurrentTab('admin_dashboard');
            } else if (isBizOwner) {
              setCurrentTab('business_dashboard');
              if (matchedBiz) {
                setCurrentBusinessOwnerBiz(matchedBiz);
                setActiveBusinessId(matchedBiz.id);
              }
              const session = {
                email,
                role: 'business_owner' as UserRole,
                name: matchedBiz?.name || name || 'Verified Merchant',
                businessId: matchedBiz?.id || activeBusinessId || 'biz-abc-hardware',
                businessName: matchedBiz?.name || name || 'Verified Merchant',
              };
              setBusinessSession(session);
              saveBusinessSession(session);
            } else {
              setCurrentTab('user_dashboard');
            }
            recordUserActivity();
            setSessionTimeoutNotice(null);
          }
        }}
        onBusinessRegistered={(newBiz) => {
          handleBusinessRegistrationSuccess(newBiz);
        }}
      />

      {/* Zambian National Registration Card (NRC) Upload & Live Biometric Facial Scan */}
      <NrcFacialVerificationModal
        isOpen={nrcModalOpen}
        onClose={() => setNrcModalOpen(false)}
        currentUser={currentUserAccount}
        onVerificationComplete={handleNrcVerificationComplete}
      />

      {/* Dedicated Business Merchant Login & Registration Modal */}
      <UnifiedAuthModal
        isOpen={businessLoginModalOpen}
        initialPersona="business"
        initialMode="signin"
        onClose={() => setBusinessLoginModalOpen(false)}
        onLoginSuccess={(email, _role, name, business) => {
          if (business) {
            handleBusinessRegistrationSuccess(business, email);
          } else {
            setIsAuthenticated(true);
            setCurrentUserEmail(email);

            const cleanEmail = email.trim().toLowerCase();
            const isSuperAdmin = cleanEmail === 'm.mumba8@gmail.com';

            if (isSuperAdmin) {
              setCurrentRole('super_admin');
              setCurrentUserName('Super Administrator (M. Mumba)');
              setCurrentTab('admin_dashboard');
            } else {
              setCurrentRole('business_owner');

              const matchedBiz = businesses.find(
                (b) =>
                  (b.email && b.email.trim().toLowerCase() === cleanEmail) ||
                  (b.claimedByUserId && b.claimedByUserId.trim().toLowerCase() === cleanEmail)
              );

              setCurrentUserName(matchedBiz?.name || name || 'Business Owner');
              setCurrentTab('business_dashboard');
              if (matchedBiz) {
                setCurrentBusinessOwnerBiz(matchedBiz);
                setActiveBusinessId(matchedBiz.id);
              }
              const session = {
                email,
                role: 'business_owner' as UserRole,
                name: matchedBiz?.name || name || 'Business Owner',
                businessId: matchedBiz?.id || activeBusinessId || 'biz-abc-hardware',
                businessName: matchedBiz?.name || name || 'Business Owner',
              };
              setBusinessSession(session);
              saveBusinessSession(session);
            }
            recordUserActivity();
            setSessionTimeoutNotice(null);
          }
        }}
        onBusinessRegistered={(newBiz) => {
          handleBusinessRegistrationSuccess(newBiz);
        }}
      />

      {/* Restricted Admin Clearance Gate */}
      <AdminGateModal
        isOpen={adminGateModalOpen}
        onClose={() => setAdminGateModalOpen(false)}
        onAdminAuthSuccess={(email, role, name) => {
          setIsAuthenticated(true);
          const isSuper = email.toLowerCase() === 'm.mumba8@gmail.com' || role === 'super_admin';
          const effectiveRole: UserRole = isSuper ? 'super_admin' : 'admin';
          setCurrentUserEmail(email);
          setCurrentRole(effectiveRole);
          setCurrentUserName(isSuper ? 'Super Administrator (M. Mumba)' : (name || 'Platform Administrator'));
          setCurrentTab('admin_dashboard');
          recordUserActivity();
          setSessionTimeoutNotice(null);
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

      {/* Interactive REST API v1 Console */}
      <ApiConsoleModal
        isOpen={apiConsoleModalOpen}
        onClose={() => setApiConsoleModalOpen(false)}
      />

      {/* Main Responsive Sidebar Drawer */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        currentLocation={currentLocation}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenApiConsole={() => setApiConsoleModalOpen(true)}
        onOpenBusinessLogin={() => setBusinessLoginModalOpen(true)}
        onOpenAdminGate={() => setAdminGateModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenMessages={() => setConversationsDrawerOpen(true)}
        onOpenScouts={() => setScoutsModalOpen(true)}
        onOpenLogistics={() => setLogisticsModalOpen(true)}
        onOpenWholesale={() => setWholesaleModalOpen(true)}
        onOpenWallet={() => setWalletModalOpen(true)}
        unreadCount={unreadCount}
        isAuthenticated={isAuthenticated}
        isNrcVerified={Boolean(currentUserAccount?.isNrcVerified)}
        currentUserName={currentUserName}
        onSignOut={handleSignOut}
        savedCount={savedBusinessIds.length}
      />

      {/* Cart & MoMo / Airtel Money / Wallet Checkout Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        isNrcVerified={Boolean(currentUserAccount?.isNrcVerified)}
        onRequireLogin={() => setAuthModalOpen(true)}
        onStartNrcVerification={() => setNrcModalOpen(true)}
      />

      {/* Bwana Scouts Agent Program Modal (30s Lite Form, Voice Bemba, K20 Bounty, K5 Airtime) */}
      <BwanaScoutsModal
        isOpen={scoutsModalOpen}
        onClose={() => setScoutsModalOpen(false)}
        onShopAdded={(name) => {
          // Notification of newly enrolled informal shop
          setNotifications((prev) => [
            {
              id: `notif-${Date.now()}`,
              recipientType: 'system',
              title: 'New Community Shop Enrolled',
              message: `Scout enrolled "${name}". K20 agent bounty credited.`,
              timestamp: 'Just now',
              read: false,
              iconType: 'verification',
            },
            ...prev,
          ]);
        }}
      />

      {/* Express Logistics & Live Courier Tracking & Rides Modal */}
      <CourierLogisticsModal
        isOpen={logisticsModalOpen}
        onClose={() => setLogisticsModalOpen(false)}
        isAuthenticated={isAuthenticated}
        isNrcVerified={Boolean(currentUserAccount?.isNrcVerified)}
        onRequireLogin={() => setAuthModalOpen(true)}
        onStartNrcVerification={() => setNrcModalOpen(true)}
      />

      {/* Wholesaler Restock Directory (Trade Kings, Zambeef, National Milling) */}
      <WholesaleDirectoryModal
        isOpen={wholesaleModalOpen}
        onClose={() => setWholesaleModalOpen(false)}
        businesses={businesses}
        onSelectBusiness={(biz) => setSelectedBusiness(biz)}
      />

      {/* Bwana Wallet, Savings Pots & Micro-Loan Calculator Modal */}
      <BwanaWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      {/* Printable Bwana Storefront QR Sticker Modal */}
      {qrStickerModalBiz && (
        <QrStickerModal
          isOpen={Boolean(qrStickerModalBiz)}
          onClose={() => setQrStickerModalBiz(null)}
          business={qrStickerModalBiz}
        />
      )}

      {/* Direct In-App User-to-Business Chat Modal (No WhatsApp required) */}
      <DirectChatModal
        isOpen={Boolean(directChatBiz)}
        onClose={() => setDirectChatBiz(null)}
        businessId={directChatBiz?.id || ''}
        businessName={directChatBiz?.name || 'Business'}
        businessLogo={directChatBiz?.logoUrl}
        businessCity={directChatBiz?.city}
        currentUserId={currentUserAccount?.id || currentUserEmail || 'current_user'}
        currentUserName={currentUserName || 'Customer'}
        userPhone={currentUserAccount?.phone}
      />

      {/* Docked Expandable Floating Chat Drawer (Bottom-right pill with unread badge) */}
      <DockedChatDrawer
        currentRole={currentRole}
        currentUserId={currentUserAccount?.id || currentUserEmail || 'current_user'}
        currentUserName={currentUserName || 'Customer'}
        activeBusinessId={activeBusinessId}
      />

      {/* User In-App Conversations Drawer */}
      <UserConversationsDrawer
        isOpen={conversationsDrawerOpen}
        onClose={() => setConversationsDrawerOpen(false)}
        currentUser={currentUserAccount}
        businesses={businesses}
        onSelectConversation={(biz) => {
          setDirectChatBiz(biz);
        }}
      />

      {/* 5. Stitch Mobile Platform Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-800 text-stone-400 md:hidden py-1 px-3 shadow-2xl">
        <div className="grid grid-cols-5 items-center text-center">
          <button
            onClick={() => setCurrentTab('discover')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentTab === 'discover' ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Explore</span>
          </button>

          <button
            onClick={() => setCurrentTab('businesses')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentTab === 'businesses' ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Directory</span>
          </button>

          <button
            onClick={() => setLogisticsModalOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer text-stone-400 hover:text-white relative"
          >
            <div className="relative">
              <Truck className="w-5 h-5 mb-0.5 text-emerald-400" />
              <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[10px] leading-tight">Express</span>
          </button>

          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer text-stone-400 hover:text-white relative"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-500 text-stone-950 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight">Cart</span>
          </button>

          <button
            onClick={() => {
              const cleanEmail = currentUserEmail.trim().toLowerCase();
              const ownsBiz = businesses.some(
                (b) =>
                  (b.email && b.email.trim().toLowerCase() === cleanEmail) ||
                  (b.claimedByUserId && b.claimedByUserId.trim().toLowerCase() === cleanEmail)
              );
              if (currentRole === 'business' || currentRole === 'business_owner' || ownsBiz) {
                setCurrentTab('business_dashboard');
              } else if (isAuthenticated) {
                setCurrentTab('user_dashboard');
              } else {
                setAuthModalOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
              currentTab === 'user_dashboard' || currentTab === 'business_dashboard'
                ? 'text-emerald-400 font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {currentRole === 'business' || currentRole === 'business_owner' ? (
              <Store className="w-5 h-5 mb-0.5 text-emerald-400" />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            <span className="text-[10px] leading-tight">
              {isAuthenticated
                ? currentRole === 'business' || currentRole === 'business_owner'
                  ? 'My Biz'
                  : 'Profile'
                : 'Sign In'}
            </span>
          </button>
        </div>
      </nav>
      </div>
    </APIProvider>
  );
}
