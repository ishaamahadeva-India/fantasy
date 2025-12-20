'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FantasyMatch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

type FantasyMatchWithId = FantasyMatch & { id: string };

// Placeholder data with examples for all formats
const placeholderMatches: FantasyMatchWithId[] = [
    {
        id: 'match-1',
        matchName: 'IND vs AUS - T20 World Cup',
        format: 'T20',
        teams: ['IND', 'AUS'],
        startTime: new Date(),
        status: 'live'
    },
    {
        id: 'match-2',
        matchName: 'CSK vs MI - IPL Final',
        format: 'T20', // IPL is a T20 format
        teams: ['CSK', 'MI'],
        startTime: new Date(),
        status: 'live'
    },
    {
        id: 'match-3',
        matchName: 'ENG vs SA - ODI Series',
        format: 'ODI',
        teams: ['ENG', 'SA'],
        startTime: new Date(),
        status: 'upcoming'
    },
    {
        id: 'match-4',
        matchName: 'NZ vs WI - Test Championship',
        format: 'Test',
        teams: ['NZ', 'WI'],
        startTime: new Date(),
        status: 'upcoming'
    }
];


function MatchList({ matches, isLoading }: { matches: FantasyMatchWithId[] | null, isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!matches || matches.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                    No matches available in this category.
                </CardContent>
            </Card>
        )
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="flex flex-col">
              <CardHeader>
                <div className='flex justify-between items-center'>
                    <CardTitle className="font-headline text-2xl">{match.matchName}</CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${match.status === 'live' ? 'bg-red-500/20 text-red-400' : 'bg-secondary'}`}>{match.status}</span>
                </div>
                <CardDescription>
                  {match.format}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 text-primary">
                    <Ticket className="w-5 h-5"/>
                    <span className="font-semibold">Prize Pool Active</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" disabled={match.status === 'upcoming'}>
                    <Link href={`/live-fantasy/${match.id}`}>
                        {match.status === 'live' ? 'Enter Live Match' : 'Match Opens Soon'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
    )
}


export default function LiveFantasyPage() {
  const allMatches = placeholderMatches;
  const isLoading = false; // Using placeholder data, so not loading.

  const filterMatches = (format: string | null) => {
    if (!allMatches) return [];
    if (!format) return allMatches;
    if (format === 'T20') {
      // Include both standard T20 and IPL which is a T20 format
      return allMatches.filter(m => m.format === 'T20' || m.matchName.toLowerCase().includes('ipl'));
    }
    return allMatches.filter(m => m.format === format);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Live Skill-Based Fantasy
        </h1>
        <p className="mt-2 text-muted-foreground">
          A new era of live fantasy cricket. Make predictions during the match, not before.
        </p>
      </div>

       <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="t20">T20 / IPL</TabsTrigger>
          <TabsTrigger value="odi">ODI</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
            <MatchList matches={filterMatches(null)} isLoading={isLoading} />
        </TabsContent>
         <TabsContent value="t20" className="mt-6">
            <MatchList matches={filterMatches('T20')} isLoading={isLoading} />
        </TabsContent>
         <TabsContent value="odi" className="mt-6">
            <MatchList matches={filterMatches('ODI')} isLoading={isLoading} />
        </TabsContent>
         <TabsContent value="test" className="mt-6">
            <MatchList matches={filterMatches('Test')} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
      
       <Card className="text-center bg-transparent border-dashed">
            <CardHeader>
                <CardTitle className="font-headline text-lg">A Game of Skill</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground max-w-3xl mx-auto space-y-2">
                <p>This is a skill-based cricket strategy and prediction game. Outcomes depend on the user’s knowledge, analysis, and timing. There is no element of chance or randomness.</p>
                <p>This platform does not involve betting, wagering, or games of chance.</p>
            </CardContent>
            <CardFooter className='flex-col gap-2'>
                 <p className="text-xs text-muted-foreground/50">
                    This game is open only to users aged 18 years and above.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
