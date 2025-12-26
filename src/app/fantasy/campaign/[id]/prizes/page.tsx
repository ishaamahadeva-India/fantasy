'use client';

import { useParams, notFound } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { PrizeTable } from '@/components/fantasy/prize-table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { FantasyCampaign } from '@/lib/types';

export default function CampaignPrizesPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const firestore = useFirestore();

  // Fetch campaign
  const campaignDocRef = firestore ? doc(firestore, 'fantasy-campaigns', campaignId) : null;
  const { data: campaignData, isLoading: campaignLoading } = useDoc(campaignDocRef);
  const campaign = campaignData as (FantasyCampaign & { id: string }) | undefined;

  // Fetch participant count
  const participationsRef = firestore
    ? collection(firestore, 'fantasy-campaigns', campaignId, 'participations')
    : null;
  const { data: participations } = useCollection(participationsRef);
  const participantCount = participations?.length || 0;

  if (campaignLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign) {
    notFound();
  }

  if (!campaign.prizeDistribution) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Button variant="ghost" asChild>
          <Link href={`/fantasy/campaign/${campaignId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign
          </Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No prize distribution configured for this campaign.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" asChild>
        <Link href={`/fantasy/campaign/${campaignId}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Link>
      </Button>

      <PrizeTable
        prizeDistribution={campaign.prizeDistribution}
        participantCount={participantCount}
        campaignTitle={campaign.title}
      />
    </div>
  );
}

