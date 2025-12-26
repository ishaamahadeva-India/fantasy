
'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './sdk-config'; // UPDATED_IMPORT

import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import type { FirestorePermissionError } from './errors';
import { initializeAnalytics, setCurrentUserId } from '@/lib/analytics';

type FirebaseContextType = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
};

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  firestore: null,
  storage: null,
});

function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    // Only listen to errors in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleError = (error: FirestorePermissionError) => {
      console.error(error); // Log the full contextual error to the console
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description:
          'You do not have permission to perform this action. Check the console for details.',
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    firestore: null,
    storage: null,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            const auth = getAuth(app);
            const firestore = getFirestore(app);
            const storage = getStorage(app);
            setInstances({ app, auth, firestore, storage });
            
            // Initialize analytics
            initializeAnalytics(app, firestore);
            
            // Set user ID when auth state changes
            auth.onAuthStateChanged((user) => {
              setCurrentUserId(user?.uid || null);
            });
        } catch (error) {
            console.error('Firebase initialization error:', error);
            // Set instances to null on error to prevent further errors
            setInstances({ app: null, auth: null, firestore: null, storage: null });
        }
    }
  }, []);

  return (
    <FirebaseContext.Provider value={instances}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

// Hooks to easily access Firebase instances
export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useStorage = () => useContext(FirebaseContext).storage;
