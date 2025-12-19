'use client';

import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { FanRating } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useRatings() {
  const firestore = useFirestore();

  if (!firestore) {
    return { saveFanRating: async () => {} };
  }

  const ratingsCollection = collection(firestore, 'ratings');

  const saveFanRating = async (
    rating: Omit<FanRating, 'createdAt' | 'userId'>,
    userId: string
  ) => {
    if (!firestore) {
      console.error('Firestore is not initialized.');
      return;
    }
    const docToSave = {
      ...rating,
      userId,
      createdAt: serverTimestamp(),
    };

    addDoc(ratingsCollection, docToSave)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: ratingsCollection.path,
            operation: 'create',
            requestResourceData: docToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return { saveFanRating };
}
