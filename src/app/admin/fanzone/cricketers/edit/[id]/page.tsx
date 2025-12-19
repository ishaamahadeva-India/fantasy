
'use client';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { CricketerForm } from '@/components/admin/cricketer-form';
import { updateCricketer } from '@/firebase/firestore/cricketers';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditCricketerPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const router = useRouter();
  const cricketerRef = firestore ? doc(firestore, 'cricketers', params.id) : null;
  const { data: cricketer, isLoading } = useDoc<any>(cricketerRef);

  const handleUpdateCricketer = async (data: any) => {
    if (!firestore) return;
    try {
      await updateCricketer(firestore, params.id, data);
      toast({
        title: 'Cricketer Updated',
        description: 'The cricketer profile has been successfully updated.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error updating cricketer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the cricketer. Please try again.',
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

  if (!cricketer) {
    return <div>Cricketer not found.</div>;
  }
  
  // Convert roles array back to a comma-separated string for the form
  const defaultValues = {
    ...cricketer,
    roles: cricketer.roles ? cricketer.roles.join(', ') : '',
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
        Edit Cricketer
      </h1>
      <CricketerForm onSubmit={handleUpdateCricketer} defaultValues={defaultValues} />
    </div>
  );
}
