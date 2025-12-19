
'use client';

import { doc, updateDoc, increment, arrayUnion, arrayRemove, type Firestore } from "firebase/firestore";
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


/**
 * Adds or removes a movie from a user's watchlist.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user.
 * @param movieId - The ID of the movie to add or remove.
 * @param shouldRemove - Whether to remove the movie instead of adding it.
 */
export function updateWatchlist(firestore: Firestore, userId: string, movieId: string, shouldRemove = false) {
    const userDocRef = doc(firestore, 'users', userId);
    
    const updateData = {
        watchlist: shouldRemove ? arrayRemove(movieId) : arrayUnion(movieId)
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


/**
 * Updates a user's fantasy-related settings in their profile.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to update.
 * @param settings - The settings to update.
 */
export function updateUserFantasySettings(firestore: Firestore, userId: string, settings: { ageVerified?: boolean; fantasyEnabled?: boolean; }) {
    const userDocRef = doc(firestore, 'users', userId);

    const updateData: Record<string, any> = {};
    if (settings.ageVerified !== undefined) {
        updateData.ageVerified = settings.ageVerified;
    }
    if (settings.fantasyEnabled !== undefined) {
        updateData.fantasyEnabled = settings.fantasyEnabled;
    }

    if(Object.keys(updateData).length === 0) return;

    updateDoc(userDocRef, updateData, { merge: true })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
}

/**
 * Updates the admin status of a user.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to update.
 * @param isAdmin - The new admin status.
 */
export function updateUserAdminStatus(firestore: Firestore, userId: string, isAdmin: boolean) {
    const userDocRef = doc(firestore, 'users', userId);
    const updateData = { isAdmin };

    return updateDoc(userDocRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // Re-throw to be caught by the caller
        });
}
