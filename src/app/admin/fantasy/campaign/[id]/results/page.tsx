'use client';

import { useFirestore, useCollection, useDoc, useUser } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Clock, AlertCircle, Coins, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateCampaignEvent } from '@/firebase/firestore/fantasy-campaigns';
import { distributeCampaignPoints, canDistributePoints } from '@/firebase/firestore/points-distribution';
import type { FantasyEvent, EventResult } from '@/lib/types';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CampaignResultsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const params = useParams();
  const campaignId = params.id as string;
  
  const eventsRef = firestore
    ? collection(firestore, 'fantasy-campaigns', campaignId, 'events')
    : null;
  const { data: events, isLoading } = useCollection(eventsRef);
  
  const campaignRef = firestore ? doc(firestore, 'fantasy-campaigns', campaignId) : null;
  const { data: campaignData } = useDoc(campaignRef);
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<{ outcome: string; notes: string }>({ outcome: '', notes: '' });
  const [distributingPoints, setDistributingPoints] = useState(false);
  const [canDistribute, setCanDistribute] = useState<{ canDistribute: boolean; reason?: string } | null>(null);
  const [pointsDistributed, setPointsDistributed] = useState(false);

  const handleVerifyResult = async (eventId: string, result: EventResult) => {
    if (!firestore) return;
    try {
      await updateCampaignEvent(firestore, campaignId, eventId, {
        result: {
          ...result,
          verified: true,
          verifiedAt: new Date(),
        },
      } as Partial<any>);
      toast({
        title: 'Result Verified',
        description: 'The event result has been verified.',
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
      await updateCampaignEvent(firestore, campaignId, eventId, {
        result: {
          ...result,
          approved: true,
          approvedAt: new Date(),
        },
      } as Partial<any>);
      toast({
        title: 'Result Approved',
        description: 'The event result has been approved.',
      });
      // Check if points can be distributed after approval
      checkDistributionStatus();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not approve the result.',
      });
    }
  };

  const checkDistributionStatus = async () => {
    if (!firestore) return;
    try {
      const status = await canDistributePoints(firestore, campaignId);
      setCanDistribute(status);
      
      // Also check if already distributed
      if (campaignData) {
        setPointsDistributed(campaignData.pointsDistributed === true);
      }
    } catch (error) {
      console.error('Error checking distribution status:', error);
    }
  };

  useEffect(() => {
    if (firestore && campaignId) {
      checkDistributionStatus();
    }
  }, [firestore, campaignId, events, campaignData]);

  const handleDistributePoints = async () => {
    if (!firestore || !user) return;
    
    setDistributingPoints(true);
    try {
      const result = await distributeCampaignPoints(firestore, campaignId, user.uid);
      
      if (result.success) {
        toast({
          title: 'Points Distributed Successfully',
          description: `Distributed ${result.totalPointsDistributed} points to ${result.usersUpdated} users.`,
        });
        setPointsDistributed(true);
        setCanDistribute({ canDistribute: false, reason: 'Points have already been distributed' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Distribution Failed',
          description: result.errors.join(', ') || 'Could not distribute points.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to distribute points: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setDistributingPoints(false);
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

  const allEventsApproved = events?.every(event => 
    event.result?.verified === true && event.result?.approved === true
  ) || false;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Result Verification
          </h1>
          <p className="mt-2 text-muted-foreground">
            Verify and approve event results for this campaign.
          </p>
        </div>
        {allEventsApproved && !pointsDistributed && canDistribute?.canDistribute && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Distribute Points
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Distribute Campaign Points</AlertDialogTitle>
                <AlertDialogDescription>
                  This will calculate and distribute points to all users who participated in this campaign based on their predictions and the verified results. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDistributePoints}
                  disabled={distributingPoints}
                >
                  {distributingPoints ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Distributing...
                    </>
                  ) : (
                    'Confirm Distribution'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {pointsDistributed && (
          <Badge variant="default" className="flex items-center gap-2 px-4 py-2">
            <CheckCircle2 className="w-4 h-4" />
            Points Distributed
          </Badge>
        )}
      </div>

      {canDistribute && !canDistribute.canDistribute && !pointsDistributed && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                Cannot distribute points: {canDistribute.reason}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {pointsDistributed && campaignData?.pointsDistributionStats && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              Points Distribution Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700">Users Updated</p>
                <p className="text-2xl font-bold text-green-800">
                  {campaignData.pointsDistributionStats.totalUsers || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Total Points Distributed</p>
                <p className="text-2xl font-bold text-green-800">
                  {campaignData.pointsDistributionStats.totalPointsDistributed?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            {campaignData.pointsDistributedAt && (
              <p className="text-xs text-green-600 mt-4">
                Distributed on: {new Date(campaignData.pointsDistributedAt.seconds * 1000).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>Completed Events - Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completedEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed events yet.
            </div>
          )}
          
          {completedEvents.map((event) => {
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
                        placeholder="Additional notes about the result"
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
    </div>
  );
}

