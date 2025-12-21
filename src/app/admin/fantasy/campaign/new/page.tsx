
'use client';

import { FantasyCampaignForm } from '@/components/admin/fantasy-campaign-form';
import { addFantasyCampaign, addCampaignEvent } from '@/firebase/firestore/fantasy-campaigns';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewFantasyCampaignPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateCampaign = async (data: any) => {
    if (!firestore) return;
    try {
      // Extract events from campaign data
      const { events, ...campaignData } = data;
      
      // Validate campaign type
      if (campaignData.campaignType === 'single_movie' && !campaignData.movieId) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please select a movie for single movie campaign.',
        });
        return;
      }
      
      if (campaignData.campaignType === 'multiple_movies' && (!campaignData.movies || campaignData.movies.length === 0)) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please add at least one movie for multiple movies campaign.',
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
        description: 'The new fantasy campaign has been successfully created.',
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
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Create New Fantasy Campaign
      </h1>
      <FantasyCampaignForm onSubmit={handleCreateCampaign} />
    </div>
  );
}
