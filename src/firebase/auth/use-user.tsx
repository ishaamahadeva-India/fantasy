'use client';
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { onAuthStateChanged } from 'firebase/auth';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsLoading(false);
      },
      (error) => {
        console.error('Auth state error:', error);
        setUser(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, isLoading };
}
