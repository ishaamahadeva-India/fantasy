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
import type { CampaignEntry } from '@/lib/types';

type NewCampaignEntry = Omit<CampaignEntry, 'id' | 'joinedAt'>;

/**
 * Adds a new campaign entry (user participation)
 */
export function addCampaignEntry(firestore: Firestore, entryData: NewCampaignEntry) {
  const entriesCollection = collection(firestore, 'campaign-entries');
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
 * Updates a campaign entry (e.g., payment status)
 */
export function updateCampaignEntry(
  firestore: Firestore,
  entryId: string,
  entryData: Partial<NewCampaignEntry>
) {
  const entryDocRef = doc(firestore, 'campaign-entries', entryId);
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
 * Gets all entries for a campaign
 */
export async function getCampaignEntries(firestore: Firestore, campaignId: string) {
  const entriesCollection = collection(firestore, 'campaign-entries');
  const q = query(entriesCollection, where('campaignId', '==', campaignId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Gets user's entry for a campaign
 */
export async function getUserCampaignEntry(
  firestore: Firestore,
  campaignId: string,
  userId: string
) {
  const entriesCollection = collection(firestore, 'campaign-entries');
  const q = query(
    entriesCollection,
    where('campaignId', '==', campaignId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

