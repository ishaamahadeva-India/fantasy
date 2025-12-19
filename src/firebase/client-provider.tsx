'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from './provider';

// This provider is necessary to ensure that Firebase is only initialized on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}
