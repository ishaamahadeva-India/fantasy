
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
  imageUrl?: string;
};

export function addGossip(firestore: Firestore, data: GossipData) {
  const gossipsCollection = collection(firestore, 'gossips');
  
  // Remove undefined values to prevent Firestore errors
  const cleanData: Record<string, any> = {
    title: data.title,
    source: data.source,
  };
  
  // Only include imageUrl if it's defined and not empty
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    cleanData.imageUrl = data.imageUrl;
  }
  
  return addDoc(gossipsCollection, cleanData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: gossipsCollection.path,
      operation: 'create',
      requestResourceData: cleanData,
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
  
  // Remove undefined values to prevent Firestore errors
  const cleanData: Record<string, any> = {};
  
  if (data.title !== undefined) {
    cleanData.title = data.title;
  }
  if (data.source !== undefined) {
    cleanData.source = data.source;
  }
  // Only include imageUrl if it's defined and not empty, or explicitly set to empty string to clear it
  if (data.imageUrl !== undefined) {
    if (data.imageUrl === '' || (data.imageUrl && data.imageUrl.trim() !== '')) {
      cleanData.imageUrl = data.imageUrl || '';
    }
  }
  
  return updateDoc(gossipDocRef, cleanData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: gossipDocRef.path,
      operation: 'update',
      requestResourceData: cleanData,
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
