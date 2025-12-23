'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  type Firestore,
  type Query,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { ImageAdvertisement } from '@/lib/types';

type NewImageAdvertisement = Omit<ImageAdvertisement, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Creates a new image advertisement
 */
export function createImageAdvertisement(
  firestore: Firestore,
  adData: NewImageAdvertisement
) {
  const adsCollection = collection(firestore, 'image-advertisements');
  const docToSave = {
    ...adData,
    currentViews: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(adsCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: adsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing image advertisement
 */
export function updateImageAdvertisement(
  firestore: Firestore,
  adId: string,
  adData: Partial<NewImageAdvertisement>
) {
  const adDocRef = doc(firestore, 'image-advertisements', adId);
  const docToUpdate = {
    ...adData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(adDocRef, docToUpdate)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: adDocRef.path,
        operation: 'update',
        requestResourceData: docToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes an image advertisement
 */
export function deleteImageAdvertisement(
  firestore: Firestore,
  adId: string
) {
  const adDocRef = doc(firestore, 'image-advertisements', adId);
  return deleteDoc(adDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: adDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets active advertisements for a tournament
 */
export async function getActiveAdsForTournament(
  firestore: Firestore,
  tournamentId: string
): Promise<ImageAdvertisement[]> {
  const adsCollection = collection(firestore, 'image-advertisements');
  const now = new Date();
  
  const q = query(
    adsCollection,
    where('status', '==', 'active'),
    where('startDate', '<=', now),
    where('endDate', '>=', now)
  );

  const snapshot = await getDocs(q);
  const ads: ImageAdvertisement[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    // Check if ad targets this tournament
    if (
      !data.targetTournaments ||
      data.targetTournaments.length === 0 ||
      data.targetTournaments.includes(tournamentId)
    ) {
      // Check view limits
      if (!data.maxViews || data.currentViews < data.maxViews) {
        ads.push({
          id: docSnapshot.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ImageAdvertisement);
      }
    }
  });

  // Sort by priority (highest first)
  ads.sort((a, b) => b.priority - a.priority);

  return ads;
}

/**
 * Selects the best ad for a user/tournament combination
 */
export async function selectAdForEntry(
  firestore: Firestore,
  tournamentId: string,
  userId: string
): Promise<ImageAdvertisement | null> {
  const activeAds = await getActiveAdsForTournament(firestore, tournamentId);
  
  if (activeAds.length === 0) {
    return null;
  }

  // Filter by user eligibility
  const eligibleAds = activeAds.filter((ad) => {
    // Check per-user view limit
    if (ad.maxViewsPerUser) {
      // This will be checked when creating the view
      // For now, we'll filter in the view creation function
    }
    return true;
  });

  // Return highest priority ad
  return eligibleAds[0] || null;
}

/**
 * Increments the view count for an advertisement
 */
export function incrementAdViews(
  firestore: Firestore,
  adId: string
) {
  const adDocRef = doc(firestore, 'image-advertisements', adId);
  return updateDoc(adDocRef, {
    currentViews: increment(1),
    updatedAt: serverTimestamp(),
  });
}

