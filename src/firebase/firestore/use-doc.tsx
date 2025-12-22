'use client';
import { useState, useEffect, useRef } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';
import { useAuth } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc<T>(ref: DocumentReference<T, DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useAuth(); // Using auth to re-trigger on auth state change
  const refPath = ref?.path || 'null';

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData(doc.data());
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        // Check if it's a CORS error
        const isCorsError = err?.message?.includes('CORS') || 
                           err?.code === 'unavailable' ||
                           err?.message?.includes('network') ||
                           err?.message?.includes('Failed to fetch');
        
        if (isCorsError) {
          console.error('Firestore CORS Error:', {
            message: err.message,
            code: err.code,
            hint: 'Check FIREBASE_CORS_FIX.md for solutions. Make sure Firestore is enabled and your domain is authorized in Firebase Console.'
          });
        }
        
         const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setIsLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [refPath, auth]); // Use refPath (string) instead of ref object for stable dependency

  return { data, isLoading, error };
}
