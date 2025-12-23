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
          // Clean event data - remove undefined values
          const cleanedEvent: any = {
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            status: event.status,
            startDate: event.startDate,
            endDate: event.endDate,
            points: event.points,
          };
          
          // Only include optional fields if they have values
          if (event.lockTime) cleanedEvent.lockTime = event.lockTime;
          if (event.difficultyLevel) cleanedEvent.difficultyLevel = event.difficultyLevel;
          if (event.options && event.options.length > 0) cleanedEvent.options = event.options;
          if (event.multiSelect !== undefined) cleanedEvent.multiSelect = event.multiSelect;
          if (event.maxSelections) cleanedEvent.maxSelections = event.maxSelections;
          if (event.rules && event.rules.length > 0) cleanedEvent.rules = event.rules;
          if (event.groupId) cleanedEvent.groupId = event.groupId;
          
          await addTournamentEvent(firestore, tournamentId, cleanedEvent);
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

