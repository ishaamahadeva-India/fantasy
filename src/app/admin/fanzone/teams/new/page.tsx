
'use client';

import { TeamForm } from '@/components/admin/team-form';
import { addTeam } from '@/firebase/firestore/teams';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewTeamPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateTeam = async (data: any) => {
    if (!firestore) return;
    try {
      await addTeam(firestore, data);
      toast({
        title: 'Team Created',
        description: 'The new team profile has been successfully saved.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the team. Please try again.',
      });
    }
  };

  return (
    <div>
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/admin/fanzone">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fan Zone
            </Link>
        </Button>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Add New Team
      </h1>
      <TeamForm onSubmit={handleCreateTeam} />
    </div>
  );
}
