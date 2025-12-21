'use client';

import { AdvertisementForm } from '@/components/admin/advertisement-form';
import { updateAdvertisement } from '@/firebase/firestore/advertisements';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { Advertisement } from '@/lib/types';

export default function EditAdvertisementPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const adRef = firestore ? doc(firestore, 'advertisements', adId) : null;
  const { data: advertisement, isLoading } = useDoc(adRef);

  const handleUpdateAdvertisement = async (data: any) => {
    if (!firestore) return;
    try {
      await updateAdvertisement(firestore, adId, data);
      toast({
        title: 'Advertisement Updated',
        description: 'The advertisement has been successfully updated.',
      });
      router.push('/admin/ads');
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the advertisement. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
          Advertisement Not Found
        </h1>
        <p className="text-muted-foreground">The advertisement you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Edit Advertisement
      </h1>
      <AdvertisementForm
        onSubmit={handleUpdateAdvertisement}
        defaultValues={{
          title: advertisement.title,
          description: advertisement.description,
          imageUrl: advertisement.imageUrl,
          linkUrl: advertisement.linkUrl,
          position: advertisement.position,
          active: advertisement.active,
        }}
      />
    </div>
  );
}

