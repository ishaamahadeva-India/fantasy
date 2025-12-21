
'use client';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { GossipForm } from '@/components/admin/gossip-form';
import { updateGossip } from '@/firebase/firestore/gossips';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGossipPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const gossipRef = firestore ? doc(firestore, 'gossips', id) : null;
  const { data: gossip, isLoading } = useDoc(gossipRef);

  const handleUpdateGossip = async (data: any) => {
    if (!firestore) return;
    try {
      await updateGossip(firestore, id, data);
      toast({
        title: 'Gossip Updated',
        description: 'The gossip item has been successfully updated.',
      });
      router.push('/admin/content');
    } catch (error) {
      console.error('Error updating gossip:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the gossip item. Please try again.',
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

  if (!gossip) {
    return <div>Gossip not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Edit Gossip
      </h1>
      <GossipForm onSubmit={handleUpdateGossip} defaultValues={gossip} />
    </div>
  );
}
