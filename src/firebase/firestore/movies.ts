
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
  industry: string;
  description: string;
  posterUrl?: string;
  director?: string;
  cast?: string;
  runtime?: string;
  imdbRating?: number;
  language?: string;
};

export function addMovie(firestore: Firestore, data: MovieData) {
  const moviesCollection = collection(firestore, 'movies');
  
  // Remove undefined values to prevent Firestore errors
  const cleanData: Record<string, any> = {
    title: data.title,
    releaseYear: data.releaseYear,
    genre: data.genre,
    industry: data.industry,
    description: data.description,
  };
  
  // Only include optional fields if they're defined and not empty
  if (data.posterUrl && data.posterUrl.trim() !== '') {
    cleanData.posterUrl = data.posterUrl;
  }
  if (data.director && data.director.trim() !== '') {
    cleanData.director = data.director;
  }
  if (data.cast && data.cast.trim() !== '') {
    cleanData.cast = data.cast;
  }
  if (data.runtime && data.runtime.trim() !== '') {
    cleanData.runtime = data.runtime;
  }
  if (data.imdbRating !== undefined && data.imdbRating !== null) {
    cleanData.imdbRating = data.imdbRating;
  }
  if (data.language && data.language.trim() !== '') {
    cleanData.language = data.language;
  }
  
  return addDoc(moviesCollection, cleanData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: moviesCollection.path,
      operation: 'create',
      requestResourceData: cleanData,
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
  
  // Remove undefined values to prevent Firestore errors
  const cleanData: Record<string, any> = {};
  
  // Only include fields that are defined
  if (data.title !== undefined) cleanData.title = data.title;
  if (data.releaseYear !== undefined) cleanData.releaseYear = data.releaseYear;
  if (data.genre !== undefined) cleanData.genre = data.genre;
  if (data.industry !== undefined) cleanData.industry = data.industry;
  if (data.description !== undefined) cleanData.description = data.description;
  
  // Handle optional fields - only include if they have values
  if (data.posterUrl !== undefined) {
    cleanData.posterUrl = data.posterUrl && data.posterUrl.trim() !== '' ? data.posterUrl : null;
  }
  if (data.director !== undefined) {
    cleanData.director = data.director && data.director.trim() !== '' ? data.director : null;
  }
  if (data.cast !== undefined) {
    cleanData.cast = data.cast && data.cast.trim() !== '' ? data.cast : null;
  }
  if (data.runtime !== undefined) {
    cleanData.runtime = data.runtime && data.runtime.trim() !== '' ? data.runtime : null;
  }
  if (data.imdbRating !== undefined) {
    cleanData.imdbRating = data.imdbRating !== null ? data.imdbRating : null;
  }
  if (data.language !== undefined) {
    cleanData.language = data.language && data.language.trim() !== '' ? data.language : null;
  }
  
  return updateDoc(movieDocRef, cleanData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: movieDocRef.path,
      operation: 'update',
      requestResourceData: cleanData,
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
