
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

type StarData = {
  name: string;
  genre: string[];
  avatar?: string;
};

export function addStar(firestore: Firestore, data: StarData) {
  const starsCollection = collection(firestore, 'stars');
  return addDoc(starsCollection, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: starsCollection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export function updateStar(
  firestore: Firestore,
  starId: string,
  data: Partial<StarData>
) {
  const starDocRef = doc(firestore, 'stars', starId);
  return updateDoc(starDocRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: starDocRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export function deleteStar(firestore: Firestore, starId: string) {
    const starDocRef = doc(firestore, 'stars', starId);
    return deleteDoc(starDocRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: starDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
