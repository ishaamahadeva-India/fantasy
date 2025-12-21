'use client';

import { CricketMatchForm } from '@/components/admin/cricket-match-form';
import { updateCricketMatch, addMatchEvent, updateMatchEvent, deleteMatchEvent } from '@/firebase/firestore/cricket-matches';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, Timestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { FantasyMatch, CricketEvent } from '@/lib/types';

// Helper to convert Firestore Timestamp to Date
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
};

export default function EditCricketMatchPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  const matchRef = firestore ? doc(firestore, 'fantasy_matches', matchId) : null;
  const { data: match, isLoading: matchLoading } = useDoc<FantasyMatch>(matchRef);

  const eventsRef = firestore
    ? collection(firestore, 'fantasy_matches', matchId, 'events')
    : null;
  const { data: events, isLoading: eventsLoading } = useCollection<CricketEvent>(eventsRef);

  const handleUpdateMatch = async (data: any) => {
    if (!firestore) return;
    try {
      // Extract events from match data
      const { events: formEvents, ...matchData } = data;
      
      // Create teams array
      matchData.teams = [matchData.team1, matchData.team2];

      // Update the match
      await updateCricketMatch(firestore, matchId, matchData);

      toast({
        title: 'Match Updated',
        description: 'The match has been successfully updated.',
      });
      router.push('/admin/fantasy');
    } catch (error) {
      console.error('Error updating match:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the match. Please try again.',
      });
    }
  };

  if (matchLoading || eventsLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!match) {
    return (
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
          Match Not Found
        </h1>
        <p className="text-muted-foreground">The match you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Convert Firestore timestamps to Date objects
  const defaultValues = {
    ...match,
    team1: match.team1 || match.teams?.[0] || '',
    team2: match.team2 || match.teams?.[1] || '',
    startTime: toDate(match.startTime),
    events: events?.map((event) => ({
      ...event,
      startTime: event.startTime ? toDate(event.startTime) : undefined,
      endTime: event.endTime ? toDate(event.endTime) : undefined,
      lockTime: event.lockTime ? toDate(event.lockTime) : undefined,
    })) || [],
    entryFee: match.entryFee || { type: 'free' },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Edit Cricket Match
      </h1>
      <CricketMatchForm onSubmit={handleUpdateMatch} defaultValues={defaultValues} />
    </div>
  );
}
