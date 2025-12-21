
'use client';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { StarForm } from '@/components/admin/star-form';
import { updateStar } from '@/firebase/firestore/stars';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditStarPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const starRef = firestore ? doc(firestore, 'stars', id) : null;
  const { data: star, isLoading } = useDoc<any>(starRef);

  const handleUpdateStar = async (data: any) => {
    if (!firestore) return;
    try {
      await updateStar(firestore, id, data);
      toast({
        title: 'Star Updated',
        description: 'The star profile has been successfully updated.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error updating star:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the star. Please try again.',
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

  if (!star) {
    return <div>Star not found.</div>;
  }

  const defaultValues = {
    ...star,
    genre: star.genre ? star.genre.join(', ') : '',
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
        Edit Star
      </h1>
      <StarForm onSubmit={handleUpdateStar} defaultValues={defaultValues} />
    </div>
  );
}
