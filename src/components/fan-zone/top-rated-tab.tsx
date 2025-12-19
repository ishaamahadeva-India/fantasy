
'use client';
import { popularMovies, popularStars } from '@/lib/placeholder-data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

export function TopRatedTab() {
  const topMovies = [...popularMovies].sort((a, b) => b.communityScore - a.communityScore).slice(0, 6);
  const topStars = [...popularStars].sort((a, b) => b.popularityIndex - a.popularityIndex).slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Top Rated Movies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topMovies.map((movie) => (
            <Link href={`/fan-zone/movie/${movie.id}`} key={movie.id} className="group">
              <Card className="overflow-hidden h-full flex flex-col">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="relative aspect-[2/3] w-full">
                    <Image
                      src={movie.posterUrl}
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
                      <span className="font-bold">{movie.communityScore.toFixed(1)}</span>
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
          {topStars.map((star) => (
            <Link href={`/fan-zone/star/${star.id}`} key={star.id} className="group">
              <Card className="text-center h-full">
                <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={star.avatar} alt={star.name} />
                    <AvatarFallback>{star.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold font-headline text-sm group-hover:text-primary flex-grow">
                    {star.name}
                  </h3>
                   <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold">{star.popularityIndex.toFixed(1)}</span>
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
