'use client';

import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from './sdk-config';

let storageInstance: FirebaseStorage | null = null;

export function getStorageInstance(): FirebaseStorage | null {
  if (typeof window === 'undefined') return null;
  
  if (!storageInstance) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      storageInstance = getStorage(app);
    } catch (error) {
      console.error('Error initializing Firebase Storage:', error);
    }
  }
  
  return storageInstance;
}

/**
 * Uploads an image file to Firebase Storage
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'articles/image.jpg' or 'gossips/image.jpg')
 * @returns Promise<string> - The download URL of the uploaded image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const storage = getStorageInstance();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  // Create a reference to the file location
  const storageRef = ref(storage, path);
  
  // Upload the file
  await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

/**
 * Generates a unique file path for an uploaded image
 * @param file - The image file
 * @param folder - The folder name (e.g., 'articles' or 'gossips')
 * @returns string - The unique file path
 */
export function generateImagePath(file: File, folder: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  return `${folder}/${timestamp}-${randomString}.${fileExtension}`;
}

