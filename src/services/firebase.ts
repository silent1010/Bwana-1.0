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
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
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
  UserAccount,
  ChatMessage,
  ChatConversation
} from '../types';
import { DATABASE_CATEGORIES, seedDatabaseData } from './dbSeeder';
import {
  saveBusinessesToOfflineCache,
  getCachedBusinessesFromOffline,
  saveCategoriesToOfflineCache,
  getCachedCategoriesFromOffline
} from './offlineCache';
import {
  insertBusinessIntoSupabase,
  insertReviewIntoSupabase,
  insertNotificationIntoSupabase
} from './supabase';

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
    (snapshot) => {
      if (snapshot.empty) {
        seedDatabaseData().catch(() => {});
      }
      const list: Business[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Business);
      });
      // Update local offline cache with newest live dataset
      saveBusinessesToOfflineCache(list);
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      // Fallback to local offline cache if network fails
      const fallback = getCachedBusinessesFromOffline();
      callback(fallback.businesses || []);
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

  const cachedCats = getCachedCategoriesFromOffline();
  if (cachedCats && cachedCats.length > 0) {
    callback(cachedCats);
  }

  const unsubscribe = onSnapshot(
    categoriesRef,
    (snapshot) => {
      if (snapshot.empty) {
        seedDatabaseData().catch(() => {});
        callback(DATABASE_CATEGORIES);
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
      callback(DATABASE_CATEGORIES);
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
    (snapshot) => {
      const list: Professional[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Professional);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: EventItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as EventItem);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: OpportunityItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as OpportunityItem);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Order);
      });
      // Sort newest first
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: BusinessReview[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as BusinessReview);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: VerificationRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as VerificationRequest);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: AuditLogEntry[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AuditLogEntry);
      });
      list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: BwanaNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as BwanaNotification);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: CourierDriver[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as CourierDriver);
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: RideRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RideRequest);
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: ScoutOnboardingRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ScoutOnboardingRecord);
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    (snapshot) => {
      const list: BwanaWalletTransaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as BwanaWalletTransaction);
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
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
    insertBusinessIntoSupabase(business).catch(() => {});
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
    insertReviewIntoSupabase(review).catch(() => {});

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
    insertNotificationIntoSupabase(notif).catch(() => {});
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
// PROFESSIONALS & OPPORTUNITIES (Live Database Real-Time Operations)
// ============================================================================

