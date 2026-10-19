import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Business,
  BusinessReview,
  VerificationRequest,
  AuditLogEntry,
  BwanaNotification,
  Professional,
  EventItem,
  OpportunityItem,
  Category,
  Order,
  CourierDriver,
  RideRequest,
  BwanaWalletTransaction,
  ScoutOnboardingRecord,
  LocationCoordinates,
  UserAccount
} from '../types';
import {
  INITIAL_BUSINESSES,
  INITIAL_REVIEWS,
  INITIAL_VERIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFESSIONALS,
  INITIAL_EVENTS,
  INITIAL_OPPORTUNITIES,
  CATEGORIES,
  INITIAL_COURIERS,
  INITIAL_RIDES,
  INITIAL_SCOUTS,
  INITIAL_WALLET_TRANSACTIONS
} from '../data/mockData';
import {
  saveBusinessesToOfflineCache,
  getCachedBusinessesFromOffline,
  saveCategoriesToOfflineCache,
  getCachedCategoriesFromOffline
} from './offlineCache';

// 1. Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore using provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 3. Mandatory Connection Health Check (as required by Firebase skill)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errMsg = error instanceof Error ? error.message : String(error);

  if (
    errMsg.includes('the client is offline') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('Could not reach Cloud Firestore')
  ) {
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Connected to live Firebase Firestore database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
       error.message.includes('unavailable') ||
       error.message.includes('Could not reach Cloud Firestore'))
    ) {
      console.info('Firestore operating in offline/local-cache mode.');
    } else {
      console.info('Firestore initialized.');
    }
    return false;
  }
}

// Automatically test connection on module load
testConnection().catch(() => {});

// ============================================================================
// REAL-TIME FIRESTORE DATA SERVICES & AUTOMATIC SEEDING
// ============================================================================

/**
 * Real-time listener for businesses with offline-first localStorage caching
 */
export function subscribeToBusinesses(callback: (businesses: Business[]) => void): () => void {
  const path = 'businesses';
  const businessesRef = collection(db, path);

  // 1. Immediately provide cached businesses from local storage if available (instant offline access)
  const cached = getCachedBusinessesFromOffline();
  if (cached.businesses && cached.businesses.length > 0) {
    callback(cached.businesses);
  }

  // 2. Attach live Firestore listener to update cache and push real-time updates
  const unsubscribe = onSnapshot(
    businessesRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_BUSINESSES.forEach((biz) => {
            const docRef = doc(db, 'businesses', biz.id);
            batch.set(docRef, biz);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'businesses');
        }
        saveBusinessesToOfflineCache(INITIAL_BUSINESSES);
        callback(INITIAL_BUSINESSES);
      } else {
        const list: Business[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Business);
        });
        // Update local offline cache with newest live dataset
        saveBusinessesToOfflineCache(list);
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      // Fallback to local offline cache if network fails
      const fallback = getCachedBusinessesFromOffline();
      callback(fallback.businesses.length > 0 ? fallback.businesses : INITIAL_BUSINESSES);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for categories with offline caching
 */
export function subscribeToCategories(callback: (categories: Category[]) => void): () => void {
  const path = 'categories';
  const categoriesRef = collection(db, path);

  // Immediately serve from offline cache if available
  const cachedCats = getCachedCategoriesFromOffline();
  if (cachedCats && cachedCats.length > 0) {
    callback(cachedCats);
  }

  const unsubscribe = onSnapshot(
    categoriesRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          CATEGORIES.forEach((cat) => {
            const docRef = doc(db, 'categories', cat.id);
            batch.set(docRef, cat);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'categories');
        }
        saveCategoriesToOfflineCache(CATEGORIES);
        callback(CATEGORIES);
      } else {
        const list: Category[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Category);
        });
        saveCategoriesToOfflineCache(list);
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      const fallback = getCachedCategoriesFromOffline();
      callback(fallback && fallback.length > 0 ? fallback : CATEGORIES);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for professionals
 */
