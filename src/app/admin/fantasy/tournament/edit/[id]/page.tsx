'use client';

import { CricketTournamentForm } from '@/components/admin/cricket-tournament-form';
import { updateCricketTournament } from '@/firebase/firestore/cricket-tournaments';
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
      await updateCricketTournament(firestore, tournamentId, tournamentData);

      toast({
        title: 'Tournament Updated',
        description: 'The tournament has been successfully updated.',
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
    events: events?.map((event) => ({
      ...event,
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

