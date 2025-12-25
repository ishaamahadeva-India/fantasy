'use client';

import { FantasyCampaignForm } from '@/components/admin/fantasy-campaign-form';
import { addFantasyCampaign, addCampaignEvent } from '@/firebase/firestore/fantasy-campaigns';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewMultipleMoviesCampaignPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateCampaign = async (data: any) => {
    if (!firestore) return;
    try {
      // Extract events from campaign data
      const { events, ...campaignData } = data;
      
      // Ensure campaign type is multiple_movies
      campaignData.campaignType = 'multiple_movies';
      
      // Validate movies array
      if (!campaignData.movies || campaignData.movies.length === 0) {
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
        console.log(`Adding ${events.length} events to campaign ${campaignId}`);
        for (const event of events) {
          try {
            await addCampaignEvent(firestore, campaignId, event);
            console.log('Event added successfully:', event.title);
          } catch (error) {
            console.error('Error adding event:', error);
            toast({
              variant: 'destructive',
              title: 'Warning',
              description: `Failed to add event: ${event.title}. Campaign created but some events may be missing.`,
            });
          }
        }
      } else {
        console.log('No events to add to campaign');
      }

      toast({
        title: 'Campaign Created',
        description: 'The multiple movies fantasy campaign has been successfully created.',
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
        Create Multiple Movies Campaign
      </h1>
      <p className="text-muted-foreground mb-8">
        Create a fantasy campaign with multiple movies for cross-movie comparisons.
      </p>
      <FantasyCampaignForm 
        onSubmit={handleCreateCampaign} 
        defaultValues={{ campaignType: 'multiple_movies' }}
      />
    </div>
  );
}

