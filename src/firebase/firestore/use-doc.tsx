'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData } from 'firebase/firestore';
import { useAuth } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc<T>(ref: DocumentReference<T, DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useAuth(); // Using auth to re-trigger on auth state change

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
  }, [ref?.path, auth]); // Using path for dependency

  return { data, isLoading, error };
}
