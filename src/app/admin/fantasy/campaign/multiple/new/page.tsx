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
    
    // CRITICAL DEBUG: Log the entire form data
    console.log('🔥 FORM SUBMITTED - Full data received:', data);
    console.log('🔥 Events in form data:', data.events);
    console.log('🔥 Events type:', typeof data.events);
    console.log('🔥 Events is array?', Array.isArray(data.events));
    console.log('🔥 Events length:', data.events?.length || 0);
    
    try {
      // Extract events from campaign data
      const { events, ...campaignData } = data;
      
      console.log('🔥 After extraction - events:', events);
      console.log('🔥 After extraction - events length:', events?.length || 0);
      
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
        console.log(`🚀 Adding ${events.length} events to campaign ${campaignId}`);
        console.log('📋 Events data from form:', events);
        let successCount = 0;
        let failCount = 0;
        
        for (const event of events) {
          try {
            // Ensure all required fields are present
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
            
            console.log('💾 Saving event:', {
              title: eventToSave.title,
              status: eventToSave.status,
              points: eventToSave.points,
              startDate: eventToSave.startDate,
              endDate: eventToSave.endDate
            });
            
            const docRef = await addCampaignEvent(firestore, campaignId, eventToSave);
            console.log('✅ Event added successfully!', {
              title: event.title,
              documentId: docRef.id,
              path: `fantasy-campaigns/${campaignId}/events/${docRef.id}`
            });
            successCount++;
          } catch (error: any) {
            console.error('❌ Error adding event:', error);
            console.error('❌ Event data that failed:', event);
            console.error('❌ Error details:', {
              message: error.message,
              code: error.code,
              stack: error.stack
            });
            failCount++;
            toast({
              variant: 'destructive',
              title: 'Warning',
              description: `Failed to add event: ${event.title}. Campaign created but some events may be missing.`,
            });
          }
        }
        console.log(`✅ Finished adding events: ${successCount} succeeded, ${failCount} failed`);
        
        if (successCount > 0) {
          toast({
            title: 'Events Created',
            description: `Successfully created ${successCount} event${successCount > 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}.`,
          });
        }
      } else {
        console.warn('⚠️ No events to add to campaign - events array is empty or undefined');
        console.warn('⚠️ Make sure you added events using "Add Event" or "Select All Events" button');
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

