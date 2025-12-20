
'use client';
import {
  initializeApp,
  getApp,
  getApps,
  type FirebaseApp,
} from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';

import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';

import { FirebaseClientProvider } from './client-provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';

export type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseInstances: FirebaseInstances | null = null;

export function initializeFirebase(): FirebaseInstances {
  if (typeof window !== 'undefined') {
    if (firebaseInstances) {
        return firebaseInstances;
    }
    
    const app =
        getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    firebaseInstances = { app, auth, firestore };
    return firebaseInstances;
  }
  // For server-side rendering, we need to initialize a new app instance
  // to avoid sharing instances between requests.
  const app = initializeApp(firebaseConfig, `server-${Date.now()}`);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { app, auth, firestore };
}

export {
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
