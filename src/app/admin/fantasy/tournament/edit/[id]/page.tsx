'use client';

import { CricketTournamentForm } from '@/components/admin/cricket-tournament-form';
import { updateCricketTournament, addTournamentEvent, updateTournamentEvent, deleteTournamentEvent } from '@/firebase/firestore/cricket-tournaments';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, Timestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { CricketTournament, TournamentEvent } from '@/lib/types';

const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
};

export default function EditCricketTournamentPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const tournamentRef = firestore ? doc(firestore, 'cricket-tournaments', tournamentId) : null;
  const { data: tournament, isLoading: tournamentLoading } = useDoc(tournamentRef);

  const eventsRef = firestore
    ? collection(firestore, 'cricket-tournaments', tournamentId, 'events')
    : null;
  const { data: events, isLoading: eventsLoading } = useCollection(eventsRef);

  const handleUpdateTournament = async (data: any) => {
    if (!firestore) return;
    try {
      const { events: formEvents, ...tournamentData } = data;
      
      // Update the tournament
      await updateCricketTournament(firestore, tournamentId, tournamentData);

      // Handle events: add new, update existing, delete removed
      const existingEventIds = new Set((events || []).map((e: any) => e.id));
      const formEventIds = new Set((formEvents || []).map((e: any) => e.id).filter(Boolean));

      // Delete events that were removed
      for (const existingEvent of events || []) {
        if (!formEventIds.has(existingEvent.id)) {
          await deleteTournamentEvent(firestore, tournamentId, existingEvent.id);
        }
      }

      // Helper to remove undefined values and validate dates
      const cleanEventData = (event: any) => {
        const cleaned: any = {
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          status: event.status,
          startDate: event.startDate instanceof Date && !isNaN(event.startDate.getTime()) ? event.startDate : new Date(),
          endDate: event.endDate instanceof Date && !isNaN(event.endDate.getTime()) ? event.endDate : new Date(),
          points: event.points,
        };
        
        // Only include optional fields if they have valid values
        if (event.lockTime && event.lockTime instanceof Date && !isNaN(event.lockTime.getTime())) {
          cleaned.lockTime = event.lockTime;
        }
        if (event.difficultyLevel && event.difficultyLevel !== '') {
          cleaned.difficultyLevel = event.difficultyLevel;
        }
        if (event.options && Array.isArray(event.options) && event.options.length > 0) {
          cleaned.options = event.options;
        }
        if (event.multiSelect !== undefined && event.multiSelect !== null) {
          cleaned.multiSelect = event.multiSelect;
        }
        if (event.maxSelections && typeof event.maxSelections === 'number') {
          cleaned.maxSelections = event.maxSelections;
        }
        if (event.rules && Array.isArray(event.rules) && event.rules.length > 0) {
          cleaned.rules = event.rules;
        }
        if (event.groupId && event.groupId !== '') {
          cleaned.groupId = event.groupId;
        }
        
        // Remove any remaining undefined/null values
        return Object.fromEntries(
          Object.entries(cleaned).filter(([_, value]) => value !== undefined && value !== null)
        );
      };

      // Add or update events
      for (const formEvent of formEvents || []) {
        const cleanedData = cleanEventData(formEvent);
        
        if (formEvent.id && existingEventIds.has(formEvent.id)) {
          // Update existing event
          await updateTournamentEvent(firestore, tournamentId, formEvent.id, cleanedData);
        } else {
          // Add new event
          await addTournamentEvent(firestore, tournamentId, cleanedData);
        }
      }

      toast({
        title: 'Tournament Updated',
        description: `Tournament and ${formEvents?.length || 0} events updated successfully.`,
      });
      router.push('/admin/fantasy');
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the tournament. Please try again.',
      });
    }
  };

  if (tournamentLoading || eventsLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
          Tournament Not Found
        </h1>
        <p className="text-muted-foreground">The tournament you're looking for doesn't exist.</p>
      </div>
    );
  }

  const defaultValues = {
    ...tournament,
    startDate: toDate(tournament.startDate),
    endDate: toDate(tournament.endDate),
    events: events?.map((event: any) => ({
      ...event,
      id: event.id, // Ensure ID is included
      startDate: toDate(event.startDate),
      endDate: toDate(event.endDate),
      lockTime: event.lockTime ? toDate(event.lockTime) : undefined,
    })) || [],
    entryFee: tournament.entryFee || { type: 'free' },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Edit Cricket Tournament
      </h1>
      <CricketTournamentForm onSubmit={handleUpdateTournament} defaultValues={defaultValues as any} />
    </div>
  );
}

