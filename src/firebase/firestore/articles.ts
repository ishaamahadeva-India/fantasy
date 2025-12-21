
'use client';

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Type for a new article, before it's saved (no ID, no server-generated timestamp)
type NewArticle = {
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
}

/**
 * Adds a new article to the 'articles' collection.
 * @param firestore - The Firestore instance.
 * @param articleData - The data for the new article.
 */
export function addArticle(firestore: Firestore, articleData: NewArticle) {
  const articlesCollection = collection(firestore, 'articles');
  const docToSave = {
    ...articleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(articlesCollection, docToSave)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: articlesCollection.path,
            operation: 'create',
            requestResourceData: docToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw to be caught by the caller
    });
}

/**
 * Updates an existing article in the 'articles' collection.
 * @param firestore - The Firestore instance.
 * @param articleId - The ID of the article to update.
 * @param articleData - The data to update.
 */
export function updateArticle(firestore: Firestore, articleId: string, articleData: Partial<NewArticle>) {
    const articleDocRef = doc(firestore, 'articles', articleId);
    const docToUpdate = {
        ...articleData,
        updatedAt: serverTimestamp(),
    };

    return updateDoc(articleDocRef, docToUpdate)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: articleDocRef.path,
                operation: 'update',
                requestResourceData: docToUpdate,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // Re-throw to be caught by the caller
        });
}
