'use client';

import { use } from 'react';
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
import { Bookmark, Gamepad2, Mic, PieChart, Lock } from 'lucide-react';
import { ScoreRating } from '@/components/fan-zone/score-rating';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import Link from 'next/link';

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

  if (!movie) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
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
                icon={Mic}
              />
              <Button variant="outline" size="lg">
                <Bookmark className="mr-2" /> Save to Watchlist
              </Button>
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
                See how other fans rated this movie. Upgrade to unlock full
                analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative grid md:grid-cols-2 gap-8 text-center p-8 rounded-lg bg-white/5">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Lock className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-headline text-xl mb-2">
                    Unlock Full Insights
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Game Pass for detailed analytics.
                  </p>
                  <Button>Unlock Game Pass</Button>
                </div>
                <div>
                  <h4 className="text-lg font-semibold font-headline">
                    Community Score
                  </h4>
                  <p className="text-5xl font-bold font-code text-primary/50">
                    8.4
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold font-headline">
                    Attribute Breakdown
                  </h4>
                  <div className="aspect-square relative w-full max-w-xs mx-auto opacity-40">
                    <Image
                      src="https://storage.googleapis.com/studioprod-assets/radar-chart-placeholder.svg"
                      alt="Attribute breakdown chart"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
