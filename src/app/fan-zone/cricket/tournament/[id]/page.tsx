'use client';

import { useParams, notFound } from 'next/navigation';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Calendar, MapPin, Users, DollarSign, Play, Clock } from 'lucide-react';
import Link from 'next/link';
import type { CricketTournament, TournamentEvent } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  
  const tournamentRef = firestore ? doc(firestore, 'cricket-tournaments', tournamentId) : null;
  const { data: tournament, isLoading } = useDoc<CricketTournament>(tournamentRef);
  
  const eventsRef = firestore ? collection(firestore, 'cricket-tournaments', tournamentId, 'events') : null;
  const { data: events } = useCollection<TournamentEvent>(eventsRef);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tournament) {
    notFound();
  }

  const startDate = tournament.startDate instanceof Date 
    ? tournament.startDate 
    : (tournament.startDate as any)?.seconds 
    ? new Date((tournament.startDate as any).seconds * 1000)
    : new Date();
  
  const endDate = tournament.endDate instanceof Date 
    ? tournament.endDate 
    : (tournament.endDate as any)?.seconds 
    ? new Date((tournament.endDate as any).seconds * 1000)
    : new Date();

  const isLive = tournament.status === 'live';
  const isUpcoming = tournament.status === 'upcoming';
  const isCompleted = tournament.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/fan-zone/cricket">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cricket Fan Zone
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Tournament Header */}
        <Card className={`border-2 ${isLive ? 'border-primary ring-2 ring-primary/20' : ''}`}>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className={`w-8 h-8 ${isLive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <CardTitle className="text-3xl">{tournament.name}</CardTitle>
                  {isLive && (
                    <Badge className="bg-primary text-primary-foreground animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <Badge variant={isLive ? 'default' : isUpcoming ? 'secondary' : 'outline'}>
                    {tournament.format}
                  </Badge>
                  <Badge variant="outline">{tournament.status}</Badge>
                  {tournament.visibility === 'public' && (
                    <Badge variant="outline">Public</Badge>
                  )}
                </div>
                {tournament.description && (
                  <CardDescription className="mt-3 text-base">
                    {tournament.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-semibold">{startDate.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-semibold">{endDate.toLocaleDateString()}</p>
                </div>
              </div>
              {tournament.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="font-semibold text-sm">{tournament.venue}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Teams</p>
                  <p className="font-semibold">{tournament.teams?.length || 0}</p>
                </div>
              </div>
            </div>

            {tournament.prizePool && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Prize Pool</p>
                    <p className="text-2xl font-bold text-primary">{tournament.prizePool}</p>
                  </div>
                  {tournament.sponsorName && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Sponsored by</p>
                      <p className="font-semibold">{tournament.sponsorName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Entry Fee</p>
                {tournament.entryFee?.type === 'free' ? (
                  <p className="text-lg font-bold text-green-600">Free Entry</p>
                ) : tournament.entryFee?.tiers ? (
                  <div className="flex gap-2">
                    {tournament.entryFee.tiers.map((tier, idx) => (
                      <Badge key={idx} variant="outline">₹{tier.amount}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg font-bold">₹{tournament.entryFee?.amount || 'Paid'}</p>
                )}
              </div>
              {!isCompleted && (
                <Button size="lg" className={isLive ? '' : 'bg-primary'}>
                  {isLive ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Join Tournament
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tournament Events */}
        {events && events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tournament Events</CardTitle>
              <CardDescription>
                Predict and compete in various tournament-level events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Events</TabsTrigger>
                  <TabsTrigger value="live">Live</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{event.points} pts</Badge>
                            <Badge
                              variant={
                                event.status === 'live'
                                  ? 'destructive'
                                  : event.status === 'completed'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/fan-zone/cricket/tournament/${tournamentId}/event/${event.id}`}>
                            {event.status === 'live' ? 'Predict Now' : 'View Details'}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="live" className="mt-4">
                  <div className="space-y-3">
                    {events
                      .filter((e) => e.status === 'live')
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <Button size="sm">Predict Now</Button>
                        </div>
                      ))}
                    {events.filter((e) => e.status === 'live').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No live events at the moment
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="upcoming" className="mt-4">
                  <div className="space-y-3">
                    {events
                      .filter((e) => e.status === 'upcoming')
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      ))}
                    {events.filter((e) => e.status === 'upcoming').length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No upcoming events
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

