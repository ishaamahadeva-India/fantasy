import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAdminApp() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing or invalid');
    }
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApps()[0];
}

export function getAdminDb() {
  getAdminApp();
  return getFirestore();
}

export function getAdminAuth() {
  getAdminApp();
  return getAuth();
}
