
'use client';

import { GossipForm } from '@/components/admin/gossip-form';
import { addGossip } from '@/firebase/firestore/gossips';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewGossipPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateGossip = async (data: any) => {
    if (!firestore) return;
    try {
      await addGossip(firestore, data);
      toast({
        title: 'Gossip Created',
        description: 'The new gossip item has been successfully saved.',
      });
      router.push('/admin/content');
    } catch (error) {
      console.error('Error creating gossip:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the gossip item. Please try again.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Create New Gossip
      </h1>
      <GossipForm onSubmit={handleCreateGossip} />
    </div>
  );
}
