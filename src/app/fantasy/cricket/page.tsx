
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import type { UserProfile, FantasyMatch } from '@/lib/types';
import { doc, collection } from 'firebase/firestore';
import { DisclaimerModal } from '@/components/fantasy/disclaimer-modal';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type FantasyMatchWithId = FantasyMatch & { id: string };

function CricketFantasyContent() {
    const firestore = useFirestore();
    const matchesQuery = firestore ? collection(firestore, 'fantasy_matches') : null;
    const { data: activeMatches, isLoading } = useCollection<FantasyMatchWithId>(matchesQuery);

    if (isLoading) {
        return (
            <div className='grid md:grid-cols-2 gap-6'>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }
    
    if (!activeMatches || activeMatches.length === 0) {
        return (
            <Card>
                <CardContent className="text-center p-12 text-muted-foreground">
                    No active matches right now. Check back later!
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeMatches.map((match) => (
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
                    <Link href={`/fantasy/cricket/match/${match.id}`}>
                        {match.status === 'live' ? 'Enter Match' : 'Match Opens Soon'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    );
}


export default function CricketFantasyPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    useEffect(() => {
        if (!isLoading && userProfile) {
            if (!userProfile.ageVerified || !userProfile.fantasyEnabled) {
                setShowDisclaimer(true);
            }
        }
    }, [isLoading, userProfile]);

    if (isLoading) {
        return (
            <div className='space-y-8'>
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <div className='grid md:grid-cols-2 gap-6 mt-8'>
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (showDisclaimer) {
        return <DisclaimerModal />;
    }

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
                <CricketFantasyContent />
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
