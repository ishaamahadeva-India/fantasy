
'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { UserPrediction } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function usePredictions() {
  const firestore = useFirestore();

  const saveUserPrediction = async (
    prediction: Omit<UserPrediction, 'createdAt' | 'userId' | 'score'>,
    userId: string
  ) => {
    if (!firestore) {
      console.error('Firestore is not initialized.');
      return;
    }

    const predictionsCollection = collection(firestore, 'user-predictions');

    const docToSave = {
      ...prediction,
      userId,
      createdAt: serverTimestamp(),
    };

    addDoc(predictionsCollection, docToSave).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: predictionsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return { saveUserPrediction };
}
