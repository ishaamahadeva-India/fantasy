'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type Performance = {
  id?: string;
  starId: string;
  movieId: string;
  role: string; // Character name or role description
  performanceRating?: number; // 1-10 rating
  awards?: string[]; // Awards won for this performance
  notes?: string; // Additional notes about the performance
  year: number; // Year of the movie release
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
};

type NewPerformance = Omit<Performance, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Adds a new performance
 */
export async function addPerformance(firestore: Firestore, performanceData: NewPerformance) {
  const performancesCollection = collection(firestore, 'performances');
  const docToSave = {
    ...performanceData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(performancesCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: performancesCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates a performance
 */
export async function updatePerformance(
  firestore: Firestore,
  performanceId: string,
  performanceData: Partial<NewPerformance>
) {
  const performanceDocRef = doc(firestore, 'performances', performanceId);
  const updateData = {
    ...performanceData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(performanceDocRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: performanceDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes a performance
 */
export async function deletePerformance(firestore: Firestore, performanceId: string) {
  const performanceDocRef = doc(firestore, 'performances', performanceId);
  return deleteDoc(performanceDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: performanceDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets all performances for a star
 */
export async function getStarPerformances(firestore: Firestore, starId: string) {
  const performancesCollection = collection(firestore, 'performances');
  const q = query(performancesCollection, where('starId', '==', starId));
  const snapshot = await getDocs(q);
  return (snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Performance[])
    .sort((a, b) => (b.year || 0) - (a.year || 0)); // Sort by year descending
}

/**
 * Gets all performances for a movie
 */
export async function getMoviePerformances(firestore: Firestore, movieId: string) {
  const performancesCollection = collection(firestore, 'performances');
  const q = query(performancesCollection, where('movieId', '==', movieId));
  const snapshot = await getDocs(q);
  return (snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Performance[])
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Gets top performances (by rating)
 */
export async function getTopPerformances(firestore: Firestore, limit: number = 10) {
  const performancesCollection = collection(firestore, 'performances');
  const snapshot = await getDocs(performancesCollection);
  const allPerformances = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Performance[];
  
  return allPerformances
    .filter(p => p.performanceRating)
    .sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0))
    .slice(0, limit);
}

