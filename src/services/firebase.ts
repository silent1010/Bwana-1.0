import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  query,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Business,
  BusinessReview,
  VerificationRequest,
  AuditLogEntry,
  BwanaNotification
} from '../types';
import {
  INITIAL_BUSINESSES,
  INITIAL_REVIEWS,
  INITIAL_VERIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';

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

  // Suppress expected offline warnings when operating in transient network modes
  if (
    errMsg.includes('the client is offline') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('Could not reach Cloud Firestore')
  ) {
    // Normal offline behavior in preview environment; silent recovery
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
    // In sandboxed or offline environments, Firestore may throw unavailable / offline
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

// Automatically test connection on module load with silent catch handler
testConnection().catch(() => {
  // Silent fallback to local storage / memory mode
});

// ============================================================================
// REAL-TIME DATA SERVICES & SEEDING
// ============================================================================

/**
 * Real-time listener for businesses
 * If database is empty, automatically seeds with initial verified businesses
 */
export function subscribeToBusinesses(callback: (businesses: Business[]) => void): () => void {
  const pathForOnSnapshot = 'businesses';
  const businessesRef = collection(db, pathForOnSnapshot);

  const unsubscribe = onSnapshot(
    businessesRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial businesses to Firestore so the real-time database is populated
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
        callback(INITIAL_BUSINESSES);
      } else {
        const list: Business[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Business);
        });
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, pathForOnSnapshot);
      callback(INITIAL_BUSINESSES);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for reviews
 */
export function subscribeToReviews(callback: (reviews: BusinessReview[]) => void): () => void {
  const pathForOnSnapshot = 'reviews';
  const reviewsRef = collection(db, pathForOnSnapshot);

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
      handleFirestoreError(err, OperationType.LIST, pathForOnSnapshot);
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
  const pathForOnSnapshot = 'verifications';
  const verificationsRef = collection(db, pathForOnSnapshot);

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
      handleFirestoreError(err, OperationType.LIST, pathForOnSnapshot);
      callback(INITIAL_VERIFICATIONS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time listener for audit logs
 */
export function subscribeToAuditLogs(callback: (logs: AuditLogEntry[]) => void): () => void {
  const pathForOnSnapshot = 'auditLogs';
  const logsRef = collection(db, pathForOnSnapshot);

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
        // Sort descending by timestamp
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        callback(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, pathForOnSnapshot);
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
  const pathForOnSnapshot = 'notifications';
  const notifsRef = collection(db, pathForOnSnapshot);

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
      handleFirestoreError(err, OperationType.LIST, pathForOnSnapshot);
      callback(INITIAL_NOTIFICATIONS);
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

export async function createReviewInFirestore(review: BusinessReview): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    const docRef = doc(db, 'reviews', review.id);
    await setDoc(docRef, review);

    // Update business review count and average rating
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
