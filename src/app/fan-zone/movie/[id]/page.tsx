'use client';

import { popularMovies } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bookmark, Gamepad2, Mic, PieChart, Star } from 'lucide-react';

export default function MovieProfilePage({ params: { id } }: { params: { id: string } }) {
  const movie = popularMovies.find((m) => m.id === id);

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
                
                <div className='space-y-4'>
                    <h3 className="font-headline text-xl">User Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button variant="outline" size="lg"><Star className="mr-2"/> Score Movie</Button>
                        <Button variant="outline" size="lg"><Mic className="mr-2"/> Rate Attributes</Button>
                        <Button variant="outline" size="lg"><Bookmark className="mr-2"/> Save to Watchlist</Button>
                        <Button variant="outline" size="lg"><Gamepad2 className="mr-2"/> Activate Quiz</Button>
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <PieChart />
                           Community Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-center py-8 text-muted-foreground'>
                            <p>Unlock Game Pass to see full community scores and attribute breakdowns.</p>
                             <Button className="mt-4">Unlock Game Pass</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

    