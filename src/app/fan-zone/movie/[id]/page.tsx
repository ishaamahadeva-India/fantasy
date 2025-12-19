
'use client';

import { use, useMemo, useState, useEffect } from 'react';
import { popularMovies } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Gamepad2, Mic, PieChart, ArrowLeft } from 'lucide-react';
import { ScoreRating } from '@/components/fan-zone/score-rating';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { FanRating, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { WatchlistButton } from '@/components/fan-zone/watchlist-button';

function CommunityInsightDisplay({ ratings, isLoading }: { ratings: FanRating[] | null, isLoading: boolean }) {
    const movieAttributes = ['Direction', 'Screenplay', 'Acting', 'Music Impact'];
    const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});
    const [overallScore, setOverallScore] = useState(0);

    useEffect(() => {
        if (!ratings || ratings.length === 0) {
            setAverageRatings({});
            setOverallScore(0);
            return;
        }

        const newAverageRatings: Record<string, number> = {};
        let totalScore = 0;
        let ratingCount = 0;

        movieAttributes.forEach(attr => {
            const relevantRatings = ratings.map(r => r.ratings[attr]).filter(v => v !== undefined);
            if(relevantRatings.length > 0) {
                const sum = relevantRatings.reduce((acc, curr) => acc + curr, 0);
                const avg = sum / relevantRatings.length;
                newAverageRatings[attr] = avg;
                totalScore += sum;
                ratingCount += relevantRatings.length;
            }
        });
        setAverageRatings(newAverageRatings);

        // A simple overall score average
        const overall = totalScore / (ratingCount || 1);
        setOverallScore(overall);

    }, [ratings]);

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-8 text-center">
                <div>
                    <h4 className="text-lg font-semibold font-headline">Community Score</h4>
                    <Skeleton className="h-16 w-24 mx-auto mt-2" />
                </div>
                <div>
                     <h4 className="text-lg font-semibold font-headline">Attribute Breakdown</h4>
                     <Skeleton className="h-40 w-40 mx-auto mt-2" />
                </div>
            </div>
        )
    }
    
    if (!ratings || ratings.length === 0) {
        return <p className="text-center text-muted-foreground">Be the first to rate this movie!</p>
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 text-center">
            <div>
                <h4 className="text-lg font-semibold font-headline">Community Score</h4>
                <p className="text-5xl font-bold font-code text-primary">
                    {overallScore.toFixed(1)}
                </p>
            </div>
            <div>
                <h4 className="text-lg font-semibold font-headline mb-2">Attribute Breakdown</h4>
                <div className="space-y-2">
                {movieAttributes.map(attr => (
                    <div key={attr} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{attr}</span>
                        <span className="font-bold font-code">{averageRatings[attr] ? averageRatings[attr].toFixed(1) : '-'}</span>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}


export default function MovieProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params);
  const movie = popularMovies.find((m) => m.id === id);
  const movieAttributes = [
    'Direction',
    'Screenplay',
    'Acting',
    'Music Impact',
  ];
  
  const firestore = useFirestore();
  const { user } = useUser();

  const ratingsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ratings'),
      where('entityId', '==', id),
      where('entityType', '==', 'movie')
    );
  }, [firestore, id]);

  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;

  const { data: ratings, isLoading: ratingsLoading } = useCollection<FanRating>(ratingsQuery);
  const { data: userProfile, isLoading: userProfileLoading } = useDoc<UserProfile>(userProfileRef);

  if (!movie) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="mb-6">
            <Button variant="ghost" asChild>
                <Link href="/fan-zone/movies">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Movie Zone
                </Link>
            </Button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
              {movie.title}
            </h1>
            <div className="mt-2 flex items-center gap-4 text-muted-foreground">
              <span>{movie.releaseYear}</span>
              <Badge variant="outline">{movie.genre}</Badge>
            </div>
          </div>

          <p className="text-lg text-muted-foreground">{movie.description}</p>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-xl">User Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ScoreRating />
              <AttributeRating
                triggerButtonText="Rate Attributes"
                attributes={movieAttributes}
                entityId={movie.id}
                entityType="movie"
              />
              <WatchlistButton movieId={movie.id} userProfile={userProfile} />
              <Button variant="outline" size="lg" asChild>
                <Link href={`/fan-zone/movie/${movie.id}/quiz/start`}>
                  <Gamepad2 className="mr-2" /> Activate Quiz
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <PieChart />
                Community Insight
              </CardTitle>
              <CardDescription>
                See how other fans have rated this movie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunityInsightDisplay ratings={ratings} isLoading={ratingsLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
