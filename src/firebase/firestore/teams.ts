
'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type TeamData = {
  name: string;
  type: 'ip' | 'national';
  logoUrl?: string;
};

/**
 * Adds a new team to the 'teams' collection.
 * @param firestore - The Firestore instance.
 * @param data - The data for the new team.
 */
export function addTeam(firestore: Firestore, data: TeamData) {
  const teamsCollection = collection(firestore, 'teams');
  return addDoc(teamsCollection, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: teamsCollection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

/**
 * Updates an existing team in the 'teams' collection.
 * @param firestore - The Firestore instance.
 * @param teamId - The ID of the team to update.
 * @param data - The data to update.
 */
export function updateTeam(
  firestore: Firestore,
  teamId: string,
  data: Partial<TeamData>
) {
  const teamDocRef = doc(firestore, 'teams', teamId);
  return updateDoc(teamDocRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: teamDocRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

/**
 * Deletes a team from the 'teams' collection.
 * @param firestore - The Firestore instance.
 * @param teamId - The ID of the team to delete.
 */
export function deleteTeam(firestore: Firestore, teamId: string) {
    const teamDocRef = doc(firestore, 'teams', teamId);
    return deleteDoc(teamDocRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: teamDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
