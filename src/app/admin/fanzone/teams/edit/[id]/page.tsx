
'use client';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { TeamForm } from '@/components/admin/team-form';
import { updateTeam } from '@/firebase/firestore/teams';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditTeamPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const router = useRouter();
  const teamRef = firestore ? doc(firestore, 'teams', params.id) : null;
  const { data: team, isLoading } = useDoc<any>(teamRef);

  const handleUpdateTeam = async (data: any) => {
    if (!firestore) return;
    try {
      await updateTeam(firestore, params.id, data);
      toast({
        title: 'Team Updated',
        description: 'The team profile has been successfully updated.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the team. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!team) {
    return <div>Team not found.</div>;
  }

  return (
    <div>
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/admin/fanzone">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fan Zone
            </Link>
        </Button>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Edit Team
      </h1>
      <TeamForm onSubmit={handleUpdateTeam} defaultValues={team} />
    </div>
  );
}
