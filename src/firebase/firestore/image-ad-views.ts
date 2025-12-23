'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { ImageAdView } from '@/lib/types';

type NewImageAdView = Omit<ImageAdView, 'id'>;

/**
 * Creates a new ad view record
 */
export function createImageAdView(
  firestore: Firestore,
  viewData: NewImageAdView
) {
  const viewsCollection = collection(firestore, 'image-ad-views');
  const docToSave = {
    ...viewData,
    viewedAt: serverTimestamp(),
    wasCompleted: false,
    clicked: false,
  };

  return addDoc(viewsCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: viewsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates ad view progress
 */
export function updateImageAdViewProgress(
  firestore: Firestore,
  viewId: string,
  progress: {
    viewedDuration: number;
    wasCompleted: boolean;
  }
) {
  const viewDocRef = doc(firestore, 'image-ad-views', viewId);
  const updateData = {
    viewedDuration: progress.viewedDuration,
    wasCompleted: progress.wasCompleted,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(viewDocRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: viewDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Marks ad view as completed
 */
export function completeImageAdView(
  firestore: Firestore,
  viewId: string
) {
  const viewDocRef = doc(firestore, 'image-ad-views', viewId);
  return updateDoc(viewDocRef, {
    wasCompleted: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Tracks click-through on ad
 */
export function trackImageAdClick(
  firestore: Firestore,
  viewId: string,
  clickThroughUrl: string
) {
  const viewDocRef = doc(firestore, 'image-ad-views', viewId);
  return updateDoc(viewDocRef, {
    clicked: true,
    clickedAt: serverTimestamp(),
    clickThroughUrl,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Checks if user has viewed an ad for a tournament
 */
export async function hasUserViewedAd(
  firestore: Firestore,
  userId: string,
  tournamentId: string,
  advertisementId?: string
): Promise<boolean> {
  const viewsCollection = collection(firestore, 'image-ad-views');
  let q;

  if (advertisementId) {
    q = query(
      viewsCollection,
      where('userId', '==', userId),
      where('tournamentId', '==', tournamentId),
      where('advertisementId', '==', advertisementId),
      where('wasCompleted', '==', true)
    );
  } else {
    q = query(
      viewsCollection,
      where('userId', '==', userId),
      where('tournamentId', '==', tournamentId),
      where('wasCompleted', '==', true)
    );
  }

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Gets user's ad views for an advertisement
 */
export async function getUserAdViews(
  firestore: Firestore,
  userId: string,
  advertisementId: string
): Promise<ImageAdView[]> {
  const viewsCollection = collection(firestore, 'image-ad-views');
  const q = query(
    viewsCollection,
    where('userId', '==', userId),
    where('advertisementId', '==', advertisementId)
  );

  const snapshot = await getDocs(q);
  const views: ImageAdView[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    views.push({
      id: docSnapshot.id,
      ...data,
      viewedAt: data.viewedAt?.toDate() || new Date(),
      clickedAt: data.clickedAt?.toDate(),
    } as ImageAdView);
  });

  return views;
}

