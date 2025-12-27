
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
import { updateUserPoints } from './users';

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

    try {
      await addDoc(ratingsCollection, docToSave);
      // Award points for submitting a rating
      await updateUserPoints(
        firestore,
        userId,
        25,
        'Points earned for submitting rating',
        {
          type: 'rating_submitted',
          ratingType: 'attribute_rating',
        }
      );
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: ratingsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  return { saveFanRating };
}
