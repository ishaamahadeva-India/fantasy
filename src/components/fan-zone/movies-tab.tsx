'use client';
import { popularMovies } from '@/lib/placeholder-data';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export function MoviesTab({ searchTerm }: { searchTerm: string }) {
  const filteredMovies = popularMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredMovies.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No movies found.
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
                  src={movie.posterUrl}
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

    