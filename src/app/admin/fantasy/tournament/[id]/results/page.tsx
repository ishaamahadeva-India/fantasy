'use client';

import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateTournamentEvent } from '@/firebase/firestore/cricket-tournaments';
import type { TournamentEvent, EventResult } from '@/lib/types';
import { useState } from 'react';

export default function TournamentResultsPage() {
  const firestore = useFirestore();
  const params = useParams();
  const tournamentId = params.id as string;
  
  const eventsRef = firestore
    ? collection(firestore, 'cricket-tournaments', tournamentId, 'events')
    : null;
  const { data: events, isLoading } = useCollection<TournamentEvent>(eventsRef);
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<{ outcome: string; notes: string }>({ outcome: '', notes: '' });

  const handleVerifyResult = async (eventId: string, result: EventResult) => {
    if (!firestore) return;
    try {
      await updateTournamentEvent(firestore, tournamentId, eventId, {
        result: {
          ...result,
          verified: true,
          verifiedAt: new Date(),
        },
      });
      toast({
        title: 'Result Verified',
        description: 'The tournament event result has been verified.',
      });
      setEditingEventId(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not verify the result.',
      });
    }
  };

  const handleApproveResult = async (eventId: string, result: EventResult) => {
    if (!firestore) return;
    try {
      await updateTournamentEvent(firestore, tournamentId, eventId, {
        result: {
          ...result,
          approved: true,
          approvedAt: new Date(),
        },
      });
      toast({
        title: 'Result Approved',
        description: 'The tournament event result has been approved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not approve the result.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const completedEvents = events?.filter((e) => e.status === 'completed' || e.status === 'locked') || [];
  const pendingEvents = events?.filter((e) => e.status === 'live') || [];

  // Group events by type
  const tournamentLevelEvents = completedEvents.filter((e) => 
    ['tournament_winner', 'tournament_runner_up', 'semi_finalists', 'finalists'].includes(e.eventType)
  );
  const groupLevelEvents = completedEvents.filter((e) => 
    ['group_topper', 'group_second_place', 'group_qualifiers'].includes(e.eventType)
  );
  const playerLevelEvents = completedEvents.filter((e) => 
    ['top_run_scorer', 'top_wicket_taker', 'tournament_mvp'].includes(e.eventType)
  );
  const otherEvents = completedEvents.filter((e) => 
    !tournamentLevelEvents.includes(e) && 
    !groupLevelEvents.includes(e) && 
    !playerLevelEvents.includes(e)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Tournament Result Verification
        </h1>
        <p className="mt-2 text-muted-foreground">
          Verify and approve tournament event results.
        </p>
      </div>

      {pendingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Events ({pendingEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{event.eventType}</Badge>
                      <Badge variant="outline">{event.points} points</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingEventId(event.id);
                      setResultData({ outcome: '', notes: '' });
                    }}
                  >
                    Enter Result
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tournamentLevelEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tournament Level Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tournamentLevelEvents.map((event) => {
              const result = event.result;
              const isVerified = result?.verified;
              const isApproved = result?.approved;
              
              return (
                <div key={event.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{event.eventType}</Badge>
                        <Badge variant="outline">{event.points} points</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Not Verified
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </Badge>
                      )}
                    </div>
                  </div>

                  {editingEventId === event.id ? (
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <div>
                        <Label>Result Outcome</Label>
                        <Input
                          value={resultData.outcome}
                          onChange={(e) => setResultData({ ...resultData, outcome: e.target.value })}
                          placeholder="Enter the actual result"
                        />
                      </div>
                      <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea
                          value={resultData.notes}
                          onChange={(e) => setResultData({ ...resultData, notes: e.target.value })}
                          placeholder="Additional notes"
                        />
                      </div>
                      <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (!resultData.outcome.trim()) {
                                toast({
                                  variant: 'destructive',
                                  title: 'Validation Error',
                                  description: 'Please enter a result outcome.',
                                });
                                return;
                              }
                              handleVerifyResult(event.id, {
                                outcome: resultData.outcome,
                                verified: true,
                                approved: false,
                                notes: resultData.notes,
                              });
                            }}
                          >
                            Verify Result
                          </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingEventId(null);
                            setResultData({ outcome: '', notes: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Result Outcome</p>
                        <p className="font-semibold">{String(result.outcome)}</p>
                      </div>
                      {result.notes && (
                        <div className="p-3 bg-muted rounded">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{result.notes}</p>
                        </div>
                      )}
                      {!isVerified && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingEventId(event.id);
                            setResultData({
                              outcome: String(result.outcome || ''),
                              notes: result.notes || '',
                            });
                          }}
                        >
                          Edit Result
                        </Button>
                      )}
                      {isVerified && !isApproved && (
                        <Button
                          onClick={() => {
                            handleApproveResult(event.id, result);
                          }}
                        >
                          Approve Result
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingEventId(event.id);
                        setResultData({ outcome: '', notes: '' });
                      }}
                    >
                      Enter Result
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {groupLevelEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Group Level Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupLevelEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {event.result ? (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <p className="font-semibold">{String(event.result.outcome)}</p>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2">
                    Enter Result
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {playerLevelEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Player Level Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {playerLevelEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {event.result ? (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <p className="font-semibold">{String(event.result.outcome)}</p>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2">
                    Enter Result
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {otherEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherEvents.map((event) => (
              <div key={event.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {event.result ? (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <p className="font-semibold">{String(event.result.outcome)}</p>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2">
                    Enter Result
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {completedEvents.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No completed events yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

