
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider } from '@/firebase';
import { I18nProviderClient } from '@/lib/i18n/client';
import { getStaticParams } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Ultra-Posh',
  description: 'The premier subscription platform for discerning learners.',
  manifest: '/manifest.json',
};

export function generateStaticParams() {
  return getStaticParams();
}

export default function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={locale} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#E6C87A" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <I18nProviderClient locale={locale}>
          <FirebaseClientProvider>
            <AppShell>{children}</AppShell>
          </FirebaseClientProvider>
        </I18nProviderClient>
        <Toaster />
      </body>
    </html>
  );
}
