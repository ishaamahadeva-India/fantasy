'use client';

import { popularStars } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowRight, ArrowUp, BrainCircuit, Gamepad2, PieChart, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function StarProfilePage({ params: { id } }: { params: { id: string } }) {
  const star = popularStars.find((s) => s.id === id);

  if (!star) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-1">
                <Card className="overflow-hidden">
                    <div className="relative aspect-square w-full">
                        <Image
                        src={star.avatar}
                        alt={star.name}
                        fill
                        className="object-cover"
                        />
                    </div>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
                        {star.name}
                    </h1>
                     <div className="mt-2 flex items-center gap-2">
                        {star.genre.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <PieChart />
                           Fan Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Popularity Index</p>
                            <p className="text-3xl font-bold font-code">88.2</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Consistency Score</p>
                            <p className="text-3xl font-bold font-code">9.1</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Trend</p>
                            <p className="text-3xl font-bold font-code flex items-center justify-center text-green-400"><ArrowUp /></p>
                        </div>
                    </CardContent>
                </Card>

                <Separator />
                
                <div className='space-y-4'>
                    <h3 className="font-headline text-xl">Fan Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Button variant="outline" size="lg"><Star className="mr-2"/> Rate Performance</Button>
                        <Button variant="outline" size="lg"><BrainCircuit className="mr-2"/> Compare Eras</Button>
                        <Button variant="outline" size="lg"><Gamepad2 className="mr-2"/> Pulse Check</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

    