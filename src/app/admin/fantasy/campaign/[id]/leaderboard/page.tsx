'use client';

import { useFirestore, useCollection } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, RefreshCw, Download, Users, Radio, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserParticipation } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function CampaignLeaderboardPage() {
  const firestore = useFirestore();
  const params = useParams();
  const campaignId = params.id as string;
  const [refreshing, setRefreshing] = useState(false);
  
  const participationsRef = firestore
    ? collection(firestore, 'fantasy-campaigns', campaignId, 'participations')
    : null;
  const { data: participations, isLoading } = useCollection<UserParticipation>(participationsRef);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [realTimeData, setRealTimeData] = useState<UserParticipation[]>([]);

  // Real-time updates
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
    // In a real implementation, this would recalculate leaderboard
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: 'Leaderboard Refreshed',
        description: 'The leaderboard has been updated.',
      });
    }, 1000);
  };

  const handleExport = (format: 'csv' | 'excel' = 'csv') => {
    if (!sortedParticipations || sortedParticipations.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'No leaderboard data to export.',
      });
      return;
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Rank', 'User ID', 'Total Points', 'Predictions', 'Correct', 'Movie-wise Points'];
      const rows = sortedParticipations.map((p) => [
        p.rank,
        p.userId,
        p.totalPoints,
        p.predictionsCount,
        p.correctPredictions,
        JSON.stringify(p.movieWisePoints || {}),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `leaderboard-${campaignId}-${new Date().toISOString().split('T')[0]}.csv`;
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
    } else {
      // For Excel, we'd need a library like xlsx
      toast({
        title: 'Excel Export',
        description: 'Excel export requires additional setup. Please use CSV export for now.',
      });
    }
  };

  const handleDownloadTemplate = () => {
    // Generate template CSV with sample data
    const headers = ['Rank', 'User ID', 'Total Points', 'Predictions', 'Correct', 'Movie-wise Points'];
    const sampleRows = [
      [1, 'user123', 500, 10, 8, '{"movie1": 200, "movie2": 300}'],
      [2, 'user456', 450, 10, 7, '{"movie1": 150, "movie2": 300}'],
      [3, 'user789', 400, 10, 6, '{"movie1": 200, "movie2": 200}'],
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `leaderboard-template.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: `Template file "${fileName}" downloaded to your Downloads folder.`,
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

  // Sort by total points
  const sortedParticipations = [...displayParticipations].sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Add ranks
  const rankedParticipations = sortedParticipations.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));

  // Group by movie for movie-wise leaderboard
  const movieWiseLeaderboards: Record<string, typeof rankedParticipations> = {};
  rankedParticipations.forEach((participation) => {
    Object.keys(participation.movieWisePoints || {}).forEach((movieId) => {
      if (!movieWiseLeaderboards[movieId]) {
        movieWiseLeaderboards[movieId] = [];
      }
      movieWiseLeaderboards[movieId].push(participation);
    });
  });

  // Sort each movie leaderboard
  Object.keys(movieWiseLeaderboards).forEach((movieId) => {
    movieWiseLeaderboards[movieId].sort((a, b) => 
      (b.movieWisePoints?.[movieId] || 0) - (a.movieWisePoints?.[movieId] || 0)
    );
    movieWiseLeaderboards[movieId] = movieWiseLeaderboards[movieId].map((p, index) => ({
      ...p,
      rank: index + 1,
    }));
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Campaign Leaderboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage leaderboards for this campaign.
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
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileText className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList>
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="movie-wise">Movie-wise</TabsTrigger>
          <TabsTrigger value="city-state">City/State</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Overall Leaderboard
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
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Points</p>
                          <p className="text-2xl font-bold text-primary">{participation.totalPoints}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movie-wise" className="mt-6">
          <div className="space-y-6">
            {Object.keys(movieWiseLeaderboards).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No movie-wise data available.
                </CardContent>
              </Card>
            ) : (
              Object.entries(movieWiseLeaderboards).map(([movieId, leaderboard]) => (
                <Card key={movieId}>
                  <CardHeader>
                    <CardTitle>Movie: {movieId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {leaderboard.slice(0, 50).map((participation) => (
                        <div
                          key={participation.userId}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold w-8">#{participation.rank}</span>
                            <span>User {participation.userId.slice(0, 8)}</span>
                          </div>
                          <Badge variant="outline">
                            {participation.movieWisePoints?.[movieId] || 0} points
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="city-state" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              City/State leaderboard feature coming soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

