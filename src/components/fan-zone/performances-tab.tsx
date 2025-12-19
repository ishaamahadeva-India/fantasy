
'use client';
import {
  topPerformances,
  popularStars,
  popularMovies,
} from '@/lib/placeholder-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function PerformancesTab() {
  const performances = topPerformances
    .map((perf) => {
      const star = popularStars.find((s) => s.id === perf.starId);
      const movie = popularMovies.find((m) => m.id === perf.movieId);
      if (!star || !movie) return null;
      return { ...perf, star, movie };
    })
    .filter(Boolean)
    .sort((a, b) => b!.performanceScore - a!.performanceScore);

  if (performances.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No performances found.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Top Performances
        </CardTitle>
        <CardDescription>
          A curated list of the most impactful acting performances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {performances.map((perf, index) => (
            <li key={perf!.id}>
              <div className="flex flex-col sm:flex-row items-start gap-4 group">
                <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center shrink-0">
                        {index + 1}
                    </span>
                    <Link href={`/fan-zone/star/${perf!.star.id}`} className="shrink-0">
                         <Avatar className="w-16 h-16">
                            <AvatarImage src={perf!.star.avatar} alt={perf!.star.name} />
                            <AvatarFallback>{perf!.star.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className='flex-grow'>
                        <Link href={`/fan-zone/star/${perf!.star.id}`}>
                            <h3 className="font-bold font-headline text-lg group-hover:text-primary transition-colors">
                                {perf!.star.name}
                            </h3>
                        </Link>
                        <Link href={`/fan-zone/movie/${perf!.movie.id}`}>
                            <p className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">in {perf!.movie.title}</p>
                        </Link>
                        <p className='text-sm text-muted-foreground italic mt-1'>"{perf!.description}"</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-lg self-center sm:self-start shrink-0 ml-12 sm:ml-0">
                    <Star className="w-5 h-5 fill-current" />
                    <span>{perf!.performanceScore.toFixed(1)}</span>
                </div>
              </div>
              {index < performances.length - 1 && (
                <Separator className="mt-4" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

    