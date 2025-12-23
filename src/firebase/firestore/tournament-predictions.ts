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

// Helper function to remove undefined values from an object
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined and null values
    if (value === undefined || value === null) {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned as Partial<T>;
}

/**
 * Creates a new tournament prediction
 */
export async function addTournamentPrediction(
  firestore: Firestore,
  predictionData: NewTournamentPrediction
) {
  const predictionsCollection = collection(firestore, 'tournament-predictions');
  
  // Build document with only defined values
  const docToSave: any = {
    userId: predictionData.userId,
    tournamentId: predictionData.tournamentId,
    eventId: predictionData.eventId,
    eventType: predictionData.eventType,
    prediction: predictionData.prediction,
    points: predictionData.points,
    status: predictionData.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Only include optional fields if they have values
  if (predictionData.notes !== undefined && predictionData.notes !== null && predictionData.notes.trim() !== '') {
    docToSave.notes = predictionData.notes.trim();
  }
  if (predictionData.score !== undefined && predictionData.score !== null) {
    docToSave.score = predictionData.score;
  }

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
  
  // Build update object with only defined values
  const updateData: any = {
    updatedAt: serverTimestamp(),
  };
  
  // Only include fields that are actually provided and not undefined/null
  if (predictionData.prediction !== undefined) {
    updateData.prediction = predictionData.prediction;
  }
  if (predictionData.status !== undefined) {
    updateData.status = predictionData.status;
  }
  if (predictionData.score !== undefined && predictionData.score !== null) {
    updateData.score = predictionData.score;
  }
  
  // Handle notes - only include if provided and not empty
  if (predictionData.notes !== undefined) {
    if (predictionData.notes !== null && predictionData.notes.trim() !== '') {
      updateData.notes = predictionData.notes.trim();
    } else {
      // Explicitly remove notes if set to empty/null
      updateData.notes = null;
    }
  }

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

