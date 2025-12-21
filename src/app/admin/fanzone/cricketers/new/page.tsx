
'use client';

import { CricketerForm } from '@/components/admin/cricketer-form';
import { addCricketer } from '@/firebase/firestore/cricketers';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewCricketerPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateCricketer = async (data: any) => {
    if (!firestore) return;
    try {
      await addCricketer(firestore, data);
      toast({
        title: 'Cricketer Created',
        description: 'The new cricketer profile has been successfully saved.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error creating cricketer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the cricketer. Please try again.',
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
        Add New Cricketer
      </h1>
      <CricketerForm onSubmit={handleCreateCricketer} />
    </div>
  );
}

