'use client';

import { CricketMatchForm } from '@/components/admin/cricket-match-form';
import { addCricketMatch, addMatchEvent } from '@/firebase/firestore/cricket-matches';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewCricketMatchPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateMatch = async (data: any) => {
    if (!firestore) return;
    try {
      // Extract events from match data
      const { events, ...matchData } = data;
      
      // Create teams array from team1 and team2
      matchData.teams = [matchData.team1, matchData.team2];
      
      // Create the match
      const matchRef = await addCricketMatch(firestore, matchData);
      const matchId = matchRef.id;

      // Add events if any
      if (events && events.length > 0) {
        for (const event of events) {
          await addMatchEvent(firestore, matchId, event);
        }
      }

      toast({
        title: 'Match Created',
        description: `Match created with ${events?.length || 0} events.`,
      });
      router.push('/admin/fantasy');
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the match. Please try again.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Create New Cricket Match
      </h1>
      <CricketMatchForm onSubmit={handleCreateMatch} />
    </div>
  );
}
