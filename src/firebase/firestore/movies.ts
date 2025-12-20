
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

type MovieData = {
  title: string;
  releaseYear: number;
  genre: string;
  description: string;
  posterUrl?: string;
};

export function addMovie(firestore: Firestore, data: MovieData) {
  const moviesCollection = collection(firestore, 'movies');
  return addDoc(moviesCollection, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: moviesCollection.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export function updateMovie(
  firestore: Firestore,
  movieId: string,
  data: Partial<MovieData>
) {
  const movieDocRef = doc(firestore, 'movies', movieId);
  return updateDoc(movieDocRef, data).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: movieDocRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export function deleteMovie(firestore: Firestore, movieId: string) {
    const movieDocRef = doc(firestore, 'movies', movieId);
    return deleteDoc(movieDocRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: movieDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
