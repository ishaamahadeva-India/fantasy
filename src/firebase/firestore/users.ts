'use client';

import { doc, updateDoc, increment, type Firestore } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Updates a user's points in their profile document.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to update.
 * @param points - The number of points to add (can be negative).
 */
export function updateUserPoints(firestore: Firestore, userId: string, points: number) {
  const userDocRef = doc(firestore, 'users', userId);

  const updateData = {
    points: increment(points)
  };

  updateDoc(userDocRef, updateData)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}
