'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Calendar, MapPin, Users, DollarSign, Play, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { CricketTournament, TournamentEvent, UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { addTournamentEntry, getUserTournamentEntry } from '@/firebase/firestore/tournament-entries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function TournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const tournamentRef = firestore ? doc(firestore, 'cricket-tournaments', tournamentId) : null;
  const { data: tournament, isLoading } = useDoc<CricketTournament>(tournamentRef);
  
  const eventsRef = firestore ? collection(firestore, 'cricket-tournaments', tournamentId, 'events') : null;
  const { data: events } = useCollection<TournamentEvent>(eventsRef);

  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const [hasEntry, setHasEntry] = useState(false);
  const [isCheckingEntry, setIsCheckingEntry] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  // Check if user has already joined
  useEffect(() => {
    const checkEntry = async () => {
      if (!firestore || !user || !tournamentId) {
        setIsCheckingEntry(false);
        return;
      }

      try {
        const entry = await getUserTournamentEntry(firestore, tournamentId, user.uid);
        setHasEntry(!!entry);
      } catch (error) {
        console.error('Error checking tournament entry:', error);
      } finally {
        setIsCheckingEntry(false);
      }
    };

    checkEntry();
  }, [firestore, user, tournamentId]);

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

  const handleJoinTournament = async () => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to join tournaments.',
      });
      return;
    }

    if (tournament.entryFee?.type === 'paid' && !selectedTier) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select an entry tier.',
      });
      return;
    }

    setIsJoining(true);

    try {
      const entryData = {
        userId: user.uid,
        tournamentId,
        entryFee: tournament.entryFee?.type === 'paid' && selectedTier ? parseFloat(selectedTier) : undefined,
        entryFeeTier: tournament.entryFee?.type === 'paid' && selectedTier 
          ? tournament.entryFee.tiers?.find(t => t.amount.toString() === selectedTier)?.label
          : undefined,
        paymentStatus: tournament.entryFee?.type === 'free' ? 'paid' as const : 'pending' as const,
        city: userProfile?.city,
        state: userProfile?.state,
      };

      await addTournamentEntry(firestore, entryData);

      toast({
        title: 'Successfully Joined!',
        description: tournament.entryFee?.type === 'free' 
          ? 'You have successfully registered for this tournament.'
          : 'Your registration is pending payment confirmation.',
      });

      setHasEntry(true);
      setJoinDialogOpen(false);
      
      // Refresh page to show updated status
      router.refresh();
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'There was an error joining the tournament. Please try again.',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/fantasy/cricket">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cricket Fantasy
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
                <>
                  {hasEntry ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">You're Registered!</span>
                    </div>
                  ) : (
                    <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                      <DialogTrigger asChild>
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
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Join Tournament</DialogTitle>
                          <DialogDescription>
                            {tournament.entryFee?.type === 'free' 
                              ? 'This tournament is free to join. Click confirm to register.'
                              : 'Select your entry tier and complete registration.'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {tournament.entryFee?.type === 'paid' && tournament.entryFee.tiers && (
                            <div className="space-y-3">
                              <Label>Select Entry Tier</Label>
                              <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
                                {tournament.entryFee.tiers.map((tier, idx) => (
                                  <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg">
                                    <RadioGroupItem value={tier.amount.toString()} id={`tier-${idx}`} />
                                    <Label htmlFor={`tier-${idx}`} className="flex-1 cursor-pointer">
                                      <div className="flex justify-between items-center">
                                        <span className="font-semibold">{tier.label}</span>
                                        <span className="text-primary font-bold">₹{tier.amount}</span>
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )}
                          {tournament.entryFee?.type === 'free' && (
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                              <p className="text-green-700 dark:text-green-300 font-semibold">
                                Free Entry - No payment required
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setJoinDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleJoinTournament}
                            disabled={isJoining || (tournament.entryFee?.type === 'paid' && !selectedTier)}
                            className="flex-1"
                          >
                            {isJoining ? 'Joining...' : 'Confirm & Join'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
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
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/fantasy/cricket/tournament/${tournamentId}/event/${event.id}`}>
                              {event.status === 'live' ? 'Predict Now' : 'View Details'}
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/fantasy/cricket/tournament/${tournamentId}/leaderboard`}>
                              <Trophy className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
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

