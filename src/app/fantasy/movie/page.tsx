
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useUser, useDoc, useFirestore } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { DisclaimerModal } from '@/components/fantasy/disclaimer-modal';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Placeholder data for upcoming fantasy campaigns
const upcomingCampaigns = [
    {
        id: 'campaign-devara',
        title: 'Devara: Part 1 - The Full Campaign',
        movies: ['Devara: Part 1'],
        prizePool: 'Vouchers & 1,00,000 Intel Points',
        status: 'Ongoing',
        events: 8,
    },
    {
        id: 'campaign-pushpa2',
        title: 'Pushpa 2: The Rule - The Full Campaign',
        movies: ['Pushpa 2: The Rule'],
        prizePool: 'Grand Prize: 4K TV & Vouchers',
        status: 'Upcoming',
        events: 10,
    },
];

function MovieFantasyContent() {
    return (
         <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">
                Fantasy Movie League
                </h1>
                <p className="mt-2 text-muted-foreground">
                Predict the entire lifecycle of a movie, from announcement to box office glory.
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-headline">Active Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{campaign.title}</CardTitle>
                        <CardDescription>
                        Status: {campaign.status} | {campaign.events} Prediction Events
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex items-center gap-2 text-primary">
                            <Ticket className="w-5 h-5"/>
                            <span className="font-semibold">{campaign.prizePool}</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                        This is a skill-based fantasy prediction game. No element of chance.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href={`/fantasy/campaign/${campaign.id}`}>
                                View Campaign <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
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
                        <p>1. Select an active movie campaign.</p>
                        <p>2. Participate in prediction events throughout the movie's lifecycle (teasers, trailers, box office).</p>
                        <p>3. Accumulate points for each correct prediction and climb the leaderboard!</p>
                    </CardContent>
                </Card>

        </div>
    );
}

export default function MovieFantasyPage() {
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

    return <MovieFantasyContent />;
}
