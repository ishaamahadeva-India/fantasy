
import type { ReactNode } from 'react';
import { FantasyHeader } from '@/components/fantasy/fantasy-header';
import { SubscriptionAccessGuard } from '@/components/fantasy/subscription-access-guard';

export default function FantasyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <FantasyHeader />
      <SubscriptionAccessGuard>{children}</SubscriptionAccessGuard>
    </div>
  );
}
