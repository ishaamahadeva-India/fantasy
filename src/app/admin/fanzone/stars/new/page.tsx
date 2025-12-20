
'use client';

import { StarForm } from '@/components/admin/star-form';
import { addStar } from '@/firebase/firestore/stars';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewStarPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateStar = async (data: any) => {
    if (!firestore) return;
    try {
      await addStar(firestore, data);
      toast({
        title: 'Star Created',
        description: 'The new star profile has been successfully saved.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error creating star:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the star. Please try again.',
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
        Add New Star
      </h1>
      <StarForm onSubmit={handleCreateStar} />
    </div>
  );
}
