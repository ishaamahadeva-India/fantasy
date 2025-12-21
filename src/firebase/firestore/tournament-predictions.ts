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

export type TournamentPrediction = {
  id?: string;
  userId: string;
  tournamentId: string;
  eventId: string;
  eventType: string;
  prediction: string | string[]; // Single or multi-select
  notes?: string;
  points: number;
  status: 'pending' | 'correct' | 'incorrect' | 'partial';
  score?: number;
  createdAt: Date;
  updatedAt: Date;
};

type NewTournamentPrediction = Omit<TournamentPrediction, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Creates a new tournament prediction
 */
export async function addTournamentPrediction(
  firestore: Firestore,
  predictionData: NewTournamentPrediction
) {
  const predictionsCollection = collection(firestore, 'tournament-predictions');
  const docToSave = {
    ...predictionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(predictionsCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: predictionsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing tournament prediction
 */
export async function updateTournamentPrediction(
  firestore: Firestore,
  predictionId: string,
  predictionData: Partial<NewTournamentPrediction>
) {
  const predictionDocRef = doc(firestore, 'tournament-predictions', predictionId);
  const updateData = {
    ...predictionData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(predictionDocRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: predictionDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets user's prediction for a specific event
 */
export async function getUserTournamentPrediction(
  firestore: Firestore,
  userId: string,
  tournamentId: string,
  eventId: string
): Promise<TournamentPrediction | null> {
  const predictionsCollection = collection(firestore, 'tournament-predictions');
  const q = query(
    predictionsCollection,
    where('userId', '==', userId),
    where('tournamentId', '==', tournamentId),
    where('eventId', '==', eventId)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as TournamentPrediction;
}

/**
 * Gets all predictions for a tournament
 */
export async function getTournamentPredictions(
  firestore: Firestore,
  tournamentId: string
): Promise<TournamentPrediction[]> {
  const predictionsCollection = collection(firestore, 'tournament-predictions');
  const q = query(predictionsCollection, where('tournamentId', '==', tournamentId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TournamentPrediction[];
}

