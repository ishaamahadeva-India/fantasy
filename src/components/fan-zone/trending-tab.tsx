
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Movie, Star } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingTab() {
    const firestore = useFirestore();

    const trendingMoviesQuery = firestore ? query(collection(firestore, 'movies'), orderBy('trendingRank'), limit(5)) : null;
    const trendingStarsQuery = firestore ? query(collection(firestore, 'stars'), orderBy('trendingRank'), limit(5)) : null;

    const { data: trendingMovies, isLoading: moviesLoading } = useCollection<Movie>(trendingMoviesQuery);
    const { data: trendingStars, isLoading: starsLoading } = useCollection<Star>(trendingStarsQuery);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Flame className="text-primary" /> Trending Movies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {moviesLoading && [...Array(5)].map((_, i) => (
                <li key={i}><Skeleton className="h-20 w-full" /></li>
            ))}
            {trendingMovies?.map((movie, index) => (
              <li key={movie.id}>
                <Link href={`/fan-zone/movie/${movie.id}`} className="group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center">
                      {index + 1}
                    </span>
                    <div className="relative w-16 h-24 shrink-0">
                      <Image
                        src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/200/300`}
                        alt={movie.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold font-headline text-lg leading-tight group-hover:text-primary">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {movie.releaseYear}
                      </p>
                    </div>
                  </div>
                </Link>
                {index < trendingMovies.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Flame className="text-primary" /> Trending Stars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
             {starsLoading && [...Array(5)].map((_, i) => (
                <li key={i}><Skeleton className="h-20 w-full" /></li>
            ))}
            {trendingStars?.map((star, index) => (
              <li key={star.id}>
                <Link href={`/fan-zone/star/${star.id}`} className="group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center">
                      {index + 1}
                    </span>
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={star.avatar || `https://picsum.photos/seed/${star.id}/200/200`} alt={star.name} />
                      <AvatarFallback>{star.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold font-headline text-lg leading-tight group-hover:text-primary">
                        {star.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {star.genre?.join(' · ')}
                      </p>
                    </div>
                  </div>
                </Link>
                {index < trendingStars.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