export async function createProfessionalInFirestore(pro: Professional): Promise<void> {
  const path = `professionals/${pro.id}`;
  try {
    const docRef = doc(db, 'professionals', pro.id);
    await setDoc(docRef, pro);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProfessionalInFirestore(
  proId: string,
  updates: Partial<Professional>
): Promise<void> {
  const path = `professionals/${proId}`;
  try {
    const docRef = doc(db, 'professionals', proId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createOpportunityInFirestore(opp: OpportunityItem): Promise<void> {
  const path = `opportunities/${opp.id}`;
  try {
    const docRef = doc(db, 'opportunities', opp.id);
    await setDoc(docRef, opp);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateOpportunityInFirestore(
  oppId: string,
  updates: Partial<OpportunityItem>
): Promise<void> {
  const path = `opportunities/${oppId}`;
  try {
    const docRef = doc(db, 'opportunities', oppId);
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

export async function signInWithEmail(email: string, pass: string): Promise<any> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error) {
    console.warn('Firebase Email Sign-in notice:', error);
    throw error;
  }
}

export async function registerUserAccount(data: {
  email: string;
  password?: string;
  name: string;
  phone?: string;
}): Promise<any> {
  let uid = `user_${Date.now()}`;
  if (data.password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      uid = cred.user.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
        uid = cred.user.uid;
      } else {
        throw err;
      }
    }
  }

  const userDoc = {
    id: uid,
    email: data.email,
    name: data.name,
    phone: data.phone || '',
    role: 'registered_user',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'users', uid), userDoc, { merge: true });
  } catch (err) {
    console.warn('User doc save notice:', err);
  }
  return userDoc;
}

export async function registerBusinessAccount(data: {
  email: string;
  password?: string;
  businessName: string;
  category: string;
  city: string;
  area: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  pacraNumber?: string;
  description?: string;
}): Promise<{ user: any; business: Business; notification: BwanaNotification }> {
  let uid = `biz_owner_${Date.now()}`;
  if (data.password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      uid = cred.user.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
          uid = cred.user.uid;
        } catch {
          // If signIn fails, fallback to existing email as identifier
          uid = `biz_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }
      } else {
        console.warn('Firebase auth notice during registration (falling back to generated uid):', err?.message);
        uid = `biz_owner_${Date.now()}`;
      }
    }
  }

  const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newBusiness: Business = {
    id: businessId,
    name: data.businessName,
    tagline: `Verified commercial provider in ${data.area}, ${data.city}`,
    description: data.description || `${data.businessName} serving ${data.area}, ${data.city} with verified commercial services.`,
    categoryId: data.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    categoryName: data.category,
    secondaryCategories: [data.category],
    verificationStatus: 'unverified',
    rating: 5.0,
    reviewsCount: 1,
    phone: data.phone,
    whatsapp: data.whatsapp || data.phone,
    email: data.email,
    address: data.address || `${data.area}, ${data.city}`,
    country: 'Zambia',
    countryCode: 'ZM',
    province: data.city.toLowerCase().includes('kitwe') || data.city.toLowerCase().includes('ndola') ? 'Copperbelt' : 'Lusaka',
    city: data.city,
    area: data.area,
    coordinates: {
      latitude: data.city.toLowerCase().includes('kitwe') ? -12.8024 : -15.4167,
      longitude: data.city.toLowerCase().includes('kitwe') ? 28.2132 : 28.2833,
    },
    coverImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800',
    galleryImages: [],
    isOpenNow: true,
    hours: [
      { day: 'Mon-Fri', open: '08:00', close: '18:00', isOpen: true },
      { day: 'Sat', open: '08:30', close: '15:00', isOpen: true },
      { day: 'Sun', open: 'Closed', close: 'Closed', isClosed: true },
    ],
    claimedByUserId: uid,
    products: [],
    services: [],
    promotions: [],
  };

  const regNotification: BwanaNotification = {
    id: `notif-reg-${Date.now()}`,
    recipientType: 'business',
    title: 'Business Registration Successful 🎉',
    message: `${data.businessName} has been registered in ${data.city} and is now discoverable on Bwana.`,
    timestamp: 'Just now',
    read: false,
    iconType: 'verification',
    linkAction: businessId,
  };

  try {
    await setDoc(doc(db, 'businesses', businessId), newBusiness, { merge: true });
    insertBusinessIntoSupabase(newBusiness).catch(() => {});
    const userProfile = {
      id: uid,
      email: data.email,
      name: data.businessName,
      role: 'business_owner',
      businessId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), userProfile, { merge: true });
    await createNotificationInFirestore(regNotification);
    insertNotificationIntoSupabase(regNotification).catch(() => {});
    return { user: userProfile, business: newBusiness, notification: regNotification };
  } catch (err) {
    console.warn('Business registration Firestore notice:', err);
    return {
      user: {
        id: uid,
        email: data.email,
        name: data.businessName,
        role: 'business_owner',
        businessId
      },
      business: newBusiness,
      notification: regNotification
    };
  }
}

// ==========================================
// DIRECT IN-APP USER-TO-BUSINESS CHAT (NO WHATSAPP)
// ==========================================

export function getDeterministicConversationId(businessId: string, userId: string): string {
  const cleanBiz = businessId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanUser = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `convo_${cleanBiz}_${cleanUser}`;
}

/**
 * Send a message between a user and a business.
 * Creates or updates the conversation record and appends a message document in the messages subcollection.
 */
export async function sendMessageToBusiness(
  convoMeta: {
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
  },
  messageData: {
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'business';
    text: string;
  }
): Promise<{ conversationId: string; messageId: string }> {
  const conversationId = getDeterministicConversationId(convoMeta.businessId, convoMeta.userId);
  const now = new Date().toISOString();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const convoRef = doc(db, 'conversations', conversationId);
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);

  try {
    // 1. Fetch current conversation to preserve createdAt and compute unread counts
    const existingSnap = await getDoc(convoRef);
    const existing = existingSnap.exists() ? (existingSnap.data() as ChatConversation) : null;

    const unreadForUser =
      messageData.senderRole === 'business'
        ? (existing?.unreadCountForUser || 0) + 1
        : 0;
    const unreadForBusiness =
      messageData.senderRole === 'user'
        ? (existing?.unreadCountForBusiness || 0) + 1
        : 0;

    const conversationDoc: ChatConversation = {
      id: conversationId,
      businessId: convoMeta.businessId,
      businessName: convoMeta.businessName,
      businessLogo: convoMeta.businessLogo || existing?.businessLogo || '',
      businessPhone: convoMeta.businessPhone || existing?.businessPhone || '',
      businessCity: convoMeta.businessCity || existing?.businessCity || '',
      businessArea: convoMeta.businessArea || existing?.businessArea || '',
      businessIsOpenNow: convoMeta.businessIsOpenNow ?? existing?.businessIsOpenNow ?? true,
      userId: convoMeta.userId,
      userName: convoMeta.userName,
      userPhone: convoMeta.userPhone || existing?.userPhone || '',
      lastMessage: messageData.text,
      lastMessageTimestamp: now,
      unreadCountForUser: unreadForUser,
      unreadCountForBusiness: unreadForBusiness,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const messageDoc: ChatMessage = {
      id: messageId,
      conversationId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderRole: messageData.senderRole,
      text: messageData.text,
      timestamp: now,
      read: false,
    };

    // Use atomic batch write
    const batch = writeBatch(db);
    batch.set(convoRef, conversationDoc, { merge: true });
    batch.set(msgRef, messageDoc);
    await batch.commit();

    return { conversationId, messageId };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}`);
    throw error;
  }
}

/**
 * Real-time listener for messages in a single conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const path = `conversations/${conversationId}/messages`;
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');

  const unsubscribe = onSnapshot(
    messagesRef,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        msgs.push(docSnap.data() as ChatMessage);
      });
      // Sort chronologically ascending
      msgs.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      callback(msgs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for all conversations belonging to a user
 */
export function subscribeToUserConversations(
  userId: string,
  callback: (convos: ChatConversation[]) => void
): () => void {
  const path = 'conversations';
  const convosRef = collection(db, path);

  const unsubscribe = onSnapshot(
    convosRef,
    (snapshot) => {
      const list: ChatConversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatConversation;
        if (data.userId === userId) {
          list.push(data);
        }
      });
      // Sort most recent activity first
      list.sort(
        (a, b) =>
          new Date(b.lastMessageTimestamp || b.updatedAt).getTime() -
          new Date(a.lastMessageTimestamp || a.updatedAt).getTime()
      );
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for all conversations belonging to a business
 */
export function subscribeToBusinessConversations(
  businessId: string,
  callback: (convos: ChatConversation[]) => void
): () => void {
  const path = 'conversations';
  const convosRef = collection(db, path);

  const unsubscribe = onSnapshot(
    convosRef,
    (snapshot) => {
      const list: ChatConversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatConversation;
        if (data.businessId === businessId) {
          list.push(data);
        }
      });
      list.sort(
        (a, b) =>
          new Date(b.lastMessageTimestamp || b.updatedAt).getTime() -
          new Date(a.lastMessageTimestamp || a.updatedAt).getTime()
      );
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for all conversations on the platform (useful for merchant dashboard multi-tenant)
 */
export function subscribeToAllConversations(
  callback: (convos: ChatConversation[]) => void
): () => void {
  const path = 'conversations';
  const convosRef = collection(db, path);

  const unsubscribe = onSnapshot(
    convosRef,
    (snapshot) => {
      const list: ChatConversation[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ChatConversation);
      });
      list.sort(
        (a, b) =>
          new Date(b.lastMessageTimestamp || b.updatedAt).getTime() -
          new Date(a.lastMessageTimestamp || a.updatedAt).getTime()
      );
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Mark a conversation as read by a role (clears unreadCount)
 */
export async function markConversationAsRead(
  conversationId: string,
  readerRole: 'user' | 'business'
): Promise<void> {
  const path = `conversations/${conversationId}`;
  try {
    const convoRef = doc(db, 'conversations', conversationId);
    if (readerRole === 'user') {
      await updateDoc(convoRef, { unreadCountForUser: 0 });
    } else {
      await updateDoc(convoRef, { unreadCountForBusiness: 0 });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}


