'use client';

import { useFirestore, useCollection } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, RefreshCw, Download, Radio } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserParticipation } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function TournamentLeaderboardPage() {
  const firestore = useFirestore();
  const params = useParams();
  const tournamentId = params.id as string;
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [realTimeData, setRealTimeData] = useState<UserParticipation[]>([]);
  
  const participationsRef = firestore
    ? collection(firestore, 'cricket-tournaments', tournamentId, 'participations')
    : null;
  const { data: participations, isLoading } = useCollection<UserParticipation>(participationsRef);

  useEffect(() => {
    if (!firestore || !realTimeEnabled || !participationsRef) return;

    const unsubscribe = onSnapshot(
      participationsRef,
      (snapshot) => {
        const updated = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserParticipation[];
        setRealTimeData(updated);
      },
      (error) => {
        console.error('Error listening to leaderboard updates:', error);
      }
    );

    return () => unsubscribe();
  }, [firestore, realTimeEnabled, participationsRef]);

  const displayParticipations = realTimeEnabled && realTimeData.length > 0 
    ? realTimeData 
    : (participations || []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: 'Leaderboard Refreshed',
        description: 'The leaderboard has been updated.',
      });
    }, 1000);
  };

  const handleExport = () => {
    if (!sortedParticipations || sortedParticipations.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'No leaderboard data to export.',
      });
      return;
    }

    const headers = ['Rank', 'User ID', 'Total Points', 'Predictions', 'Correct'];
    const rows = sortedParticipations.map((p) => [
      p.rank,
      p.userId,
      p.totalPoints,
      p.predictionsCount,
      p.correctPredictions,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `tournament-leaderboard-${tournamentId}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `File "${fileName}" downloaded to your Downloads folder.`,
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const sortedParticipations = [...displayParticipations].sort((a, b) => b.totalPoints - a.totalPoints);
  const rankedParticipations = sortedParticipations.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Tournament Leaderboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage leaderboards for this tournament.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={realTimeEnabled ? 'default' : 'outline'}
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          >
            <Radio className={`w-4 h-4 mr-2 ${realTimeEnabled ? 'animate-pulse' : ''}`} />
            {realTimeEnabled ? 'Real-time ON' : 'Real-time OFF'}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList>
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="group-wise">Group-wise</TabsTrigger>
          <TabsTrigger value="player-predictions">Player Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Overall Tournament Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rankedParticipations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No participants yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {rankedParticipations.slice(0, 100).map((participation) => (
                    <div
                      key={participation.userId}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        participation.rank <= 3
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border">
                          {participation.rank <= 3 ? (
                            <Trophy className="w-5 h-5 text-primary" />
                          ) : (
                            <span className="font-bold">{participation.rank}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">User {participation.userId.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {participation.correctPredictions} / {participation.predictionsCount} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Points</p>
                        <p className="text-2xl font-bold text-primary">{participation.totalPoints}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group-wise" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Group-wise leaderboard feature coming soon.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player-predictions" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Player prediction leaderboard feature coming soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

