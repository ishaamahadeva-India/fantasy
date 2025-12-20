'use client';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { I18nProviderClient } from '@/lib/i18n/client';
import { FirebaseClientProvider } from '@/firebase';

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  return (
    <I18nProviderClient locale={locale}>
      <FirebaseClientProvider>
        <AppShell>{children}</AppShell>
      </FirebaseClientProvider>
    </I18nProviderClient>
  );
}
