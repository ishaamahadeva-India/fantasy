
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  return (
    <FirebaseClientProvider locale={locale}>
        <AppShell>{children}</AppShell>
    </FirebaseClientProvider>
  );
}
