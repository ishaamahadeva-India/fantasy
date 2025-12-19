'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Clock, ListOrdered, Lock, Trophy, ArrowLeft } from 'lucide-react';
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

function EventCard({ event }: { event: (typeof predictionEvents)[0] }) {
    const isCompleted = event.status === 'Completed';
    const isLive = event.status === 'Live';
    const isUpcoming = event.status === 'Upcoming';

    return (
        <Card className={`overflow-hidden ${isCompleted ? 'bg-white/5' : ''}`}>
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
            <CardContent>
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

  const liveEvents = predictionEvents.filter(e => e.status === 'Live');
  const upcomingEvents = predictionEvents.filter(e => e.status === 'Upcoming');
  const completedEvents = predictionEvents.filter(e => e.status === 'Completed');
  const totalPoints = completedEvents.reduce((acc, e) => acc + (e.score || 0), 0);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
                 <Button variant="ghost" asChild className='mb-4 -ml-4'>
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
            <Card className="text-center p-4">
                <CardDescription>Total Points</CardDescription>
                <CardTitle className="font-code text-4xl text-primary">{totalPoints}</CardTitle>
            </Card>
        </div>

      <div className="space-y-6">
        <div className='space-y-4'>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Trophy className="text-primary"/> Live Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveEvents.length > 0 ? liveEvents.map(event => <EventCard key={event.id} event={event} />) : <p className='text-muted-foreground col-span-full'>No live events right now. Check back soon!</p>}
            </div>
        </div>

        <Separator />

        <div className='space-y-4'>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Clock className="text-primary"/> Upcoming Events
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
        </div>
        
        <Separator />

         <div className='space-y-4'>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <ListOrdered className="text-primary"/> Completed Events
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
        </div>
      </div>
    </div>
  );
}
