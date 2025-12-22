
'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, type Query, type DocumentData } from 'firebase/firestore';
import { useAuth } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T>(query: Query<T, DocumentData> | null) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
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
        const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setData(data);
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
            path: (query as any)._query.path.segments.join('/'),
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

    