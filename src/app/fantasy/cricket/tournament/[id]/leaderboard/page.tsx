'use client';

import { useParams, notFound } from 'next/navigation';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Medal, Users, Award } from 'lucide-react';
import Link from 'next/link';
import type { CricketTournament, UserParticipation, UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TournamentLeaderboardPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  
  const tournamentRef = firestore ? doc(firestore, 'cricket-tournaments', tournamentId) : null;
  const { data: tournament, isLoading: tournamentLoading } = useDoc(tournamentRef);
  
  const participationsRef = firestore
    ? collection(firestore, 'cricket-tournaments', tournamentId, 'participations')
    : null;
  const { data: participations, isLoading: participationsLoading } = useCollection(participationsRef);

  // Get user profiles for display names
  const userIds = participations ? [...new Set(participations.map(p => p.userId))] : [];
  const userProfilesRef = firestore ? collection(firestore, 'users') : null;
  const { data: allUsers } = useCollection(userProfilesRef);
  const userProfilesMap = (allUsers as any)?.reduce((acc: any, profile: any) => {
    if (userIds.includes(profile.id)) {
      acc[profile.id] = profile;
    }
    return acc;
  }, {} as Record<string, UserProfile>) || {};

  if (tournamentLoading || participationsLoading) {
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

  // Sort participations by total points
  const sortedParticipations = participations 
    ? [...participations].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    : [];
  
  // Add ranks
  const rankedParticipations = sortedParticipations.map((p, index) => ({
    ...p,
    rank: index + 1,
  }));

  // Find user's rank
  const userRank = user 
    ? rankedParticipations.findIndex(p => p.userId === user.uid) + 1
    : null;
  const userParticipation = user 
    ? rankedParticipations.find(p => p.userId === user.uid)
    : null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/fantasy/cricket/tournament/${tournamentId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournament
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Tournament Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>{tournament.name} - Leaderboard</CardTitle>
                <CardDescription>
                  {rankedParticipations.length} participants competing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* User's Position Card */}
        {userParticipation && (
          <Card className="border-primary border-2 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Your Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRankIcon(userRank || 0)}
                  <div>
                    <p className="font-semibold text-lg">Rank #{userRank}</p>
                    <p className="text-sm text-muted-foreground">
                      {userProfilesMap[user!.uid]?.displayName || 'You'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-primary">
                    {userParticipation.totalPoints || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Leaderboard</CardTitle>
            <CardDescription>
              Rankings based on total points earned from predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rankedParticipations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No participants yet. Be the first to join!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">Total Points</TableHead>
                    <TableHead className="text-right">Predictions</TableHead>
                    <TableHead className="text-right">Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedParticipations.map((participation) => {
                    const profile = userProfilesMap[participation.userId];
                    const isCurrentUser = user && participation.userId === user.uid;
                    const accuracy = participation.predictionsCount > 0
                      ? ((participation.correctPredictions || 0) / participation.predictionsCount * 100).toFixed(1)
                      : '0.0';

                    return (
                      <TableRow
                        key={participation.userId}
                        className={isCurrentUser ? 'bg-primary/10 font-semibold' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(participation.rank || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {profile?.photoURL && (
                                <AvatarImage src={profile.photoURL} />
                              )}
                              <AvatarFallback>
                                {profile?.displayName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {profile?.displayName || 'Anonymous User'}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="ml-2">You</Badge>
                                )}
                              </p>
                              {profile?.city && profile?.state && (
                                <p className="text-xs text-muted-foreground">
                                  {profile.city}, {profile.state}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-lg">
                            {participation.totalPoints || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">
                            {participation.predictionsCount || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">
                            {accuracy}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

