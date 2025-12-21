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

export type StarEra = {
  id?: string;
  starId: string;
  eraName: string; // e.g., "Early Career", "Peak Years", "Recent Work"
  startYear: number;
  endYear?: number; // null for ongoing eras
  averageRating: number; // Average performance rating
  notableMovies: string[]; // Array of movie IDs
  definingRole?: string; // Most notable role in this era
  awards?: string[]; // Awards won during this era
  notes?: string; // Description of the era
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
};

type NewStarEra = Omit<StarEra, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Adds a new star era
 */
export async function addStarEra(firestore: Firestore, eraData: NewStarEra) {
  const erasCollection = collection(firestore, 'star-eras');
  const docToSave = {
    ...eraData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(erasCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: erasCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets all eras for a star
 */
export async function getStarEras(firestore: Firestore, starId: string) {
  const erasCollection = collection(firestore, 'star-eras');
  const q = query(erasCollection, where('starId', '==', starId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StarEra[]
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

