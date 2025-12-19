
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, ListOrdered, Lock, Trophy, ArrowLeft, User, Award } from 'lucide-react';
import Link from 'next/link';

// Placeholder Data
const campaignDetails = {
    id: 'campaign-devara',
    title: 'Devara: Part 1 - The Full Campaign',
    movie: {
        title: 'Devara: Part 1',
    },
    prizePool: 'Vouchers & 1,00,000 Intel Points'
};

const predictionEvents = [
    { id: 'event-1', title: 'First Look Views (24h)', status: 'Completed', score: 85, type: 'numeric_prediction' },
    { id: 'event-2', title: 'Teaser Release Date Prediction', status: 'Completed', score: 120, type: 'date_prediction' },
    { id: 'event-3', title: 'Trailer Views (24h)', status: 'Live', endsIn: '2 hours', type: 'numeric_prediction' },
    { id: 'event-4', title: 'First Song Streaming Milestone', status: 'Upcoming', type: 'choice_selection' },
    { id: 'event-5', title: 'Opening Day Box Office Prediction', status: 'Upcoming', type: 'numeric_prediction' },
    { id: 'event-6', title: 'Full Team Draft (Release Week)', status: 'Upcoming', type: 'draft_selection' },
];

const leaderboardData = [
  { rank: 1, name: 'CinemaFanatic', score: 205 },
  { rank: 2, name: 'BoxOfficeGuru', score: 190 },
  { rank: 3, name: 'You', score: 185 }, // Current user's rank
  { rank: 4, name: 'ReelTalk', score: 170 },
  { rank: 5, name: 'FirstDayFirstShow', score: 165 },
];


function EventCard({ event }: { event: (typeof predictionEvents)[0] }) {
    const isCompleted = event.status === 'Completed';
    const isLive = event.status === 'Live';
    const isUpcoming = event.status === 'Upcoming';

    return (
        <Card className={`overflow-hidden flex flex-col ${isCompleted ? 'bg-white/5' : ''}`}>
            <CardHeader>
                <CardTitle className="text-lg font-headline">{event.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {isLive && event.endsIn && (
                        <div className="flex items-center gap-1 text-red-400">
                            <Clock className="w-4 h-4" />
                            <span>Ends in {event.endsIn}</span>
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
                {isCompleted && event.score && (
                    <p>Your Score: <span className="font-bold text-primary font-code">{event.score}</span></p>
                )}
            </CardContent>
            <CardContent>
                <Button asChild className="w-full" disabled={isUpcoming}>
                    <Link href={isLive ? `/fantasy/event/${event.id}` : '#'}>
                        {isLive && 'Make Prediction'}
                        {isCompleted && 'View Results'}
                        {isUpcoming && 'Prediction Opens Soon'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function FantasyCampaignPage({ params }: { params: { id: string } }) {

  const completedEvents = predictionEvents.filter(e => e.status === 'Completed');
  const totalPoints = completedEvents.reduce((acc, e) => acc + (e.score || 0), 0);
  const currentUserRank = leaderboardData.find(p => p.name === 'You')?.rank;


  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                 <Button variant="ghost" asChild className='mb-2 -ml-4'>
                    <Link href="/fantasy">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Campaigns
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    {campaignDetails.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Predict events for <span className="font-semibold text-primary">{campaignDetails.movie.title}</span> and win big.
                </p>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <Card className="text-center p-4">
                    <CardDescription>Total Points</CardDescription>
                    <CardTitle className="font-code text-4xl text-primary">{totalPoints}</CardTitle>
                </Card>
                 <Card className="text-center p-4">
                    <CardDescription>Your Rank</CardDescription>
                    <CardTitle className="font-code text-4xl text-primary">#{currentUserRank || 'N/A'}</CardTitle>
                </Card>
            </div>
        </div>

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
                            {predictionEvents.filter(e => e.status === 'Live').length > 0 ? predictionEvents.filter(e => e.status === 'Live').map(event => <EventCard key={event.id} event={event} />) : <Card className='col-span-full p-6 text-muted-foreground'>No live events right now. Check back soon!</Card>}
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <Clock className="text-primary"/> Upcoming Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {predictionEvents.filter(e => e.status === 'Upcoming').map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                    </div>
                    
                    <div className='space-y-4'>
                        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                            <ListOrdered className="text-primary"/> Completed Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Campaign Leaderboard</CardTitle>
                        <CardDescription>Top predictors for the {campaignDetails.movie.title} campaign.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {leaderboardData.map((player) => (
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
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

    