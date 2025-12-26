'use client';

import { collection, query, where, getDocs, doc, updateDoc, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Checks if a username is available (unique)
 * @param firestore - The Firestore instance
 * @param username - The username to check
 * @param excludeUserId - Optional user ID to exclude from check (for updating own username)
 * @returns Promise<boolean> - true if username is available, false if taken
 */
export async function isUsernameAvailable(
  firestore: Firestore,
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  try {
    // Normalize username (lowercase, trim)
    const normalizedUsername = username.toLowerCase().trim();
    
    if (!normalizedUsername || normalizedUsername.length < 3) {
      return false; // Username too short
    }

    // Check if username matches allowed pattern (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedUsername)) {
      return false; // Invalid characters
    }

    // Query users collection for this username
    const usersRef = collection(firestore, 'users');
    const usernameQuery = query(usersRef, where('username', '==', normalizedUsername));
    const snapshot = await getDocs(usernameQuery);

    // If checking for update, exclude current user
    if (excludeUserId) {
      const matchingDocs = snapshot.docs.filter(doc => doc.id !== excludeUserId);
      return matchingDocs.length === 0;
    }

    return snapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    // On error, assume unavailable to be safe
    return false;
  }
}

/**
 * Updates a user's profile information
 * @param firestore - The Firestore instance
 * @param userId - The user ID
 * @param updates - The fields to update
 */
export async function updateUserProfile(
  firestore: Firestore,
  userId: string,
  updates: {
    username?: string;
    realName?: string;
    phoneNumber?: string;
    displayName?: string;
    city?: string;
    state?: string;
  }
): Promise<void> {
  const userDocRef = doc(firestore, 'users', userId);
  
  // If updating username, check availability first
  if (updates.username !== undefined) {
    const normalizedUsername = updates.username.toLowerCase().trim();
    
    // Validate username format
    if (normalizedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedUsername)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    // Check availability
    const isAvailable = await isUsernameAvailable(firestore, normalizedUsername, userId);
    if (!isAvailable) {
      throw new Error('Username is already taken. Please choose another one.');
    }
    
    // Use normalized username
    updates.username = normalizedUsername;
  }

  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(cleanUpdates).length === 0) {
    return; // Nothing to update
  }

  try {
    await updateDoc(userDocRef, cleanUpdates);
  } catch (serverError: any) {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'update',
      requestResourceData: cleanUpdates,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  }
}

