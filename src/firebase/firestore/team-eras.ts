'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type TeamEra = {
  id?: string;
  teamId: string;
  eraName: string; // e.g., "2000s", "2010s", "2020s"
  startYear: number;
  endYear: number;
  winRate: number; // Percentage
  iccTrophies: number;
  keyPlayers: string[]; // Array of player names
  definingMoment: string; // Description of the era's defining achievement
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
};

type NewTeamEra = Omit<TeamEra, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Adds a new team era
 */
export async function addTeamEra(firestore: Firestore, eraData: NewTeamEra) {
  const erasCollection = collection(firestore, 'team-eras');
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
 * Updates a team era
 */
export async function updateTeamEra(
  firestore: Firestore,
  eraId: string,
  eraData: Partial<NewTeamEra>
) {
  const eraDocRef = doc(firestore, 'team-eras', eraId);
  const updateData = {
    ...eraData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(eraDocRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eraDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes a team era
 */
export async function deleteTeamEra(firestore: Firestore, eraId: string) {
  const eraDocRef = doc(firestore, 'team-eras', eraId);
  return deleteDoc(eraDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eraDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets all eras for a team
 */
export async function getTeamEras(firestore: Firestore, teamId: string) {
  const erasCollection = collection(firestore, 'team-eras');
  const snapshot = await getDocs(erasCollection);
  const allEras = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TeamEra[];
  
  // Filter by teamId and sort by order
  return allEras
    .filter(era => era.teamId === teamId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

