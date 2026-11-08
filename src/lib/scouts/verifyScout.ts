/**
 * Bwana Scouts Bounty & Anti-Fraud Verification Engine
 * Rules:
 * 1. Photo evidence must be provided (shop facade, signboard, or interior).
 * 2. GPS accuracy: Lat/Lng must be within valid Zambian coordinates.
 * 3. Deduplication (ST_DWithin equivalent): Must not exist within 20 meters of another registered business.
 * 4. Bounty: Exactly ZMW 20 paid to verified scout upon passing all 3 rules.
 */

import { Business, LocationCoordinates } from '../../types';
import { calculateDistanceKm } from '../../data/geoHierarchy';

export interface ScoutSubmission {
  shopName: string;
  ownerName: string;
  phone: string;
  category: string;
  compound: string;
  city: string;
  coordinates: LocationCoordinates;
  photoUrl?: string;
  scoutName: string;
  scoutId: string;
}

export interface ScoutVerificationResult {
  isApproved: boolean;
  bountyZMW: number;
  rejectionReason?: string;
  checks: {
    photoClear: boolean;
    gpsAccurate: boolean;
    noDuplicateWithin20m: boolean;
  };
  nearestDuplicateDistanceMeters?: number;
  conflictingBusinessName?: string;
}

export function verifyScoutOnboarding(
  submission: ScoutSubmission,
  existingBusinesses: Business[]
): ScoutVerificationResult {
  // Check 1: Photo uploaded and clear
  const photoClear = Boolean(submission.photoUrl && submission.photoUrl.trim().length > 5);

  // Check 2: GPS coordinate validity (Zambia is approximately lat -8 to -18, lng 21 to 34)
  const { latitude, longitude } = submission.coordinates || {};
  const gpsAccurate = Boolean(
    latitude !== undefined &&
    longitude !== undefined &&
    latitude >= -18.5 &&
    latitude <= -8.0 &&
    longitude >= 21.5 &&
    longitude <= 34.0
  );

  // Check 3: Distance deduplication (within 20 meters = 0.02 km)
  let nearestDuplicateDistanceMeters: number | undefined;
  let conflictingBusinessName: string | undefined;
  let noDuplicateWithin20m = true;

  for (const biz of existingBusinesses) {
    const distKm = calculateDistanceKm(
      submission.coordinates.latitude,
      submission.coordinates.longitude,
      biz.coordinates.latitude,
      biz.coordinates.longitude
    );
    const distMeters = Math.round(distKm * 1000);

    if (distMeters <= 20) {
      noDuplicateWithin20m = false;
      nearestDuplicateDistanceMeters = distMeters;
      conflictingBusinessName = biz.name;
      break;
    }
  }

  // Determine approval & bounty
  const isApproved = photoClear && gpsAccurate && noDuplicateWithin20m;
  const bountyZMW = isApproved ? 20 : 0;

  let rejectionReason: string | undefined;
  if (!photoClear) {
    rejectionReason = 'Missing clear storefront or stall verification photo.';
  } else if (!gpsAccurate) {
    rejectionReason = 'GPS coordinates are invalid or outside Zambian boundaries.';
  } else if (!noDuplicateWithin20m) {
    rejectionReason = `Duplicate detected within ${nearestDuplicateDistanceMeters}m of "${conflictingBusinessName}".`;
  }

  return {
    isApproved,
    bountyZMW,
    rejectionReason,
    checks: {
      photoClear,
      gpsAccurate,
      noDuplicateWithin20m,
    },
    nearestDuplicateDistanceMeters,
    conflictingBusinessName,
  };
}
