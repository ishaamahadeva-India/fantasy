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
        console.log(`🚀 Adding ${events.length} events to campaign ${campaignId}`);
        let successCount = 0;
        let failCount = 0;
        
        for (const event of events) {
          try {
            // Use campaign dates as fallback for event dates
            const eventToSave = {
              title: event.title,
              description: event.description || '',
              eventType: event.eventType,
              status: event.status || 'upcoming',
              startDate: event.startDate || campaignData.startDate || new Date(),
              endDate: event.endDate || campaignData.endDate || campaignData.startDate || new Date(),
              points: event.points || 0,
              movieId: event.movieId,
              difficultyLevel: event.difficultyLevel,
              options: event.options,
              rules: event.rules,
              draftConfig: event.draftConfig,
              lockTime: event.lockTime,
            };
            
            const docRef = await addCampaignEvent(firestore, campaignId, eventToSave);
            console.log('✅ Event added:', event.title, '→', docRef.id);
            successCount++;
          } catch (error: any) {
            console.error('❌ Error adding event:', error);
            failCount++;
            toast({
              variant: 'destructive',
              title: 'Warning',
              description: `Failed to add event: ${event.title}.`,
            });
          }
        }
        console.log(`✅ Events: ${successCount} succeeded, ${failCount} failed`);
      } else {
        console.warn('⚠️ No events to add to campaign');
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

