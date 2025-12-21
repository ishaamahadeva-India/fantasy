'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Advertisement, AdvertisementPosition } from '@/lib/types';

// Type for a new advertisement, before it's saved
type NewAdvertisement = {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  position: AdvertisementPosition;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
};

/**
 * Adds a new advertisement to the 'advertisements' collection.
 */
export function addAdvertisement(firestore: Firestore, adData: NewAdvertisement) {
  const adsCollection = collection(firestore, 'advertisements');
  const docToSave = {
    ...adData,
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
 * Updates an existing advertisement.
 */
export function updateAdvertisement(
  firestore: Firestore,
  adId: string,
  adData: Partial<NewAdvertisement>
) {
  const adDocRef = doc(firestore, 'advertisements', adId);
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
 * Deletes an advertisement.
 */
export function deleteAdvertisement(firestore: Firestore, adId: string) {
  const adDocRef = doc(firestore, 'advertisements', adId);
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
 * Gets all advertisement positions
 */
export const AD_POSITIONS: { value: AdvertisementPosition; label: string; description: string }[] = [
  { value: 'home-banner-top', label: 'Home - Top Banner', description: 'Top banner on home page' },
  { value: 'home-sidebar-sponsored', label: 'Home - Sidebar Sponsored', description: 'Sidebar sponsored card on home page' },
  { value: 'home-article-between', label: 'Home - Between Articles', description: 'Banner between articles on home page' },
  { value: 'article-top', label: 'Article - Top', description: 'Top of article pages' },
  { value: 'article-sidebar', label: 'Article - Sidebar', description: 'Sidebar in article pages' },
  { value: 'fantasy-banner', label: 'Fantasy - Banner', description: 'Banner in fantasy pages' },
  { value: 'profile-sidebar', label: 'Profile - Sidebar', description: 'Sidebar in profile page' },
  { value: 'quiz-banner', label: 'Quiz - Banner', description: 'Banner in quiz pages' },
];

