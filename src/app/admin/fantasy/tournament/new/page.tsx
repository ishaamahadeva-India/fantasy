'use client';

import { CricketTournamentForm } from '@/components/admin/cricket-tournament-form';
import { addCricketTournament, addTournamentEvent } from '@/firebase/firestore/cricket-tournaments';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewCricketTournamentPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateTournament = async (data: any) => {
    if (!firestore) return;
    try {
      // Extract events from tournament data
      const { events, ...tournamentData } = data;
      
      // Validate teams
      if (!tournamentData.teams || tournamentData.teams.length < 2) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please add at least 2 teams to the tournament.',
        });
        return;
      }
      
      // Create the tournament
      const tournamentRef = await addCricketTournament(firestore, tournamentData);
      const tournamentId = tournamentRef.id;

      // Add events if any
      if (events && events.length > 0) {
        for (const event of events) {
          await addTournamentEvent(firestore, tournamentId, event);
        }
      }

      toast({
        title: 'Tournament Created',
        description: `Tournament created with ${events?.length || 0} events.`,
      });
      router.push('/admin/fantasy');
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the tournament. Please try again.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Create New Cricket Tournament
      </h1>
      <CricketTournamentForm onSubmit={handleCreateTournament} />
    </div>
  );
}

