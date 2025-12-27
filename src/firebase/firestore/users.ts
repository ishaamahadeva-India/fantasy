
'use client';

import { doc, updateDoc, getDoc, increment, arrayUnion, arrayRemove, serverTimestamp, type Firestore } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createPointTransaction } from './point-transactions';

/**
 * Updates a user's points in their profile document.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to update.
 * @param points - The number of points to add (can be negative).
 * @param description - Description for the transaction (optional).
 * @param metadata - Additional metadata for the transaction (optional).
 * @param allowNegative - Allow negative balance (default: false, except for negative marking in campaigns).
 */
export async function updateUserPoints(
  firestore: Firestore, 
  userId: string, 
  points: number,
  description?: string,
  metadata?: { type?: string; [key: string]: any },
  allowNegative: boolean = false
): Promise<void> {
  const userDocRef = doc(firestore, 'users', userId);

  // Get current balance to calculate balance after
  let currentBalance = 0;
  let balanceAfter = points;
  try {
    const userDoc = await getDoc(userDocRef);
    currentBalance = userDoc.data()?.points || 0;
    balanceAfter = currentBalance + points;
  } catch (error) {
    console.error('Error fetching current balance:', error);
    // Continue without balance tracking if fetch fails
  }

  // Validate: Prevent negative balance unless explicitly allowed
  // Negative marking in campaigns is allowed (metadata.type === 'campaign_earned' with negative points)
  const isNegativeMarking = metadata?.type === 'campaign_earned' && points < 0;
  const shouldAllowNegative = allowNegative || isNegativeMarking;

  if (!shouldAllowNegative && balanceAfter < 0) {
    throw new Error(`Insufficient points. Current balance: ${currentBalance}, Required: ${Math.abs(points)}`);
  }

  const updateData = {
    points: increment(points)
  };

  try {
    await updateDoc(userDocRef, updateData);

    // Create transaction record if description provided
    if (description) {
      const transactionType = metadata?.type as any || (points > 0 ? 'campaign_earned' : 'redemption');
      await createPointTransaction(
        firestore,
        userId,
        transactionType,
        points,
        balanceAfter,
        description,
        metadata
      ).catch(error => {
        // Don't fail the update if transaction logging fails
        console.error('Failed to log point transaction:', error);
      });
    }
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'update',
      requestResourceData: updateData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  }
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
