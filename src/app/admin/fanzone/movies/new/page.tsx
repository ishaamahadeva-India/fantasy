
'use client';

import { MovieForm } from '@/components/admin/movie-form';
import { addMovie } from '@/firebase/firestore/movies';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewMoviePage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateMovie = async (data: any) => {
    if (!firestore) return;
    try {
      await addMovie(firestore, data);
      toast({
        title: 'Movie Created',
        description: 'The new movie has been successfully saved.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error creating movie:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the movie. Please try again.',
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
        Add New Movie
      </h1>
      <MovieForm onSubmit={handleCreateMovie} />
    </div>
  );
}
