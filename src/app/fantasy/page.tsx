
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, Film, Shield } from 'lucide-react';
import Link from 'next/link';

export default function FantasyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fantasy League
        </h1>
        <p className="mt-2 text-muted-foreground">
          Engage with Movie and Cricket fantasy games.
        </p>
      </div>

       <div className="grid md:grid-cols-2 gap-6">
        <Link href="/fantasy/movie" className="group">
            <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20">
                <Film className="w-12 h-12 text-primary" />
                <h2 className="text-2xl font-bold font-headline mt-4">Movie Fantasy League</h2>
                <p className="mt-2 text-muted-foreground">Predict the lifecycle of a movie, from announcement to box office glory.</p>
                <Button asChild className="mt-6" variant="outline">
                    <div>Enter Movie Fantasy</div>
                </Button>
            </Card>
        </Link>
        <Link href="/fantasy/cricket" className="group">
            <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20">
                <Shield className="w-12 h-12 text-primary" />
                <h2 className="text-2xl font-bold font-headline mt-4">Cricket Fantasy</h2>
                <p className="mt-2 text-muted-foreground">A new format of role-based, inning-wise fantasy cricket.</p>
                <Button asChild className="mt-6" variant="outline">
                    <div>Enter Cricket Fantasy</div>
                </Button>
            </Card>
        </Link>
      </div>

       <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>Select a fantasy league, join a campaign or match, and make your predictions to climb the leaderboard!</p>
            </CardContent>
             <CardFooter className='flex-col gap-2'>
                <p className="text-xs text-muted-foreground/50">
                    All games are skill-based challenges. This platform does not involve betting, wagering, or games of chance. Open only to users aged 18 years and above.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
