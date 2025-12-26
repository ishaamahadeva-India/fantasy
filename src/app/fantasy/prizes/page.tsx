'use client';

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { FantasyCampaign } from '@/lib/types';
import { CampaignPrizeCard } from '@/components/fantasy/campaign-prize-card';

type FantasyCampaignWithId = FantasyCampaign & { id: string };

export default function AllPrizesPage() {
  const firestore = useFirestore();

  // Fetch all campaigns with prize distribution
  const campaignsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'fantasy-campaigns'),
      where('prizeDistribution', '!=', null)
    );
  }, [firestore]);

  const { data: campaignsData, isLoading } = useCollection(campaignsQuery);
  const campaigns = campaignsData as FantasyCampaignWithId[] | undefined;

  // Filter campaigns that actually have prizeDistribution
  const campaignsWithPrizes = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter(campaign => campaign.prizeDistribution && campaign.prizeDistribution.tiers.length > 0);
  }, [campaigns]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">Prize Distributions</h1>
        </div>
        <p className="text-muted-foreground">
          View prize tiers and rewards for all active fantasy campaigns
        </p>
      </div>

      {/* Campaigns List */}
      {campaignsWithPrizes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-lg font-semibold">No Prize Distributions Available</h3>
                <p className="text-muted-foreground mt-2">
                  There are no campaigns with prize distributions configured yet.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/fantasy/movie">
                  Browse Campaigns
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {campaignsWithPrizes.map((campaign) => (
            <CampaignPrizeCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            How Prize Distribution Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Prize tiers are based on final leaderboard rankings</p>
          <p>• Some tiers may require a minimum number of participants to activate</p>
          <p>• Prizes are distributed after campaign completion</p>
          <p>• All prizes are subject to terms and conditions</p>
        </CardContent>
      </Card>
    </div>
  );
}

