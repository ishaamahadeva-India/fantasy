
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, ListOrdered, Lock, Trophy, ArrowLeft, User, Award, Building } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Placeholder Data
const campaignDetails = {
    id: 'campaign-devara',
    title: 'Devara: Part 1 - The Full Campaign',
    movie: {
        title: 'Devara: Part 1',
    },
    prizePool: 'Vouchers & 1,00,000 Intel Points',
    sponsor: {
        name: 'Kingfisher',
        logo: 'https://picsum.photos/seed/kingfisher/100/100'
    }
};

const predictionEvents = [
    { id: 'event-1', title: 'First Look Views (24h)', status: 'Completed', score: 50, type: 'choice_selection', points: 50 },
    { id: 'event-2', title: 'Pre-Release Event Location', status: 'Completed', score: 0, type: 'choice_selection', points: 25 },
    { id: 'event-3', title: 'Trailer Views (24h)', status: 'Live', endsIn: '2 hours', type: 'choice_selection', points: 75 },
    { id: 'event-7', title: 'First Look Views (1hr)', status: 'Upcoming', type: 'choice_selection', points: 20 },
    { id: 'event-4', title: 'First Song Streaming Milestone', status: 'Upcoming', type: 'choice_selection', points: 40 },
    { id: 'event-6', title: 'Full Team Draft (Release Week)', status: 'Upcoming', type: 'draft_selection', points: 200 },
    { id: 'event-8', title: 'First Look Views (7 Days)', status: 'Upcoming', type: 'choice_selection', points: 100 },
];

const otherPlayersData = [
  { name: 'CinemaFanatic', score: 205 },
  { name: 'BoxOfficeGuru', score: 190 },
  { name: 'ReelTalk', score: 170 },
  { name: 'FirstDayFirstShow', score: 165 },
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
                 {isCompleted && event.score !== undefined ? (
                    <p>Your Score: <span className="font-bold text-primary font-code">{event.score}</span></p>
                ) : (
                    <div className="flex items-center gap-2 text-amber-400">
                        <Trophy className="w-4 h-4" />
                        <span className="font-semibold">{event.points} Points</span>
                    </div>
                )}
            </CardContent>
            <CardContent>
                <Button asChild className="w-full" disabled={isUpcoming}>
                    <Link href={`/fantasy/movie/event/${event.id}`}>
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
  const id = params.id as string;

  const completedEvents = predictionEvents.filter(e => e.status === 'Completed');
  const totalPoints = completedEvents.reduce((acc, event) => acc + (event.score || 0), 0);
  
  const leaderboardData = [
    ...otherPlayersData,
    { name: 'You', score: totalPoints }
  ].sort((a, b) => b.score - a.score).map((player, index) => ({ ...player, rank: index + 1 }));

  const currentUserRank = leaderboardData.find(p => p.name === 'You')?.rank;


  return (
    <div className="space-y-8">
        <div className='flex-1'>
            <Button variant="ghost" asChild className='mb-2 -ml-4'>
                <Link href="/fantasy/movie">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Campaigns
                </Link>
            </Button>
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-8">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    {campaignDetails.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Predict events for <span className="font-semibold text-primary">{campaignDetails.movie.title}</span> and win big.
                </p>
                 <div className="mt-4 flex items-center gap-2 text-primary">
                    <Trophy className="w-5 h-5"/>
                    <span className="font-semibold">{campaignDetails.prizePool}</span>
                </div>
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

        <Card className="p-4 bg-gradient-to-r from-primary/10 via-background to-background border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">Sponsored By</span>
                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                    <Building className='w-6 h-6 text-primary'/> {campaignDetails.sponsor.name}
                </div>
            </div>
        </Card>

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
                        <CardDescription>Top predictors for the {campaignDetails.movie.title} campaign, powered by {campaignDetails.sponsor.name}.</CardDescription>
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
