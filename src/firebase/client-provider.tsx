
'use client';

import { type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { I18nProviderClient } from '@/lib/i18n/client';


export function FirebaseClientProvider({ children, locale }: { children: ReactNode, locale: string }) {
  return (
    <I18nProviderClient locale={locale}>
      <FirebaseProvider>
        {children}
      </FirebaseProvider>
    </I18nProviderClient>
  );
}
