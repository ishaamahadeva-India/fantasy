'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, type Query, type DocumentData } from 'firebase/firestore';
import { useAuth } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(query: Query<T, DocumentData> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useAuth(); // Using auth to re-trigger on auth state change

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => doc.data());
        setData(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
            path: query.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setIsLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [JSON.stringify(query), auth]); // Simple serialization for dependency

  return { data, isLoading, error };
}
