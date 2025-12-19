
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Ticket, Users, Shield } from 'lucide-react';
import Link from 'next/link';

const activeMatches = [
    {
        id: 'match-1',
        title: 'IND vs AUS',
        series: 'T20 World Cup Final',
        status: 'Live',
        prizePool: '50,000 Intel Points',
    },
    {
        id: 'match-2',
        title: 'CSK vs MI',
        series: 'IPL 2025 Opener',
        status: 'Upcoming',
        prizePool: '1,00,000 Intel Points',
    },
];

export default function CricketFantasyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Cricket Fantasy
        </h1>
        <p className="mt-2 text-muted-foreground">
          Play the new inning-wise, role-based fantasy game.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-headline">Active Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeMatches.map((match) => (
            <Card key={match.id} className="flex flex-col">
              <CardHeader>
                <div className='flex justify-between items-center'>
                    <CardTitle className="font-headline text-2xl">{match.title}</CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${match.status === 'Live' ? 'bg-red-500/20 text-red-400' : 'bg-secondary'}`}>{match.status}</span>
                </div>
                <CardDescription>
                  {match.series}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 text-primary">
                    <Ticket className="w-5 h-5"/>
                    <span className="font-semibold">{match.prizePool}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" disabled={match.status === 'Upcoming'}>
                    <Link href={`/fantasy/cricket/match/${match.id}`}>
                        {match.status === 'Live' ? 'Enter Match' : 'Match Opens Soon'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
       <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground max-w-2xl mx-auto">
                <p>1. Select an active match and choose key roles for each innings.</p>
                <p>2. Make live micro-predictions during the match to score points.</p>
                <p>3. Climb the live leaderboard and win bragging rights!</p>
            </CardContent>
            <CardFooter className='flex-col gap-2'>
                 <p className="text-xs text-muted-foreground/50">
                    This is a skill-based cricket strategy game with no element of chance.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
