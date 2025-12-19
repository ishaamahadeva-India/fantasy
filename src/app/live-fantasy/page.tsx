
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';

// Placeholder data for live fantasy matches
const liveMatches = [
    {
        id: 'live-match-1',
        title: 'IND vs AUS',
        series: 'T20 World Cup Final',
        status: 'Live',
        prizePool: '1,50,000 Intel Points',
    },
    {
        id: 'live-match-2',
        title: 'CSK vs MI',
        series: 'IPL 2025 Opener',
        status: 'Upcoming',
        prizePool: '2,00,000 Intel Points',
    },
];

export default function LiveFantasyPage() {
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-headline">Live Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveMatches.map((match) => (
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
                    <Link href={`/live-fantasy/${match.id}`}>
                        {match.status === 'Live' ? 'Enter Live Match' : 'Match Opens Soon'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
       <Card className="text-center bg-transparent border-dashed">
            <CardHeader>
                <CardTitle className="font-headline">A Game of Skill</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground max-w-3xl mx-auto space-y-2">
                <p>This is a skill-based cricket strategy and prediction game. Outcomes depend entirely on the user’s knowledge, judgment, and timing. Success in this game depends on the participant’s understanding of cricket, analytical skills, and ability to make strategic decisions. There is no element of chance or randomness involved.</p>
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
