'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';

// Placeholder data for upcoming contests
const upcomingContests = [
    {
        id: 'contest-1',
        title: 'Devara: Part 1 - Release Week',
        movies: ['Devara: Part 1'],
        prizePool: 'Vouchers & 1,00,000 Intel Points',
        endsIn: '3 days',
    },
    {
        id: 'contest-2',
        title: 'Pushpa 2 vs The Rule - Grand Clash',
        movies: ['Pushpa 2', 'Singham Again'],
        prizePool: 'Grand Prize: 4K TV & Vouchers',
        endsIn: '10 days',
    },
];

export default function FantasyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fantasy Movie League
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create your team, predict the performance, and win big.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-headline">Upcoming Contests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingContests.map((contest) => (
            <Card key={contest.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{contest.title}</CardTitle>
                <CardDescription>
                  Ends in: {contest.endsIn}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 text-primary">
                    <Ticket className="w-5 h-5"/>
                    <span className="font-semibold">{contest.prizePool}</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  This is a skill-based fantasy prediction game. No element of chance.
                </p>
              </CardContent>
              <CardFooter>
                 <Button className="w-full" disabled>
                    Drafting Starts Soon
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
       <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>1. Select an upcoming movie contest.</p>
                <p>2. Create your fantasy team of stars and crew within the 100-credit budget.</p>
                <p>3. Watch the points roll in based on real-world performance!</p>
            </CardContent>
        </Card>

    </div>
  );
}
