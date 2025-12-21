'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type TournamentEntry = {
  id?: string;
  userId: string;
  tournamentId: string;
  entryFee?: number;
  entryFeeTier?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'upi' | 'bank' | 'wallet';
  joinedAt: Date;
  city?: string;
  state?: string;
};

type NewTournamentEntry = Omit<TournamentEntry, 'id' | 'joinedAt'>;

/**
 * Creates a new tournament entry (user participation)
 */
export async function addTournamentEntry(
  firestore: Firestore,
  entryData: NewTournamentEntry
) {
  const entriesCollection = collection(firestore, 'tournament-entries');
  const docToSave = {
    ...entryData,
    joinedAt: serverTimestamp(),
  };

  return addDoc(entriesCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: entriesCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates a tournament entry (e.g., payment status)
 */
export async function updateTournamentEntry(
  firestore: Firestore,
  entryId: string,
  entryData: Partial<NewTournamentEntry>
) {
  const entryDocRef = doc(firestore, 'tournament-entries', entryId);
  return updateDoc(entryDocRef, entryData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: entryDocRef.path,
        operation: 'update',
        requestResourceData: entryData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets user's entry for a tournament
 */
export async function getUserTournamentEntry(
  firestore: Firestore,
  tournamentId: string,
  userId: string
): Promise<TournamentEntry | null> {
  const entriesCollection = collection(firestore, 'tournament-entries');
  const q = query(
    entriesCollection,
    where('tournamentId', '==', tournamentId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as unknown as TournamentEntry;
}

/**
 * Gets all entries for a tournament
 */
export async function getTournamentEntries(
  firestore: Firestore,
  tournamentId: string
): Promise<TournamentEntry[]> {
  const entriesCollection = collection(firestore, 'tournament-entries');
  const q = query(entriesCollection, where('tournamentId', '==', tournamentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as TournamentEntry));
}

