
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useCollection } from '@/firebase';
import type { UserProfile, FantasyCampaign, Movie } from '@/lib/types';
import { doc, collection, query, where, or, orderBy } from 'firebase/firestore';
import { DisclaimerModal } from '@/components/fantasy/disclaimer-modal';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type FantasyCampaignWithId = FantasyCampaign & { id: string };
type MovieWithId = Movie & { id: string };

function MovieFantasyContent({ 
    campaigns, 
    isLoading, 
    movies 
}: { 
    campaigns: FantasyCampaignWithId[] | undefined; 
    isLoading: boolean;
    movies: MovieWithId[] | undefined;
}) {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-6 w-3/4 mt-2" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!campaigns || campaigns.length === 0) {
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
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-muted-foreground">
                                No active movie campaigns at the moment. Check back soon!
                            </p>
                        </CardContent>
                    </Card>
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

    const getMovieTitles = (campaign: FantasyCampaignWithId): string[] => {
        if (campaign.campaignType === 'single_movie' && campaign.movieTitle) {
            return [campaign.movieTitle];
        }
        if (campaign.campaignType === 'multiple_movies' && campaign.movies && campaign.movies.length > 0) {
            // Fetch movie titles from the movies array
            return campaign.movies.map((m) => {
                if (m.movieTitle) {
                    return m.movieTitle;
                }
                // Try to find movie in the movies collection
                if (m.movieId && movies) {
                    const movie = movies.find((mov) => mov.id === m.movieId);
                    if (movie) {
                        return `${movie.title}${movie.releaseYear ? ` (${movie.releaseYear})` : ''}`;
                    }
                }
                return 'Unknown Movie';
            });
        }
        return ['Movie Campaign'];
    };

    const getEventCount = (campaign: FantasyCampaignWithId): number => {
        return campaign.events?.length || 0;
    };

    const getStatusDisplay = (status: string): string => {
        switch (status) {
            case 'upcoming':
                return 'Upcoming';
            case 'active':
                return 'Active';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

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
                    {campaigns.map((campaign) => {
                        const movieTitles = getMovieTitles(campaign);
                        const eventCount = getEventCount(campaign);
                        const statusDisplay = getStatusDisplay(campaign.status);
                        
                        return (
                            <Card key={campaign.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl">{campaign.title}</CardTitle>
                                    <CardDescription>
                                        Status: {statusDisplay} | {eventCount} Prediction Events
                                        {movieTitles.length > 0 && (
                                            <span className="block mt-1">
                                                {movieTitles.length === 1 
                                                    ? movieTitles[0]
                                                    : `${movieTitles.length} Movies`
                                                }
                                            </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    {campaign.prizePool && (
                                        <div className="flex items-center gap-2 text-primary">
                                            <Ticket className="w-5 h-5"/>
                                            <span className="font-semibold">{campaign.prizePool}</span>
                                        </div>
                                    )}
                                    {campaign.description && (
                                        <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                                            {campaign.description}
                                        </p>
                                    )}
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
                        );
                    })}
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
    const { data: userProfile, isLoading: profileLoading } = useDoc(userProfileRef);
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    // Query for movie campaigns (single_movie or multiple_movies)
    // We'll filter by status client-side since Firestore doesn't support nested or() queries easily
    const campaignsQuery = useMemo(() => {
        if (!firestore) return null;
        const campaignsRef = collection(firestore, 'fantasy-campaigns');
        return query(
            campaignsRef,
            or(
                where('campaignType', '==', 'single_movie'),
                where('campaignType', '==', 'multiple_movies')
            ),
            orderBy('startDate', 'desc')
        );
    }, [firestore]);

    const { data: campaignsData, isLoading: campaignsLoading } = useCollection(campaignsQuery);
    
    // Fetch all movies for displaying movie titles
    const moviesQuery = useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'movies');
    }, [firestore]);
    
    const { data: moviesData } = useCollection(moviesQuery);
    const movies = moviesData as MovieWithId[] | undefined;
    
    // Filter campaigns client-side to only show upcoming or active ones, and public visibility
    const campaigns = useMemo(() => {
        if (!campaignsData) return undefined;
        return (campaignsData as FantasyCampaignWithId[])
            .filter(campaign => 
                (campaign.status === 'upcoming' || campaign.status === 'active') &&
                (campaign.visibility === 'public' || !campaign.visibility) // Show public campaigns or campaigns without visibility set (default to public)
            );
    }, [campaignsData]);

    useEffect(() => {
        if (!profileLoading && userProfile) {
            if (!userProfile.ageVerified || !userProfile.fantasyEnabled) {
                setShowDisclaimer(true);
            }
        }
    }, [profileLoading, userProfile]);

    if (profileLoading) {
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

    return <MovieFantasyContent campaigns={campaigns} isLoading={campaignsLoading} movies={movies} />;
}
