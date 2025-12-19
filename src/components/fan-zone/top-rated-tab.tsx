
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Movie, Star as StarType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function TopRatedTab() {
  const firestore = useFirestore();
  
  const topMoviesQuery = firestore ? query(collection(firestore, 'movies'), orderBy('communityScore', 'desc'), limit(6)) : null;
  const topStarsQuery = firestore ? query(collection(firestore, 'stars'), orderBy('popularityIndex', 'desc'), limit(6)) : null;

  const { data: topMovies, isLoading: moviesLoading } = useCollection<Movie>(topMoviesQuery);
  const { data: topStars, isLoading: starsLoading } = useCollection<StarType>(topStarsQuery);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Top Rated Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {moviesLoading && [...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden"><Skeleton className="aspect-[2/3] w-full" /></Card>
          ))}
          {topMovies?.map((movie) => (
            <Link href={`/fan-zone/movie/${movie.id}`} key={movie.id} className="group">
              <Card className="overflow-hidden h-full flex flex-col">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="relative aspect-[2/3] w-full">
                    <Image
                      src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/400/600`}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-bold font-headline text-sm truncate group-hover:text-primary flex-grow">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold">{movie.communityScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Top Rated Stars</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
           {starsLoading && [...Array(6)].map((_, i) => (
              <Card key={i} className="text-center">
                  <CardContent className="p-4 flex flex-col items-center gap-3">
                       <Skeleton className="w-24 h-24 rounded-full" />
                       <Skeleton className="h-5 w-20" />
                       <Skeleton className="h-4 w-12" />
                  </CardContent>
              </Card>
            ))}
          {topStars?.map((star) => (
            <Link href={`/fan-zone/star/${star.id}`} key={star.id} className="group">
              <Card className="text-center h-full">
                <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={star.avatar || `https://picsum.photos/seed/${star.id}/400/400`} alt={star.name} />
                    <AvatarFallback>{star.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold font-headline text-sm group-hover:text-primary flex-grow">
                    {star.name}
                  </h3>
                   <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold">{star.popularityIndex?.toFixed(1) || 'N/A'}</span>
                    </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
