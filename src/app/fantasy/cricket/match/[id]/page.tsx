'use client';
import { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Lock, Users, Flame, Zap, Trophy, BarChart, HelpCircle, User, Award } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { FantasyMatch, UserProfile, CricketerProfile, LivePrediction, FantasyRoleSelection, UserLivePrediction, FantasyLeaderboard } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Note: This page is now connected to Firestore. The admin will need to add data for it to be populated.

function PlayerSelectionCard({ player, isSelected, isDisabled, onSelect }: { player: any, isSelected: boolean, isDisabled: boolean, onSelect: () => void }) {
    return (
        <Card 
            onClick={onSelect}
            className={cn("p-3 text-center transition-all cursor-pointer relative overflow-hidden",
                isSelected && "border-primary ring-2 ring-primary",
                isDisabled && "opacity-50 cursor-not-allowed bg-white/5",
            )}
        >
            {isSelected && (
                <motion.div layoutId="check-icon" className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                </motion.div>
            )}
            <Image src={player.avatarUrl || `https://picsum.photos/seed/${player.id}/400/400`} alt={player.name} width={80} height={80} className="rounded-full mx-auto" />
            <p className="font-semibold mt-2 text-sm truncate">{player.name}</p>
        </Card>
    );
}

function ScoringRulesCard() {
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl"><HelpCircle className="w-6 h-6"/> Points Engine</CardTitle>
                <CardDescription>Points are awarded based on role performance, predictions, and streaks.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-6">
                
                <div>
                    <h4 className="font-bold text-base mb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-primary"/> Role Performance Points</h4>
                    <p className="text-xs text-muted-foreground">This is an example. Actual points are determined by live match data.</p>
                </div>

                <div>
                    <h4 className="font-bold text-base mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-primary"/> Micro-Prediction Points</h4>
                     <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className='border-b-0'>Correct Prediction</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold border-b-0">+10</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <h4 className="font-bold text-base mb-2 flex items-center gap-2"><Flame className="w-5 h-5 text-amber-400"/> Skill Streak Bonuses</h4>
                     <Table>
                        <TableBody>
                             <TableRow>
                                <TableCell>3 Correct Predictions</TableCell>
                                <TableCell className="text-right font-code text-amber-400 font-bold">+10</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>5 Correct Predictions</TableCell>
                                <TableCell className="text-right font-code text-amber-400 font-bold">+25</TableCell>
                            </TableRow>
                            <TableRow className='border-b-0'>
                                <TableCell>7 Correct Predictions</TableCell>
                                <TableCell className="text-right font-code text-amber-400 font-bold border-b-0">+40</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}


