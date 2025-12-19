
'use client';
import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Lock, Users, Flame, Zap, Trophy, BarChart, HelpCircle, User, Award } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { placeholderCricketers } from '@/lib/cricket-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

// --- MOCK DATA ---
const matchDetails = {
    id: 'match-1',
    title: 'IND vs AUS',
    series: 'T20 World Cup Final',
    status: 'Live',
    teams: {
        teamA: { id: 'IND', name: 'India' },
        teamB: { id: 'AUS', name: 'Australia' }
    }
};

const roles = {
    "1st-innings": [
        { id: 'powerplay-king', title: 'Powerplay King (Batting)', description: 'Scores most runs in overs 1-6.' },
        { id: 'new-ball-striker', title: 'New Ball Striker (Bowling)', description: 'Takes most wickets with the new ball.' },
    ]
}

const players = {
    IND: placeholderCricketers.filter(p => p.country === 'IND'),
    AUS: [
        { id: 'c4', name: 'Pat Cummins', roles: ['Bowler', 'Captain'], country: 'AUS', avatar: 'https://picsum.photos/seed/cummins/400/400', consistencyIndex: 8.9, impactScore: 9.1, recentForm: [8,7,9,8,9], careerPhase: 'Peak' },
        { id: 'c5', name: 'David Warner', roles: ['Batsman', 'Opener'], country: 'AUS', avatar: 'https://picsum.photos/seed/warner/400/400', consistencyIndex: 8.2, impactScore: 9.0, recentForm: [70, 20, 90, 45, 30], careerPhase: 'Late' },
        { id: 'c6', name: 'Mitchell Starc', roles: ['Bowler', 'Pacer'], country: 'AUS', avatar: 'https://picsum.photos/seed/starc/400/400', consistencyIndex: 8.5, impactScore: 9.4, recentForm: [9,8,7,9,8], careerPhase: 'Peak' },
    ]
}


const microPredictions = [
    { id: 'pred-1', question: 'Total score after 1st Over: Over 6.5 runs?', outcome: true, phase: 'Powerplay' },
    { id: 'pred-2', question: 'Will a wicket fall in the first 3 overs?', outcome: false, phase: 'Powerplay' },
    { id: 'pred-3', question: 'Powerplay (1-6 overs) total score: Over 48.5 runs?', outcome: true, phase: 'Powerplay' },
    { id: 'pred-4', question: 'Will the Powerplay King (your pick) hit a boundary in the next over?', outcome: true, phase: 'Powerplay' },
    { id: 'pred-5', question: 'Total 4s in the Powerplay: Over 5.5?', outcome: true, phase: 'Powerplay' },
    { id: 'pred-6', question: 'Will a spinner be introduced before the 8th over?', outcome: true, phase: 'Middle Overs' },
    { id: 'pred-7', question: 'Total score at 10 over mark: Over 75.5?', outcome: false, phase: 'Middle Overs' },
    { id: 'pred-8', question: 'Will the New Ball Striker (your pick) take a wicket in their spell?', outcome: true, phase: 'Middle Overs' },
    { id: 'pred-9', question: 'Highest partnership to be over 50.5 runs?', outcome: true, phase: 'Middle Overs' },
    { id: 'pred-10', question: 'Will there be a maiden over in the innings?', outcome: false, phase: 'Middle Overs' },
    { id: 'pred-11', question: 'Total 6s in the match: Over 12.5?', outcome: true, phase: 'Death Overs' },
    { id: 'pred-12', question: 'Final score of the 1st Innings: Under 170.5 runs?', outcome: false, phase: 'Death Overs' },
    { id: 'pred-13', question: 'Will a yorker claim a wicket in the death overs?', outcome: true, phase: 'Death Overs' },
    { id_path: 'pred-14', question: 'Runs scored in the 19th over: Over 10.5?', outcome: true, phase: 'Death Overs' },
    { id_path: 'pred-15', question: 'Will the Death Overs Finisher (your pick) be not out?', outcome: false, phase: 'Death Overs' },
    { id_path: 'pred-16', question: 'Max 6s in one over: > 1.5?', outcome: true, phase: 'Any' },
    { id_path: 'pred-17', question: 'Max 4s in one over: > 2.5?', outcome: true, phase: 'Any' },
    { id_path: 'pred-18', question: 'Highest individual score: Over 60.5?', outcome: true, phase: 'Any' },
    { id_path: 'pred-19', question: 'Total extras conceded: Over 8.5?', outcome: false, phase: 'Any' },
    { id_path: 'pred-20', question: 'Will there be a run-out in the innings?', outcome: true, phase: 'Any' }
];


