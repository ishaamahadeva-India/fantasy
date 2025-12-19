'use client';
import { popularMovies, popularStars } from '@/lib/placeholder-data';
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

export function TrendingTab() {
  const trendingMovies = [...popularMovies]
    .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
    .slice(0, 5);
  const trendingStars = [...popularStars]
    .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
    .slice(0, 5);

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
            {trendingMovies.map((movie, index) => (
              <li key={movie.id}>
                <Link href={`/fan-zone/movie/${movie.id}`} className="group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center">
                      {index + 1}
                    </span>
                    <div className="relative w-16 h-24 shrink-0">
                      <Image
                        src={movie.posterUrl}
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
            {trendingStars.map((star, index) => (
              <li key={star.id}>
                <Link href={`/fan-zone/star/${star.id}`} className="group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center">
                      {index + 1}
                    </span>
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={star.avatar} alt={star.name} />
                      <AvatarFallback>{star.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold font-headline text-lg leading-tight group-hover:text-primary">
                        {star.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {star.genre.join(' · ')}
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