function PreMatchView({ onLockSelections, roles, players, matchId }: { onLockSelections: () => void, roles: FantasyRoleSelection[], players: (CricketerProfile & {id: string})[], matchId: string }) {
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [isLocked, setIsLocked] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();

    const handleSelectPlayer = (roleId: string, playerId: string) => {
        setSelections(prev => ({
            ...prev,
            [roleId]: prev[roleId] === playerId ? '' : playerId
        }));
    };

    const handleLock = () => {
        // In a real app, this would save the selections to Firestore
        // For now, it just moves to the next phase
        setIsLocked(true);
        toast({
            title: 'Selections Locked!',
            description: 'Good luck! The match is about to go live.',
        });
        setTimeout(() => onLockSelections(), 1000);
    }
    
    if (!roles || roles.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>Awaiting Match Setup</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">The roles for this match have not been configured by the admin yet.</p></CardContent>
            </Card>
        )
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
            >
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Pre-Match Selections</CardTitle>
                        <CardDescription>Lock in your player roles before the match begins. Your choices cannot be changed after locking.</CardDescription>
                    </CardHeader>
                </Card>

                {/* This should be driven by roles from Firestore */}
                <p className="text-muted-foreground">Role selection not yet implemented.</p>
                
                <ScoringRulesCard />

                <div className="sticky bottom-6 z-10">
                    <Button onClick={handleLock} disabled={isLocked} size="lg" className="w-full shadow-2xl shadow-primary/20">
                        <Lock className="w-5 h-5 mr-2" />
                        {isLocked ? `Selections Locked` : `Lock Selections`}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

function FirstInningsView({ onInningsEnd, predictions }: { onInningsEnd: () => void, predictions: LivePrediction[] }) {
    
     if (!predictions || predictions.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>1st Innings: LIVE</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">No live predictions are available for this phase of the match yet.</p></CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">1st Innings: LIVE</CardTitle>
                    <CardDescription>Live predictions will appear here as the action unfolds.</CardDescription>
                </CardHeader>
            </Card>
            {/* Prediction logic would go here */}
        </div>
    )
}

function InningsBreakView({ onStartNextInnings }: { onStartNextInnings: () => void }) {
    return (
        <div className="text-center space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Innings Break</CardTitle>
                    <CardDescription>Review the 1st innings and prepare for the 2nd innings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The 2nd Innings selection will begin shortly...</p>
                </CardContent>
                 <CardFooter className="justify-center">
                     <Button onClick={onStartNextInnings}>Start 2nd Innings Selections</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function LeaderboardView({ matchId, matchName }: { matchId: string, matchName: string }) {
    const firestore = useFirestore();
    const leaderboardRef = firestore ? doc(firestore, 'fantasy_leaderboards', matchId) : null;
    const { data: leaderboard, isLoading } = useDoc<FantasyLeaderboard>(leaderboardRef);

    if (isLoading) {
        return <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-64" /></CardContent></Card>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Match Leaderboard</CardTitle>
                <CardDescription>Live rankings for the {matchName} match.</CardDescription>
            </CardHeader>
            <CardContent>
                {!leaderboard || !leaderboard.rankings || leaderboard.rankings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">The leaderboard is not yet available.</p>
                ) : (
                    <div className="space-y-2">
                        {leaderboard.rankings.map((player) => (
                            <div key={player.userId} className={`flex items-center p-4 rounded-lg bg-white/5`}>
                                <div className="flex items-center gap-4 w-full">
                                    <span className="font-bold font-code text-lg w-8 text-center text-muted-foreground">
                                        {player.rank}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <User className="w-6 h-6 text-muted-foreground"/>
                                        <span className="font-semibold">{player.userId.substring(0,8)}...</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 font-bold font-code text-primary text-lg">
                                        <Award className="w-5 h-5 text-amber-400" />
                                        {player.score}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function CricketMatchPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();

  const [matchPhase, setMatchPhase] = useState('pre-match'); 
  const [activeTab, setActiveTab] = useState('game');

  // Fetch match details
  const matchRef = firestore ? doc(firestore, 'fantasy_matches', id) : null;
  const { data: matchDetails, isLoading: matchLoading } = useDoc<FantasyMatch>(matchRef);
  
  // Fetch supporting data
  const rolesQuery = firestore ? query(collection(firestore, 'fantasy_roles'), where('matchId', '==', id)) : null;
  const playersQuery = firestore ? collection(firestore, 'cricketers') : null;
  const predictionsQuery = firestore ? query(collection(firestore, 'fantasy_predictions'), where('matchId', '==', id)) : null;
  
  const { data: roles, isLoading: rolesLoading } = useCollection<FantasyRoleSelection>(rolesQuery);
  const { data: players, isLoading: playersLoading } = useCollection<CricketerProfile & {id: string}>(playersQuery);
  const { data: predictions, isLoading: predictionsLoading } = useCollection<LivePrediction>(predictionsQuery);

  const isLoading = matchLoading || rolesLoading || playersLoading || predictionsLoading;

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />
  }

  if (!matchDetails) {
    return notFound();
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
             <Button variant="ghost" asChild className='mb-2 -ml-4'>
                <Link href="/fantasy/cricket">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Link>
            </Button>
            {matchDetails.status === 'live' && (
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 font-semibold text-sm animate-pulse">
                    LIVE
                </div>
            )}
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-start gap-8">
            <div>
                 <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    {matchDetails.matchName}
                </h1>
            </div>
             <div className='grid grid-cols-2 gap-4'>
                <Card className="text-center p-4">
                    <CardDescription>Your Score</CardDescription>
                    <CardTitle className="font-code text-4xl text-primary">0</CardTitle>
                </Card>
                 <Card className="text-center p-4">
                    <CardDescription>Your Rank</CardDescription>
                    <CardTitle className="font-code text-4xl text-primary">#--</CardTitle>
                </Card>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="game">Game</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            <TabsContent value="game" className="mt-6">
                <AnimatePresence mode="wait">
                    {matchPhase === 'pre-match' && <PreMatchView onLockSelections={() => setMatchPhase('1st-innings')} roles={roles || []} players={players || []} matchId={id}/>}
                    {matchPhase === '1st-innings' && <FirstInningsView onInningsEnd={() => setMatchPhase('break')} predictions={predictions || []} />}
                    {matchPhase === 'break' && <InningsBreakView onStartNextInnings={() => alert('2nd Innings feature coming soon!')} />}
                </AnimatePresence>
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-6">
                <LeaderboardView matchId={id} matchName={matchDetails.matchName}/>
            </TabsContent>
        </Tabs>
        
        <Card className="text-center bg-transparent border-dashed">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Skill Declaration</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>This is a skill-based cricket strategy and prediction game where users make informed decisions based on player roles, match situations, and real-time analysis. Outcomes depend entirely on the user’s knowledge, judgment, and timing.</p>
                <p>Success in this game depends on the participant’s understanding of cricket, analytical skills, and ability to make strategic decisions. There is no element of chance or randomness. This platform does not involve betting, wagering, or games of chance.</p>
            </CardContent>
             <CardFooter className="justify-center text-xs text-muted-foreground">
                <p>This game is open only to users aged 18 years and above.</p>
            </CardFooter>
        </Card>
    </div>
  );
}
