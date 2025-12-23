'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { ImageAdSponsor } from '@/lib/types';

type NewImageAdSponsor = Omit<ImageAdSponsor, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Creates a new ad sponsor
 */
export function createImageAdSponsor(
  firestore: Firestore,
  sponsorData: NewImageAdSponsor
) {
  const sponsorsCollection = collection(firestore, 'image-ad-sponsors');
  const docToSave = {
    ...sponsorData,
    totalSpent: 0,
    totalViews: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(sponsorsCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: sponsorsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing ad sponsor
 */
export function updateImageAdSponsor(
  firestore: Firestore,
  sponsorId: string,
  sponsorData: Partial<NewImageAdSponsor>
) {
  const sponsorDocRef = doc(firestore, 'image-ad-sponsors', sponsorId);
  const docToUpdate = {
    ...sponsorData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(sponsorDocRef, docToUpdate)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: sponsorDocRef.path,
        operation: 'update',
        requestResourceData: docToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes an ad sponsor
 */
export function deleteImageAdSponsor(
  firestore: Firestore,
  sponsorId: string
) {
  const sponsorDocRef = doc(firestore, 'image-ad-sponsors', sponsorId);
  return deleteDoc(sponsorDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: sponsorDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets all sponsors
 */
export async function getAllImageAdSponsors(
  firestore: Firestore
): Promise<ImageAdSponsor[]> {
  const sponsorsCollection = collection(firestore, 'image-ad-sponsors');
  const snapshot = await getDocs(sponsorsCollection);
  const sponsors: ImageAdSponsor[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    sponsors.push({
      id: docSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      contractStartDate: data.contractStartDate?.toDate(),
      contractEndDate: data.contractEndDate?.toDate(),
    } as ImageAdSponsor);
  });

  return sponsors;
}

