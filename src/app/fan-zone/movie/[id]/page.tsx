
'use client';

import { useMemo, useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
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
import { Gamepad2, PieChart, ArrowLeft, Star } from 'lucide-react';
import { ScoreRating } from '@/components/fan-zone/score-rating';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import Link from 'next/link';
import { SocialShare } from '@/components/social-share';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { FanRating, UserProfile, Movie } from '@/lib/types';
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

function MovieProfileSkeleton() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6"><Skeleton className="h-8 w-48" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-[2/3] w-full" />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Separator />
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                    <Card><CardContent className="p-4"><Skeleton className="h-48" /></CardContent></Card>
                </div>
            </div>
        </div>
    )
}

export default function MovieProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const movieAttributes = ['Direction', 'Screenplay', 'Acting', 'Music Impact'];
  
  const firestore = useFirestore();
  const { user } = useUser();

  const movieRef = firestore ? doc(firestore, 'movies', id) : null;
  const { data: movie, isLoading: movieLoading } = useDoc(movieRef);

  const ratingsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ratings'),
      where('entityId', '==', id),
      where('entityType', '==', 'movie')
    );
  }, [firestore, id]);

  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;

  const { data: ratings, isLoading: ratingsLoading } = useCollection(ratingsQuery);
  const { data: userProfile, isLoading: userProfileLoading } = useDoc(userProfileRef);

  if (movieLoading) {
    return <MovieProfileSkeleton />;
  }

  if (!movie) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button variant="ghost" asChild className="-ml-2 md:-ml-0">
                <Link href="/fan-zone/movies">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Back to Movie Zone</span>
                    <span className="sm:hidden">Back</span>
                </Link>
            </Button>
            <SocialShare
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={`${movie.title} (${movie.releaseYear})`}
              description={movie.description || `Check out ${movie.title}`}
              imageUrl={movie.posterUrl}
              variant="outline"
            />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/400/600`}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
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
            <div className="mt-2 flex items-center gap-4 text-muted-foreground flex-wrap">
              <span>{movie.releaseYear}</span>
              <Badge variant="outline">{movie.genre}</Badge>
              <Badge variant="secondary">{movie.industry}</Badge>
              {movie.imdbRating && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {movie.imdbRating.toFixed(1)} IMDb
                </Badge>
              )}
            </div>
          </div>

          <p className="text-lg text-muted-foreground">{movie.description}</p>

          {(movie.director || movie.cast || movie.runtime || movie.language) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {movie.director && (
                <div>
                  <p className="text-sm text-muted-foreground">Director</p>
                  <p className="font-semibold">{movie.director}</p>
                </div>
              )}
              {movie.cast && (
                <div>
                  <p className="text-sm text-muted-foreground">Cast</p>
                  <p className="font-semibold text-sm">{movie.cast}</p>
                </div>
              )}
              {movie.runtime && (
                <div>
                  <p className="text-sm text-muted-foreground">Runtime</p>
                  <p className="font-semibold">{movie.runtime}</p>
                </div>
              )}
              {movie.language && (
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-semibold">{movie.language}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-xl">User Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ScoreRating entityId={id} entityType="movie" />
              <AttributeRating
                triggerButtonText="Rate Attributes"
                attributes={movieAttributes}
                entityId={movie.id}
                entityType="movie"
              />
              <WatchlistButton movieId={movie.id} userProfile={(userProfile as any) as UserProfile | null} />
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
              <CommunityInsightDisplay ratings={ratings as any as FanRating[] | null} isLoading={ratingsLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
