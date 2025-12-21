'use client';

import { AdvertisementForm } from '@/components/admin/advertisement-form';
import { addAdvertisement } from '@/firebase/firestore/advertisements';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewAdvertisementPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateAdvertisement = async (data: any) => {
    if (!firestore) return;
    try {
      await addAdvertisement(firestore, data);
      toast({
        title: 'Advertisement Created',
        description: 'The new advertisement has been successfully saved.',
      });
      router.push('/admin/ads');
    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the advertisement. Please try again.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Create New Advertisement
      </h1>
      <AdvertisementForm onSubmit={handleCreateAdvertisement} />
    </div>
  );
}

