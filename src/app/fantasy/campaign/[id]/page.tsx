
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, ListOrdered, Lock, Trophy, ArrowLeft, User, Award, Building } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SocialShare } from '@/components/social-share';
import { useDoc, useFirestore, useCollection, useUser } from '@/firebase';
import { doc, collection, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import type { FantasyCampaign, FantasyEvent } from '@/lib/types';

type FantasyCampaignWithId = FantasyCampaign & { id: string };
type FantasyEventWithId = FantasyEvent & { id: string };

// Helper function to convert various date types to Date
function toDate(dateValue: any): Date {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (dateValue instanceof Timestamp) return dateValue.toDate();
    if (dateValue && typeof dateValue.toDate === 'function') return dateValue.toDate();
    if (typeof dateValue === 'number') return new Date(dateValue);
    if (typeof dateValue === 'string') return new Date(dateValue);
    return new Date();
}

function EventCard({ event, campaignId }: { event: FantasyEventWithId; campaignId: string }) {
    // Determine event status based on dates
    const now = new Date();
    const startDate = toDate(event.startDate);
    const endDate = event.endDate ? toDate(event.endDate) : null;
    
    const isCompleted = event.status === 'completed' || (endDate && now > endDate);
    const isLive = event.status === 'live' || (startDate <= now && (!endDate || now <= endDate));
    const isUpcoming = event.status === 'upcoming' || (startDate > now);

    // Calculate time remaining for live events
    const getTimeRemaining = () => {
        if (!endDate) return null;
        const diff = endDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'Less than a minute';
    };

    // Use direct points property or basePoints from pointsConfig
    const points = event.points || event.pointsConfig?.basePoints || 0;
    // TODO: Fetch user's actual score from their predictions/participations

    return (
        <Card className={`overflow-hidden flex flex-col ${isCompleted ? 'bg-white/5' : ''}`}>
            <CardHeader>
                <CardTitle className="text-lg font-headline">{event.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {isLive && (
                        <div className="flex items-center gap-1 text-red-400">
                            <Clock className="w-4 h-4" />
                            <span>Ends in {getTimeRemaining() || 'soon'}</span>
                        </div>
                    )}
                    {isUpcoming && (
                         <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4" />
                            <span>Awaiting Event Start</span>
                        </div>
                    )}
                     {isCompleted && (
                         <div className="flex items-center gap-1 text-green-400">
                            <Check className="w-4 h-4" />
                            <span>Completed</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex items-center gap-2 text-amber-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-semibold">{points} Points</span>
                </div>
                {event.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}
            </CardContent>
            <CardContent>
                <Button asChild className="w-full" disabled={isUpcoming}>
                    <Link href={`/fantasy/campaign/${campaignId}/event/${event.id}`}>
                        {isLive && 'Make Prediction'}
                        {isCompleted && 'View Results'}
                        {isUpcoming && 'Prediction Opens Soon'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function FantasyMovieCampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch campaign
  const campaignRef = firestore ? doc(firestore, 'fantasy-campaigns', campaignId) : null;
  const { data: campaign, isLoading: campaignLoading } = useDoc(campaignRef);

  // Fetch events from subcollection
  const eventsRef = firestore
    ? collection(firestore, 'fantasy-campaigns', campaignId, 'events')
    : null;
  const { data: eventsData, isLoading: eventsLoading } = useCollection(eventsRef);
  const events = eventsData as FantasyEventWithId[] | undefined;

  // Categorize events by status
  const categorizedEvents = useMemo(() => {
    if (!events) return { live: [], upcoming: [], completed: [] };
    
    const now = new Date();
    const live: FantasyEventWithId[] = [];
    const upcoming: FantasyEventWithId[] = [];
    const completed: FantasyEventWithId[] = [];

    events.forEach(event => {
      const startDate = toDate(event.startDate);
      const endDate = event.endDate ? toDate(event.endDate) : null;
      
      if (event.status === 'completed' || (endDate && now > endDate)) {
        completed.push(event);
      } else if (event.status === 'live' || (startDate <= now && (!endDate || now <= endDate))) {
        live.push(event);
      } else {
        upcoming.push(event);
      }
    });

    return { live, upcoming, completed };
  }, [events]);

  // Get movie title(s)
  const getMovieTitle = (campaign: FantasyCampaignWithId): string => {
    if (campaign.campaignType === 'single_movie' && campaign.movieTitle) {
      return campaign.movieTitle;
    }
    if (campaign.campaignType === 'multiple_movies' && campaign.movies && campaign.movies.length > 0) {
      return `${campaign.movies.length} Movie${campaign.movies.length > 1 ? 's' : ''}`;
    }
    return 'Movie Campaign';
  };

  if (campaignLoading || eventsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Campaign Not Found
        </h1>
        <p className="text-muted-foreground">The campaign you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/fantasy/movie">Back to All Campaigns</Link>
        </Button>
      </div>
    );
  }

  const campaignWithId = campaign as FantasyCampaignWithId;
  const movieTitle = getMovieTitle(campaignWithId);
  // TODO: Calculate total points from user's actual predictions/participations
  const totalPoints = 0;
  
  // TODO: Fetch actual leaderboard data from Firestore
  const leaderboardData: { name: string; score: number; rank: number }[] = [
    { name: 'You', score: totalPoints, rank: 1 }
  ];

  const currentUserRank = leaderboardData.find(p => p.name === 'You')?.rank || 1;

  return (
    <div className="space-y-8">
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 -ml-2 md:-ml-4'>
            <Button variant="ghost" asChild>
                <Link href="/fantasy/movie">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Back to All Campaigns</span>
                    <span className="sm:hidden">Back</span>
                </Link>
            </Button>
            <SocialShare
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={campaignWithId.title}
              description={`Join the ${movieTitle} fantasy campaign!${campaignWithId.prizePool ? ` Prize Pool: ${campaignWithId.prizePool}` : ''}`}
              imageUrl={campaignWithId.sponsorLogo}
              variant="outline"
            />
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-8">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    {campaignWithId.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Predict events for <span className="font-semibold text-primary">{movieTitle}</span> and win big.
                </p>
                {campaignWithId.prizePool && (
                    <div className="mt-4 flex items-center gap-2 text-primary">
                        <Trophy className="w-5 h-5"/>
                        <span className="font-semibold">{campaignWithId.prizePool}</span>
                    </div>
                )}
                {campaignWithId.description && (
                    <p className="mt-4 text-muted-foreground">{campaignWithId.description}</p>
                )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <Card className="text-center p-4">
                    <CardDescription>Total Points</CardDescription>
                    <CardTitle className="font-code text-4xl text-primary">{totalPoints}</CardTitle>
                </Card>
                 <Card className="text-center p-4">
                    <CardDescription>Your Rank</CardDescription>
                    <CardTitle className="font-code text-4xl text-primary">#{currentUserRank}</CardTitle>
                </Card>
            </div>
        </div>

        {campaignWithId.sponsorName && (
            <Card className="p-4 bg-gradient-to-r from-primary/10 via-background to-background border-primary/20">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                    <span className="text-xs font-semibold tracking-widest uppercase text-primary">Sponsored By</span>
                    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                        <Building className='w-6 h-6 text-primary'/> {campaignWithId.sponsorName}
                    </div>
                </div>
            </Card>
        )}

        <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="events">Prediction Events</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="mt-6">
                <div className="space-y-8">
                    <div className='space-y-4'>
                        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <Trophy className="text-primary"/> Live Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categorizedEvents.live.length > 0 ? (
                                categorizedEvents.live.map(event => (
                                    <EventCard key={event.id} event={event} campaignId={campaignId} />
                                ))
                            ) : (
                                <Card className='col-span-full p-6 text-muted-foreground'>
                                    No live events right now. Check back soon!
                                </Card>
                            )}
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <Clock className="text-primary"/> Upcoming Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categorizedEvents.upcoming.length > 0 ? (
                                categorizedEvents.upcoming.map(event => (
                                    <EventCard key={event.id} event={event} campaignId={campaignId} />
                                ))
                            ) : (
                                <Card className='col-span-full p-6 text-muted-foreground'>
                                    No upcoming events scheduled.
                                </Card>
                            )}
                        </div>
                    </div>
                    
                    <div className='space-y-4'>
                        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <ListOrdered className="text-primary"/> Completed Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categorizedEvents.completed.length > 0 ? (
                                categorizedEvents.completed.map(event => (
                                    <EventCard key={event.id} event={event} campaignId={campaignId} />
                                ))
                            ) : (
                                <Card className='col-span-full p-6 text-muted-foreground'>
                                    No completed events yet.
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Campaign Leaderboard</CardTitle>
                        <CardDescription>
                            Top predictors for the {movieTitle} campaign
                            {campaignWithId.sponsorName && `, powered by ${campaignWithId.sponsorName}`}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {leaderboardData.length > 0 ? (
                                leaderboardData.map((player) => (
                                    <div key={player.rank} className={`flex items-center p-4 rounded-lg ${player.name === 'You' ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}>
                                        <div className="flex items-center gap-4 w-full">
                                            <span className="font-bold font-code text-lg w-8 text-center text-muted-foreground">
                                                {player.rank}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <User className="w-6 h-6 text-muted-foreground"/>
                                                <span className="font-semibold">{player.name}</span>
                                            </div>
                                            <div className="ml-auto flex items-center gap-2 font-bold font-code text-primary text-lg">
                                                <Award className="w-5 h-5 text-amber-400" />
                                                {player.score}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Card className='p-6 text-muted-foreground text-center'>
                                    No leaderboard data available yet.
                                </Card>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
