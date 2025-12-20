
'use client';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MovieForm } from '@/components/admin/movie-form';
import { updateMovie } from '@/firebase/firestore/movies';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditMoviePage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const router = useRouter();
  const movieRef = firestore ? doc(firestore, 'movies', params.id) : null;
  const { data: movie, isLoading } = useDoc<any>(movieRef);

  const handleUpdateMovie = async (data: any) => {
    if (!firestore) return;
    try {
      await updateMovie(firestore, params.id, data);
      toast({
        title: 'Movie Updated',
        description: 'The movie profile has been successfully updated.',
      });
      router.push('/admin/fanzone');
    } catch (error) {
      console.error('Error updating movie:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the movie. Please try again.',
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

  if (!movie) {
    return <div>Movie not found.</div>;
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
        Edit Movie
      </h1>
      <MovieForm onSubmit={handleUpdateMovie} defaultValues={movie} />
    </div>
  );
}
