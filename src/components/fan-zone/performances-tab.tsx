
'use client';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase';
import { getTopPerformances } from '@/firebase/firestore/performances';
import type { Movie, Star as StarType } from '@/lib/types';
import type { Performance } from '@/firebase/firestore/performances';
import { useEffect, useState } from 'react';

export function PerformancesTab() {
  const firestore = useFirestore();
  const [performances, setPerformances] = useState<Array<Performance & { star?: StarType; movie?: Movie }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchPerformances = async () => {
      setLoading(true);
      try {
        const topPerfs = await getTopPerformances(firestore, 20);
        
        // Fetch star and movie data for each performance
        const performancesWithDetails = await Promise.all(
          topPerfs.map(async (perf) => {
            const starRef = doc(firestore, 'stars', perf.starId);
            const movieRef = doc(firestore, 'movies', perf.movieId);
            
            // Note: We can't use useDoc in a loop, so we'll fetch directly
            // For now, we'll just use the performance data
            return perf;
          })
        );
        
        setPerformances(performancesWithDetails);
      } catch (error) {
        console.error('Error fetching performances:', error);
        // Fallback to empty array
        setPerformances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, [firestore]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Top Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-8 h-8" />
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (performances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Top Performances</CardTitle>
          <CardDescription>
            A curated list of the most impactful acting performances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            <p>No performances found.</p>
            <p className="text-sm mt-2">Performances will appear here once added in the admin panel.</p>
          </div>
        </CardContent>
      </Card>
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
            <li key={perf.id || index}>
              <div className="flex flex-col sm:flex-row items-start gap-4 group">
                <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center shrink-0">
                        {index + 1}
                    </span>
                    <Link href={`/fan-zone/star/${perf.starId}`} className="shrink-0">
                         <Avatar className="w-16 h-16">
                            <AvatarImage src={perf.star?.avatar || ''} alt={perf.star?.name || 'Star'} />
                            <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className='flex-grow'>
                        <Link href={`/fan-zone/star/${perf.starId}`}>
                            <h3 className="font-bold font-headline text-lg group-hover:text-primary transition-colors">
                                {perf.star?.name || `Star ${perf.starId.slice(0, 8)}`}
                            </h3>
                        </Link>
                        <Link href={`/fan-zone/movie/${perf.movieId}`}>
                            <p className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                              in {perf.movie?.title || `Movie ${perf.movieId.slice(0, 8)}`}
                            </p>
                        </Link>
                        {perf.role && (
                          <p className='text-sm text-muted-foreground mt-1'>Role: {perf.role}</p>
                        )}
                        {perf.notes && (
                          <p className='text-sm text-muted-foreground italic mt-1'>"{perf.notes}"</p>
                        )}
                    </div>
                </div>
                {perf.performanceRating && (
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-lg self-center sm:self-start shrink-0 ml-12 sm:ml-0">
                      <Star className="w-5 h-5 fill-current" />
                      <span>{perf.performanceRating.toFixed(1)}</span>
                  </div>
                )}
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
