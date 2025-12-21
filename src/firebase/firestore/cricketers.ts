'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type CricketerData = {
  name: string;
  country: string;
  roles: string[];
  avatarUrl?: string;
};

/**
 * Adds a new cricketer to the 'cricketers' collection.
 * @param firestore - The Firestore instance.
 * @param data - The data for the new cricketer.
 */
export function addCricketer(firestore: Firestore, data: CricketerData) {
  const cricketersCollection = collection(firestore, 'cricketers');
  return addDoc(cricketersCollection, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: cricketersCollection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError; // Re-throw to be caught by the caller
  });
}

/**
 * Updates an existing cricketer in the 'cricketers' collection.
 * @param firestore - The Firestore instance.
 * @param cricketerId - The ID of the cricketer to update.
 * @param data - The data to update.
 */
export function updateCricketer(
  firestore: Firestore,
  cricketerId: string,
  data: Partial<CricketerData>
) {
  const cricketerDocRef = doc(firestore, 'cricketers', cricketerId);
  return updateDoc(cricketerDocRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: cricketerDocRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError; // Re-throw to be caught by the caller
  });
}

/**
 * Deletes a cricketer from the 'cricketers' collection.
 * @param firestore - The Firestore instance.
 * @param cricketerId - The ID of the cricketer to delete.
 */
export function deleteCricketer(firestore: Firestore, cricketerId: string) {
    const cricketerDocRef = doc(firestore, 'cricketers', cricketerId);
    return deleteDoc(cricketerDocRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: cricketerDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
