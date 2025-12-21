
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

type GossipData = {
  title: string;
  source: string;
};

export function addGossip(firestore: Firestore, data: GossipData) {
  const gossipsCollection = collection(firestore, 'gossips');
  return addDoc(gossipsCollection, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: gossipsCollection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export function updateGossip(
  firestore: Firestore,
  gossipId: string,
  data: Partial<GossipData>
) {
  const gossipDocRef = doc(firestore, 'gossips', gossipId);
  return updateDoc(gossipDocRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: gossipDocRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export function deleteGossip(firestore: Firestore, gossipId: string) {
    const gossipDocRef = doc(firestore, 'gossips', gossipId);
    return deleteDoc(gossipDocRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: gossipDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
