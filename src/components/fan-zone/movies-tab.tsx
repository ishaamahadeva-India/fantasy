
'use client';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import type { Movie } from '@/lib/types';
import { useMemo } from 'react';

export function MoviesTab({ searchTerm, industry }: { searchTerm: string, industry?: Movie['industry'] }) {
  const firestore = useFirestore();
  
  const moviesQuery = useMemo(() => {
    if (!firestore) return null;
    const moviesCollection = collection(firestore, 'movies');
    if (industry) {
      return query(moviesCollection, where('industry', '==', industry));
    }
    return collection(firestore, 'movies');
  }, [firestore, industry]);

  const { data: movies, isLoading } = useCollection<Movie>(moviesQuery);

  const filteredMovies =
    movies
      ?.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];
      
  if (isLoading) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                        <Skeleton className="aspect-[2/3] w-full" />
                         <div className="p-3 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  if (filteredMovies.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No movies found in this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredMovies.map((movie) => (
        <Link href={`/fan-zone/movie/${movie.id}`} key={movie.id} className="group">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/400/600`}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold font-headline text-sm truncate group-hover:text-primary">
                  {movie.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {movie.releaseYear}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

    