const leaderboardData = [
  { rank: 1, name: 'CricketFan1', score: 120 },
  { rank: 2, name: 'You', score: 110 },
  { rank: 3, name: 'StrategicThinker', score: 105 },
  { rank: 4, name: 'ThePredictor', score: 95 },
  { rank: 5, name: 'LuckyGuess', score: 80 },
];


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
            <Image src={player.avatar} alt={player.name} width={80} height={80} className="rounded-full mx-auto" />
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Powerplay King (Batting)</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Scores ≥ 25 runs</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+30</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Scores 15–24</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+20</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Scores &lt; 15</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+5</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Strike rate ≥ 140 bonus</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+10</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                     <Table className='mt-4'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Death Overs Specialist (Bowling)</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>2+ wickets</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+30</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>1 wicket</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+20</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Economy ≤ 8</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+10</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="border-b-0 text-red-400">Economy &gt; 10</TableCell>
                                <TableCell className="text-right font-code text-red-400 font-bold border-b-0">-10</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
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
                            <TableRow>
                                <TableCell className='border-b-0'>7 Correct Predictions</TableCell>
                                <TableCell className="text-right font-code text-amber-400 font-bold border-b-0">+40</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

            </CardContent>
        </Card>
    )
}


function PreMatchView({ onLockSelections }: { onLockSelections: () => void }) {
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [isLocked, setIsLocked] = useState(false);

    const handleSelectPlayer = (roleId: string, playerId: string) => {
        setSelections(prev => ({
            ...prev,
            [roleId]: prev[roleId] === playerId ? '' : playerId
        }));
    };

    const handleLock = () => {
        if (Object.values(selections).filter(Boolean).length !== roles['1st-innings'].length) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Selections',
                description: 'Please select one player for each role.',
            });
            return;
        }
        setIsLocked(true);
        toast({
            title: 'Selections Locked for 1st Innings!',
            description: 'Good luck! The match is about to go live.',
        });
        setTimeout(() => onLockSelections(), 1000);
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
                        <CardDescription>Lock in your player roles for the 1st innings before the match begins. Your choices cannot be changed after locking.</CardDescription>
                    </CardHeader>
                </Card>

                {roles['1st-innings'].map(role => (
                    <div key={role.id}>
                        <h3 className="text-xl font-bold font-headline mb-1 flex items-center gap-2"><Flame className="w-5 h-5 text-primary" /> {role.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[...players.IND, ...players.AUS].map(player => (
                                <PlayerSelectionCard
                                    key={`${role.id}-${player.id}`}
                                    player={player}
                                    isSelected={selections[role.id] === player.id}
                                    isDisabled={isLocked || (!!selections[role.id] && selections[role.id] !== player.id)}
                                    onSelect={() => !isLocked && handleSelectPlayer(role.id, player.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                
                <ScoringRulesCard />

                <div className="sticky bottom-6 z-10">
                    <Button onClick={handleLock} disabled={isLocked} size="lg" className="w-full shadow-2xl shadow-primary/20">
                        <Lock className="w-5 h-5 mr-2" />
                        {isLocked ? `Selections Locked` : `Lock Selections for 1st Innings`}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

function FirstInningsView({ onInningsEnd }: { onInningsEnd: () => void }) {
    type PredictionStatus = 'predicting' | 'waiting' | 'result';
    const [currentPredIndex, setCurrentPredIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, boolean>>({});
    const [status, setStatus] = useState<PredictionStatus>('predicting');
    
    const currentPrediction = microPredictions[currentPredIndex];
    const hasAnswered = answers[currentPredIndex] !== undefined;

    const handlePrediction = (answer: boolean) => {
        if(hasAnswered) return;
        setAnswers(prev => ({...prev, [currentPredIndex]: answer}));
        setStatus('waiting');

        // Simulate waiting for outcome
        setTimeout(() => {
            setStatus('result');
            // Then wait a bit more to show result before moving on
            setTimeout(() => {
                if (currentPredIndex < microPredictions.length - 1) {
                    setCurrentPredIndex(prev => prev + 1);
                    setStatus('predicting');
                } else {
                    onInningsEnd();
                }
            }, 2500);
        }, 2000);
    }

    if (!currentPrediction) {
        return <p>Loading predictions...</p>
    }

    const isCorrect = status === 'result' && answers[currentPredIndex] === currentPrediction.outcome;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">1st Innings: LIVE</CardTitle>
                    <CardDescription>Make your predictions as the action unfolds.</CardDescription>
                </CardHeader>
            </Card>

            <AnimatePresence mode="wait">
                 <motion.div
                    key={currentPredIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center justify-center gap-2"><Zap className="w-6 h-6 text-primary"/> Micro-Prediction</CardTitle>
                            <CardDescription>Prediction {currentPredIndex + 1} of {microPredictions.length}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-2xl font-semibold text-balance min-h-[64px]">{currentPrediction.question}</p>
                             <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => handlePrediction(true)} disabled={hasAnswered} className="h-20 text-xl">Yes</Button>
                                <Button onClick={() => handlePrediction(false)} disabled={hasAnswered} variant="outline" className="h-20 text-xl">No</Button>
                            </div>
                            {hasAnswered && (
                                <div className='mt-4'>
                                    {status === 'waiting' && <p className='font-semibold text-muted-foreground animate-pulse'>Waiting for outcome...</p>}
                                    {status === 'result' && (
                                        isCorrect ? (
                                            <p className="font-bold text-green-400">Correct! +10 Points</p>
                                        ) : (
                                            <p className="font-bold text-red-400">Incorrect! The outcome was '{currentPrediction.outcome ? 'Yes' : 'No'}'</p>
                                        )
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
            
            <ScoringRulesCard />
        </div>
    )
}

function InningsBreakView({ onStartNextInnings }: { onStartNextInnings: () => void }) {
    return (
        <div className="text-center space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Innings Break</CardTitle>
                    <CardDescription>Review the 1st innings and prepare your roles for the 2nd innings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The 2nd Innings selection will begin shortly...</p>
                </CardContent>
                 <CardFooter>
                     <Button onClick={onStartNextInnings}>Start 2nd Innings Selections</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function LeaderboardView() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Match Leaderboard</CardTitle>
                <CardDescription>Live rankings for the {matchDetails.title} match.</CardDescription>
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
    );
}

export default function CricketMatchPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const [matchPhase, setMatchPhase] = useState('pre-match'); // 'pre-match', '1st-innings', 'break', '2nd-innings', 'leaderboard'
  const [activeTab, setActiveTab] = useState('game');

  if (!matchDetails) {
    return notFound();
  }

  const currentUser = leaderboardData.find(p => p.name === 'You');
  const totalPoints = currentUser?.score || 0;
  const currentUserRank = currentUser?.rank;

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-8">
            <div>
                <Button variant="ghost" asChild className='mb-2 -ml-4'>
                    <Link href="/fantasy/cricket">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Matches
                    </Link>
                </Button>
                 <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    {matchDetails.title}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {matchDetails.series}
                </p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="game">Game</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            <TabsContent value="game" className="mt-6">
                 <Tabs value={matchPhase} onValueChange={setMatchPhase} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="pre-match">Pre-Match</TabsTrigger>
                        <TabsTrigger value="1st-innings" disabled={matchPhase === 'pre-match'}>1st Innings</TabsTrigger>
                        <TabsTrigger value="break" disabled={matchPhase !== 'break'}>Innings Break</TabsTrigger>
                        <TabsTrigger value="2nd-innings" disabled>2nd Innings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pre-match" className="mt-6">
                        <PreMatchView onLockSelections={() => setMatchPhase('1st-innings')}/>
                    </TabsContent>
                    <TabsContent value="1st-innings" className="mt-6">
                        <FirstInningsView onInningsEnd={() => setMatchPhase('break')} />
                    </TabsContent>
                    <TabsContent value="break" className="mt-6">
                        <InningsBreakView onStartNextInnings={() => alert('2nd Innings feature coming soon!')} />
                    </TabsContent>
                    <TabsContent value="2nd-innings" className="mt-6">
                        <p>2nd Innings content will go here.</p>
                    </TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-6">
                <LeaderboardView />
            </TabsContent>
        </Tabs>
        
        <Card className="text-center bg-transparent border-dashed">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Skill Declaration</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>This is a skill-based cricket strategy and prediction game where users make informed decisions based on player roles, match situations, and real-time analysis. Outcomes depend entirely on the user’s knowledge, judgment, and timing.</p>
                <p>Success in this game depends on the participant’s understanding of cricket, analytical skills, and ability to make strategic decisions. There is no element of chance or randomness involved. This platform does not involve betting, wagering, or games of chance.</p>
            </CardContent>
             <CardFooter className="justify-center text-xs text-muted-foreground">
                <p>This game is open only to users aged 18 years and above.</p>
            </CardFooter>
        </Card>
    </div>
  );
}


    