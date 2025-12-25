
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

// Helper function to remove undefined values from an object
function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      // For strings, also filter out empty strings
      if (typeof value === 'string' && value.trim() === '') {
        continue; // Skip empty strings
      }
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function addMovie(firestore: Firestore, data: MovieData) {
  const moviesCollection = collection(firestore, 'movies');
  
  // Build data object with all fields
  const dataToSave: Record<string, any> = {
    title: data.title,
    releaseYear: data.releaseYear,
    genre: data.genre,
    industry: data.industry,
    description: data.description,
  };
  
  // Only add optional fields if they have actual values
  if (data.posterUrl !== undefined && data.posterUrl !== null && typeof data.posterUrl === 'string' && data.posterUrl.trim() !== '') {
    dataToSave.posterUrl = data.posterUrl.trim();
  }
  if (data.director !== undefined && data.director !== null && typeof data.director === 'string' && data.director.trim() !== '') {
    dataToSave.director = data.director.trim();
  }
  if (data.cast !== undefined && data.cast !== null && typeof data.cast === 'string' && data.cast.trim() !== '') {
    dataToSave.cast = data.cast.trim();
  }
  if (data.runtime !== undefined && data.runtime !== null && typeof data.runtime === 'string' && data.runtime.trim() !== '') {
    dataToSave.runtime = data.runtime.trim();
  }
  if (data.imdbRating !== undefined && data.imdbRating !== null && typeof data.imdbRating === 'number') {
    dataToSave.imdbRating = data.imdbRating;
  }
  if (data.language !== undefined && data.language !== null && typeof data.language === 'string' && data.language.trim() !== '') {
    dataToSave.language = data.language.trim();
  }
  
  // Final cleanup to remove any undefined values (safety check)
  const cleanData = removeUndefinedValues(dataToSave);
  
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
