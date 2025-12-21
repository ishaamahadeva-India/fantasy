
'use client';

import { doc, updateDoc, increment, arrayUnion, arrayRemove, serverTimestamp, type Firestore } from "firebase/firestore";
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

/**
 * Bans a user (permanently or temporarily)
 * @param firestore - The Firestore instance
 * @param userId - The ID of the user to ban
 * @param banReason - Reason for the ban
 * @param permanent - Whether the ban is permanent
 * @param banExpiresAt - Expiration date for temporary bans (optional)
 */
export async function banUser(
    firestore: Firestore,
    userId: string,
    banReason: string,
    permanent: boolean = false,
    banExpiresAt?: Date
) {
    const userDocRef = doc(firestore, 'users', userId);
    const updateData: Record<string, any> = {
        isBanned: true,
        banReason,
        bannedAt: serverTimestamp(),
    };

    if (permanent) {
        // Permanent ban - no expiration
        updateData.banExpiresAt = null;
    } else if (banExpiresAt) {
        updateData.banExpiresAt = banExpiresAt;
    } else {
        // Default temporary ban: 30 days
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 30);
        updateData.banExpiresAt = defaultExpiry;
    }

    return updateDoc(userDocRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}

/**
 * Unbans a user
 * @param firestore - The Firestore instance
 * @param userId - The ID of the user to unban
 */
export async function unbanUser(firestore: Firestore, userId: string) {
    const userDocRef = doc(firestore, 'users', userId);
    const updateData = {
        isBanned: false,
        banReason: null,
        banExpiresAt: null,
        bannedAt: null,
    };

    return updateDoc(userDocRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}

/**
 * Resolves a fraud flag
 * @param firestore - The Firestore instance
 * @param flagId - The ID of the fraud flag
 * @param resolvedBy - The admin user ID who resolved it
 * @param resolutionNotes - Optional notes about the resolution
 */
export async function resolveFraudFlag(
    firestore: Firestore,
    flagId: string,
    resolvedBy: string,
    resolutionNotes?: string
) {
    const flagDocRef = doc(firestore, 'fraud-flags', flagId);
    const updateData = {
        resolved: true,
        resolvedAt: serverTimestamp(),
        resolvedBy,
        resolutionNotes: resolutionNotes || '',
    };

    return updateDoc(flagDocRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: flagDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
