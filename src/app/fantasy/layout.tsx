
import type { ReactNode } from 'react';
import { FantasyHeader } from '@/components/fantasy/fantasy-header';

export default function FantasyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-8">
      <FantasyHeader />
      {children}
    </div>
  );
}
