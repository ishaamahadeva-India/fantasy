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
import type { ImageAdSponsor } from '@/lib/types';

type NewImageAdSponsor = Omit<ImageAdSponsor, 'id' | 'createdAt' | 'updatedAt'>;

// Helper function to remove undefined values from an object recursively
function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // Skip undefined values
    }
    // Handle arrays
    if (Array.isArray(value)) {
      cleaned[key] = value.map(item => 
        typeof item === 'object' && item !== null ? removeUndefinedValues(item) : item
      );
    }
    // Handle nested objects
    else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      cleaned[key] = removeUndefinedValues(value);
    }
    // Handle strings - filter out empty strings for optional fields
    else if (typeof value === 'string' && value.trim() === '') {
      continue; // Skip empty strings for optional fields
    }
    else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Creates a new ad sponsor
 */
export function createImageAdSponsor(
  firestore: Firestore,
  sponsorData: NewImageAdSponsor
) {
  const sponsorsCollection = collection(firestore, 'image-ad-sponsors');
  
  // Build the document to save, explicitly including required fields
  const docToSave: Record<string, any> = {
    name: sponsorData.name,
    companyName: sponsorData.companyName,
    contactEmail: sponsorData.contactEmail,
    status: sponsorData.status,
    totalSpent: 0,
    totalViews: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Add optional fields only if they have values
  if (sponsorData.logoUrl && sponsorData.logoUrl.trim() !== '') {
    docToSave.logoUrl = sponsorData.logoUrl;
  }
  if (sponsorData.contactPhone && sponsorData.contactPhone.trim() !== '') {
    docToSave.contactPhone = sponsorData.contactPhone;
  }
  if (sponsorData.website && sponsorData.website.trim() !== '') {
    docToSave.website = sponsorData.website;
  }
  if (sponsorData.instagram && sponsorData.instagram.trim() !== '') {
    docToSave.instagram = sponsorData.instagram;
  }
  if (sponsorData.twitter && sponsorData.twitter.trim() !== '') {
    docToSave.twitter = sponsorData.twitter;
  }
  if (sponsorData.facebook && sponsorData.facebook.trim() !== '') {
    docToSave.facebook = sponsorData.facebook;
  }
  if (sponsorData.billingAddress && sponsorData.billingAddress.trim() !== '') {
    docToSave.billingAddress = sponsorData.billingAddress;
  }
  if (sponsorData.paymentMethod && sponsorData.paymentMethod.trim() !== '') {
    docToSave.paymentMethod = sponsorData.paymentMethod;
  }
  if (sponsorData.contractStartDate) {
    docToSave.contractStartDate = sponsorData.contractStartDate;
  }
  if (sponsorData.contractEndDate) {
    docToSave.contractEndDate = sponsorData.contractEndDate;
  }
  
  // Clean undefined values as a final safety check
  const cleanData = removeUndefinedValues(docToSave);

  return addDoc(sponsorsCollection, cleanData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: sponsorsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing ad sponsor
 */
export function updateImageAdSponsor(
  firestore: Firestore,
  sponsorId: string,
  sponsorData: Partial<NewImageAdSponsor>
) {
  const sponsorDocRef = doc(firestore, 'image-ad-sponsors', sponsorId);
  
  // Build the document to update, explicitly including only defined fields
  const docToUpdate: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  
  // Add fields only if they are defined and have values
  if (sponsorData.name !== undefined) {
    docToUpdate.name = sponsorData.name;
  }
  if (sponsorData.companyName !== undefined) {
    docToUpdate.companyName = sponsorData.companyName;
  }
  if (sponsorData.contactEmail !== undefined) {
    docToUpdate.contactEmail = sponsorData.contactEmail;
  }
  if (sponsorData.status !== undefined) {
    docToUpdate.status = sponsorData.status;
  }
  if (sponsorData.logoUrl !== undefined && sponsorData.logoUrl.trim() !== '') {
    docToUpdate.logoUrl = sponsorData.logoUrl;
  }
  if (sponsorData.contactPhone !== undefined && sponsorData.contactPhone.trim() !== '') {
    docToUpdate.contactPhone = sponsorData.contactPhone;
  }
  if (sponsorData.website !== undefined && sponsorData.website.trim() !== '') {
    docToUpdate.website = sponsorData.website;
  }
  if (sponsorData.instagram !== undefined && sponsorData.instagram.trim() !== '') {
    docToUpdate.instagram = sponsorData.instagram;
  }
  if (sponsorData.twitter !== undefined && sponsorData.twitter.trim() !== '') {
    docToUpdate.twitter = sponsorData.twitter;
  }
  if (sponsorData.facebook !== undefined && sponsorData.facebook.trim() !== '') {
    docToUpdate.facebook = sponsorData.facebook;
  }
  if (sponsorData.billingAddress !== undefined && sponsorData.billingAddress.trim() !== '') {
    docToUpdate.billingAddress = sponsorData.billingAddress;
  }
  if (sponsorData.paymentMethod !== undefined && sponsorData.paymentMethod.trim() !== '') {
    docToUpdate.paymentMethod = sponsorData.paymentMethod;
  }
  if (sponsorData.contractStartDate !== undefined) {
    docToUpdate.contractStartDate = sponsorData.contractStartDate;
  }
  if (sponsorData.contractEndDate !== undefined) {
    docToUpdate.contractEndDate = sponsorData.contractEndDate;
  }
  
  // Clean undefined values as a final safety check
  const cleanData = removeUndefinedValues(docToUpdate);

  return updateDoc(sponsorDocRef, cleanData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: sponsorDocRef.path,
        operation: 'update',
        requestResourceData: docToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes an ad sponsor
 */
export function deleteImageAdSponsor(
  firestore: Firestore,
  sponsorId: string
) {
  const sponsorDocRef = doc(firestore, 'image-ad-sponsors', sponsorId);
  return deleteDoc(sponsorDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: sponsorDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets all sponsors
 */
export async function getAllImageAdSponsors(
  firestore: Firestore
): Promise<ImageAdSponsor[]> {
  const sponsorsCollection = collection(firestore, 'image-ad-sponsors');
  const snapshot = await getDocs(sponsorsCollection);
  const sponsors: ImageAdSponsor[] = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    sponsors.push({
      id: docSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      contractStartDate: data.contractStartDate?.toDate(),
      contractEndDate: data.contractEndDate?.toDate(),
    } as ImageAdSponsor);
  });

  return sponsors;
}