export function subscribeToProfessionals(callback: (professionals: Professional[]) => void): () => void {
  const path = 'professionals';
  const profRef = collection(db, path);

  const unsubscribe = onSnapshot(
    profRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_PROFESSIONALS.forEach((prof) => {
            const docRef = doc(db, 'professionals', prof.id);
            batch.set(docRef, prof);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'professionals');
        }
        callback(INITIAL_PROFESSIONALS);
      } else {
        const list: Professional[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Professional);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_PROFESSIONALS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for civic & commercial events
 */
export function subscribeToEvents(callback: (events: EventItem[]) => void): () => void {
  const path = 'events';
  const eventsRef = collection(db, path);

  const unsubscribe = onSnapshot(
    eventsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_EVENTS.forEach((ev) => {
            const docRef = doc(db, 'events', ev.id);
            batch.set(docRef, ev);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'events');
        }
        callback(INITIAL_EVENTS);
      } else {
        const list: EventItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as EventItem);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_EVENTS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for tenders & opportunities
 */
export function subscribeToOpportunities(callback: (opportunities: OpportunityItem[]) => void): () => void {
  const path = 'opportunities';
  const oppRef = collection(db, path);

  const unsubscribe = onSnapshot(
    oppRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_OPPORTUNITIES.forEach((opp) => {
            const docRef = doc(db, 'opportunities', opp.id);
            batch.set(docRef, opp);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'opportunities');
        }
        callback(INITIAL_OPPORTUNITIES);
      } else {
        const list: OpportunityItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as OpportunityItem);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_OPPORTUNITIES);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for orders
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  const path = 'orders';
  const ordersRef = collection(db, path);

  const unsubscribe = onSnapshot(
    ordersRef,
    async (snapshot) => {
      if (snapshot.empty) {
        const initialOrder: Order = {
          id: 'ord-1001',
          businessId: 'biz-abc-hardware',
          businessName: 'ABC Hardware & Construction',
          items: [
            {
              product: {
                id: 'prod-1',
                businessId: 'biz-abc-hardware',
                name: 'Portland Composite Cement (Dangote 42.5N, 50kg)',
                price: 185,
                priceType: 'fixed',
                currency: 'ZMW',
                inStock: true,
                category: 'Building Materials',
              },
              businessId: 'biz-abc-hardware',
              businessName: 'ABC Hardware & Construction',
              quantity: 4,
            },
            {
              product: {
                id: 'prod-4',
                businessId: 'biz-abc-hardware',
                name: 'Industrial Heavy-Duty Angle Grinder 2300W',
                price: 1450,
                priceType: 'fixed',
                currency: 'ZMW',
                inStock: true,
                category: 'Power Tools',
              },
              businessId: 'biz-abc-hardware',
              businessName: 'ABC Hardware & Construction',
              quantity: 1,
            },
          ],
          subtotal: 2190,
          deliveryFee: 45,
          platformSplitFee: 21.90,
          merchantPayout: 2168.10,
          total: 2235,
          customerName: 'Mwamba Chisanga',
          customerPhone: '+260 97 711 8330',
          deliveryAddress: 'Plot 418, Riverside Ext, Kitwe',
          notes: 'Please call when offloading rebar and cement.',
          paymentMethod: 'mtn_momo',
          paymentStatus: 'paid',
          orderStatus: 'preparing',
          trackingNumber: 'BWN-KTW-8842',
          courierName: 'Kondwani Banda (Bwana Rider)',
          courierPhone: '+260 96 220 9140',
          createdAt: new Date().toISOString(),
        };

        try {
          const docRef = doc(db, 'orders', initialOrder.id);
          await setDoc(docRef, initialOrder);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'orders');
        }
        callback([initialOrder]);
      } else {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Order);
        });
        // Sort newest first
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for reviews
 */
export function subscribeToReviews(callback: (reviews: BusinessReview[]) => void): () => void {
  const path = 'reviews';
  const reviewsRef = collection(db, path);

  const unsubscribe = onSnapshot(
    reviewsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_REVIEWS.forEach((rev) => {
            const docRef = doc(db, 'reviews', rev.id);
            batch.set(docRef, rev);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'reviews');
        }
        callback(INITIAL_REVIEWS);
      } else {
        const list: BusinessReview[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as BusinessReview);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_REVIEWS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for verification requests
 */
export function subscribeToVerifications(
  callback: (verifications: VerificationRequest[]) => void
): () => void {
  const path = 'verifications';
  const verificationsRef = collection(db, path);

  const unsubscribe = onSnapshot(
    verificationsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_VERIFICATIONS.forEach((v) => {
            const docRef = doc(db, 'verifications', v.id);
            batch.set(docRef, v);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'verifications');
        }
        callback(INITIAL_VERIFICATIONS);
      } else {
        const list: VerificationRequest[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as VerificationRequest);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_VERIFICATIONS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for audit logs
 */
export function subscribeToAuditLogs(callback: (logs: AuditLogEntry[]) => void): () => void {
  const path = 'auditLogs';
  const logsRef = collection(db, path);

  const unsubscribe = onSnapshot(
    logsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_AUDIT_LOGS.forEach((log) => {
            const docRef = doc(db, 'auditLogs', log.id);
            batch.set(docRef, log);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'auditLogs');
        }
        callback(INITIAL_AUDIT_LOGS);
      } else {
        const list: AuditLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AuditLogEntry);
        });
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_AUDIT_LOGS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for notifications
 */
export function subscribeToNotifications(
  callback: (notifs: BwanaNotification[]) => void
): () => void {
  const path = 'notifications';
  const notifsRef = collection(db, path);

  const unsubscribe = onSnapshot(
    notifsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_NOTIFICATIONS.forEach((n) => {
            const docRef = doc(db, 'notifications', n.id);
            batch.set(docRef, n);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'notifications');
        }
        callback(INITIAL_NOTIFICATIONS);
      } else {
        const list: BwanaNotification[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as BwanaNotification);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_NOTIFICATIONS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for couriers
 */
export function subscribeToCouriers(callback: (couriers: CourierDriver[]) => void): () => void {
  const path = 'couriers';
  const couriersRef = collection(db, path);

  const unsubscribe = onSnapshot(
    couriersRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_COURIERS.forEach((c) => {
            const docRef = doc(db, 'couriers', c.id);
            batch.set(docRef, c);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'couriers');
        }
        callback(INITIAL_COURIERS);
      } else {
        const list: CourierDriver[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as CourierDriver);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_COURIERS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for ride requests
 */
export function subscribeToRides(callback: (rides: RideRequest[]) => void): () => void {
  const path = 'rides';
  const ridesRef = collection(db, path);

  const unsubscribe = onSnapshot(
    ridesRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_RIDES.forEach((r) => {
            const docRef = doc(db, 'rides', r.id);
            batch.set(docRef, r);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'rides');
        }
        callback(INITIAL_RIDES);
      } else {
        const list: RideRequest[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as RideRequest);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_RIDES);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for Bwana Scouts informal vendor onboardings
 */
export function subscribeToScouts(callback: (scouts: ScoutOnboardingRecord[]) => void): () => void {
  const path = 'scouts';
  const scoutsRef = collection(db, path);

  const unsubscribe = onSnapshot(
    scoutsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_SCOUTS.forEach((s) => {
            const docRef = doc(db, 'scouts', s.id);
            batch.set(docRef, s);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'scouts');
        }
        callback(INITIAL_SCOUTS);
      } else {
        const list: ScoutOnboardingRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ScoutOnboardingRecord);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_SCOUTS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for wallet transactions
 */
export function subscribeToWalletTransactions(callback: (txs: BwanaWalletTransaction[]) => void): () => void {
  const path = 'walletTransactions';
  const txRef = collection(db, path);

  const unsubscribe = onSnapshot(
    txRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_WALLET_TRANSACTIONS.forEach((tx) => {
            const docRef = doc(db, 'walletTransactions', tx.id);
            batch.set(docRef, tx);
          });
          await batch.commit();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'walletTransactions');
        }
        callback(INITIAL_WALLET_TRANSACTIONS);
      } else {
        const list: BwanaWalletTransaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as BwanaWalletTransaction);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback(INITIAL_WALLET_TRANSACTIONS);
    }
  );

  return unsubscribe;
}

// ============================================================================
// MUTATION OPERATIONS (Persisted to Live Database)
// ============================================================================

export async function createBusinessInFirestore(business: Business): Promise<void> {
  const path = `businesses/${business.id}`;
  try {
    const docRef = doc(db, 'businesses', business.id);
    await setDoc(docRef, business);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateBusinessInFirestore(
  businessId: string,
  updates: Partial<Business>
): Promise<void> {
  const path = `businesses/${businessId}`;
  try {
    const docRef = doc(db, 'businesses', businessId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createOrderInFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: Order['orderStatus']
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { orderStatus: status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createReviewInFirestore(review: BusinessReview): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    const docRef = doc(db, 'reviews', review.id);
    await setDoc(docRef, review);

    try {
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      const bizReviews: BusinessReview[] = [];
      reviewsSnap.forEach((d) => {
        const r = d.data() as BusinessReview;
        if (r.businessId === review.businessId) {
          bizReviews.push(r);
        }
      });

      if (bizReviews.length > 0) {
        const avgRating =
          bizReviews.reduce((sum, r) => sum + r.rating, 0) / bizReviews.length;
        await updateBusinessInFirestore(review.businessId, {
          rating: Number(avgRating.toFixed(1)),
          reviewsCount: bizReviews.length,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'reviews');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateReviewInFirestore(
  reviewId: string,
  updates: Partial<BusinessReview>
): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createVerificationInFirestore(
  req: VerificationRequest
): Promise<void> {
  const path = `verifications/${req.id}`;
  try {
    const docRef = doc(db, 'verifications', req.id);
    await setDoc(docRef, req);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateVerificationStatusInFirestore(
  reqId: string,
  status: 'approved' | 'rejected',
  businessId: string
): Promise<void> {
  const path = `verifications/${reqId}`;
  try {
    const docRef = doc(db, 'verifications', reqId);
    await updateDoc(docRef, { status });

    if (status === 'approved') {
      await updateBusinessInFirestore(businessId, {
        verificationStatus: 'verified',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createAuditLogInFirestore(entry: AuditLogEntry): Promise<void> {
  const path = `auditLogs/${entry.id}`;
  try {
    const docRef = doc(db, 'auditLogs', entry.id);
    await setDoc(docRef, entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createNotificationInFirestore(
  notif: BwanaNotification
): Promise<void> {
  const path = `notifications/${notif.id}`;
  try {
    const docRef = doc(db, 'notifications', notif.id);
    await setDoc(docRef, notif);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationReadInFirestore(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    const docRef = doc(db, 'notifications', notifId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createRideInFirestore(ride: RideRequest): Promise<void> {
  const path = `rides/${ride.id}`;
  try {
    const docRef = doc(db, 'rides', ride.id);
    await setDoc(docRef, ride);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateRideStatusInFirestore(
  rideId: string,
  status: RideRequest['status'],
  driverId?: string,
  driverName?: string
): Promise<void> {
  const path = `rides/${rideId}`;
  try {
    const docRef = doc(db, 'rides', rideId);
    const updates: any = { status };
    if (driverId) updates.driverId = driverId;
    if (driverName) updates.driverName = driverName;
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createScoutInFirestore(record: ScoutOnboardingRecord): Promise<void> {
  const path = `scouts/${record.id}`;
  try {
    const docRef = doc(db, 'scouts', record.id);
    await setDoc(docRef, record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createWalletTransactionInFirestore(tx: BwanaWalletTransaction): Promise<void> {
  const path = `walletTransactions/${tx.id}`;
  try {
    const docRef = doc(db, 'walletTransactions', tx.id);
    await setDoc(docRef, tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateCourierLocationInFirestore(
  courierId: string,
  location: LocationCoordinates,
  status?: CourierDriver['status']
): Promise<void> {
  const path = `couriers/${courierId}`;
  try {
    const docRef = doc(db, 'couriers', courierId);
    const updates: any = { currentLocation: location };
    if (status) updates.status = status;
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ============================================================================
// USER ACCOUNT & IDENTITY VERIFICATION SERVICES
// ============================================================================

export async function saveUserProfileToFirestore(user: UserAccount): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(userId: string): Promise<UserAccount | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export function subscribeToUserProfile(
  userId: string,
  callback: (user: UserAccount | null) => void
): () => void {
  const path = `users/${userId}`;
  const docRef = doc(db, 'users', userId);
  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserAccount);
      } else {
        callback(null);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      callback(null);
    }
  );
  return unsubscribe;
}

export async function signInWithGooglePopup(): Promise<any> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.warn('Google Popup sign-in notice (falling back if blocked by iframe):', error);
    throw error;
  }
}

