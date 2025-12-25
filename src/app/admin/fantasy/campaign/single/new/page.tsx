'use client';

import { FantasyCampaignForm } from '@/components/admin/fantasy-campaign-form';
import { addFantasyCampaign, addCampaignEvent } from '@/firebase/firestore/fantasy-campaigns';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewSingleMovieCampaignPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateCampaign = async (data: any) => {
    if (!firestore) return;
    try {
      // Extract events from campaign data
      const { events, ...campaignData } = data;
      
      // Ensure campaign type is single_movie
      campaignData.campaignType = 'single_movie';
      
      // Validate movie selection
      if (!campaignData.movieId || campaignData.movieId.trim() === '') {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please select a movie for single movie campaign.',
        });
        return;
      }
      
      // Create the campaign
      const campaignRef = await addFantasyCampaign(firestore, campaignData);
      const campaignId = campaignRef.id;

      // Add events if any
      if (events && events.length > 0) {
        for (const event of events) {
          await addCampaignEvent(firestore, campaignId, event);
        }
      }

      toast({
        title: 'Campaign Created',
        description: 'The single movie fantasy campaign has been successfully created.',
      });
      router.push('/admin/fantasy');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the campaign. Please try again.',
      });
    }
  };

  return (
    <div>
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/admin/fantasy/campaign/new">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign Types
        </Link>
      </Button>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-2">
        Create Single Movie Campaign
      </h1>
      <p className="text-muted-foreground mb-8">
        Create a fantasy campaign focused on a single movie release.
      </p>
      <FantasyCampaignForm 
        onSubmit={handleCreateCampaign} 
        defaultValues={{ campaignType: 'single_movie' }}
      />
    </div>
  );
}

