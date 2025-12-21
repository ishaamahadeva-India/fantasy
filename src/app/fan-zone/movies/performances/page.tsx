
'use client';
import { PerformancesTab } from '@/components/fan-zone/performances-tab';

export default function PerformancesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Top Performances
        </h1>
        <p className="mt-2 text-muted-foreground">
          A curated list of the most impactful acting performances.
        </p>
      </div>
      <PerformancesTab />
    </div>
  );
}

    