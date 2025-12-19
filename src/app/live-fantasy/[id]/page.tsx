
'use client';
import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ArrowLeft, Check, Lock, Flame, Zap, HelpCircle, User, Award } from 'lucide-react';
import Link from 'next/link';
import { placeholderCricketers } from '@/lib/cricket-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';


// --- MOCK DATA ---
const matchDetails = {
  id: 'live-match-1',
  title: 'IND vs AUS',
  series: 'T20 World Cup Final',
  status: 'Live',
};

const roles = {
  '1st-innings': [
    {
      id: 'powerplay-king',
      title: 'Powerplay King (Batting)',
      description: 'Scores most runs in overs 1-6.',
    },
    {
      id: 'new-ball-striker',
      title: 'New Ball Striker (Bowling)',
      description: 'Takes most wickets with the new ball.',
    },
  ],
};

const players = {
  IND: placeholderCricketers.filter((p) => p.country === 'IND'),
  AUS: [
    {
      id: 'c4',
      name: 'Pat Cummins',
      roles: ['Bowler', 'Captain'],
      country: 'AUS',
      avatar: 'https://picsum.photos/seed/cummins/400/400',
      consistencyIndex: 8.9,
      impactScore: 9.1,
      recentForm: [8, 7, 9, 8, 9],
      careerPhase: 'Peak',
      trendingRank: 0
    },
    {
      id: 'c5',
      name: 'David Warner',
      roles: ['Batsman', 'Opener'],
      country: 'AUS',
      avatar: 'https://picsum.photos/seed/warner/400/400',
      consistencyIndex: 8.2,
      impactScore: 9.0,
      recentForm: [70, 20, 90, 45, 30],
      careerPhase: 'Late',
      trendingRank: 0
    },
    {
      id: 'c6',
      name: 'Mitchell Starc',
      roles: ['Bowler', 'Pacer'],
      country: 'AUS',
      avatar: 'https://picsum.photos/seed/starc/400/400',
      consistencyIndex: 8.5,
      impactScore: 9.4,
      recentForm: [9, 8, 7, 9, 8],
      careerPhase: 'Peak',
      trendingRank: 0
    },
  ],
};

const livePredictions = [
    { 
        id: 'pred-1', 
        type: 'yesno' as const, 
        question: 'Will a wicket fall in the first 3 overs?', 
        outcome: false, 
        phase: 'Powerplay',
    },
    { 
        id: 'pred-2', 
        type: 'range' as const, 
        question: 'How many runs will be scored in the Powerplay (1-6 overs)?', 
        options: ['31-40', '41-50', '51-60', '61+'],
        outcome: '51-60',
        phase: 'Powerplay',
    },
    {
        id: 'pred-3',
        type: 'ranking' as const,
        question: 'Rank the top run-scorer in the first 10 overs.',
        options: ['c1', 'c3', 'c5'], // Kohli, Rohit, Warner
        outcome: ['c1', 'c5', 'c3'], // Actual ranking
        phase: 'Middle Overs',
    }
];

const leaderboardData = [
  { rank: 1, name: 'CricketFan1', score: 120 },
  { rank: 2, name: 'You', score: 110 },
  { rank: 3, name: 'StrategicThinker', score: 105 },
  { rank: 4, name: 'ThePredictor', score: 95 },
  { rank: 5, name: 'LuckyGuess', score: 80 },
];


function PlayerSelectionCard({
  player,
  isSelected,
  isDisabled,
  onSelect,
}: {
  player: any;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        'p-3 text-center transition-all cursor-pointer relative overflow-hidden',
        isSelected && 'border-primary ring-2 ring-primary',
        isDisabled && 'opacity-50 cursor-not-allowed bg-white/5'
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="check-icon"
          className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
      <Image
        src={player.avatar}
        alt={player.name}
        width={80}
        height={80}
        className="rounded-full mx-auto"
      />
      <p className="font-semibold mt-2 text-sm truncate">{player.name}</p>
    </Card>
  );
}


function ScoringRulesCard() {
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl"><HelpCircle className="w-6 h-6"/> Points Engine</CardTitle>
                <CardDescription>Points are awarded based on predictions and streaks. All points are final.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-6">
                
                <div>
                    <h4 className="font-bold text-base mb-2">Range-Based Predictions</h4>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Exact Range</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+25</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Adjacent Range</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+15</TableCell>
                            </TableRow>
                             <TableRow className='border-b-0'>
                                <TableCell className="text-red-400">Wrong Range</TableCell>
                                <TableCell className="text-right font-code text-red-400 font-bold">-5</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <h4 className="font-bold text-base mb-2">Yes/No with Confidence</h4>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Confidence</TableHead>
                                <TableHead className="text-right text-green-400">Correct</TableHead>
                                <TableHead className="text-right text-red-400">Incorrect</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Low</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+10</TableCell>
                                <TableCell className="text-right font-code text-red-400 font-bold">-2</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Medium</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+15</TableCell>
                                <TableCell className="text-right font-code text-red-400 font-bold">-5</TableCell>
                            </TableRow>
                            <TableRow className='border-b-0'>
                                <TableCell>High</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+20</TableCell>
                                <TableCell className="text-right font-code text-red-400 font-bold">-10</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                 <div>
                    <h4 className="font-bold text-base mb-2">Ranking-Based Predictions</h4>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Correct Rank</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+20</TableCell>
                            </TableRow>
                            <TableRow className='border-b-0'>
                                <TableCell>Off by one rank</TableCell>
                                <TableCell className="text-right font-code text-primary font-bold">+10</TableCell>
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
                                <TableCell className="text-right font-code text-amber-400 font-bold">+40</TableCell>
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
    setSelections((prev) => ({
      ...prev,
      [roleId]: prev[roleId] === playerId ? '' : playerId,
    }));
  };

  const handleLock = () => {
    if (
      Object.values(selections).filter(Boolean).length !==
      roles['1st-innings'].length
    ) {
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
    setTimeout(() => onLockSelections(), 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Pre-Match Selections
            </CardTitle>
            <CardDescription>
              Lock in your player roles for the 1st innings before the match
              begins. Your choices cannot be changed after locking.
            </CardDescription>
          </CardHeader>
        </Card>

        {roles['1st-innings'].map((role) => (
          <div key={role.id}>
            <h3 className="text-xl font-bold font-headline mb-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" /> {role.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {role.description}
            </p>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...players.IND, ...players.AUS].map((player) => (
                <PlayerSelectionCard
                  key={`${role.id}-${player.id}`}
                  player={player}
                  isSelected={selections[role.id] === player.id}
                  isDisabled={
                    isLocked ||
                    (!!selections[role.id] && selections[role.id] !== player.id)
                  }
                  onSelect={() =>
                    !isLocked && handleSelectPlayer(role.id, player.id)
                  }
                />
              ))}
            </div>
          </div>
        ))}
        
        <ScoringRulesCard />

        <div className="sticky bottom-6 z-10">
          <Button
            onClick={handleLock}
            disabled={isLocked}
            size="lg"
            className="w-full shadow-2xl shadow-primary/20"
          >
            <Lock className="w-5 h-5 mr-2" />
            {isLocked ? `Selections Locked` : `Lock Selections for 1st Innings`}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Prediction Components ---

function YesNoPrediction({ prediction, onLock, status }: { prediction: any, onLock: (pred: any) => void, status: string }) {
    const [answer, setAnswer] = useState<boolean | null>(null);
    const [confidence, setConfidence] = useState(1); // 0=Low, 1=Medium, 2=High

    const handleLock = () => {
        if (answer === null) {
             toast({ variant: 'destructive', title: 'No Answer', description: 'Please select Yes or No.'});
             return;
        }
        onLock({ answer, confidence });
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => setAnswer(true)} disabled={status !== 'predicting'} variant={answer === true ? 'default' : 'outline'} className="h-20 text-xl">Yes</Button>
            <Button onClick={() => setAnswer(false)} disabled={status !== 'predicting'} variant={answer === false ? 'default' : 'outline'} className="h-20 text-xl">No</Button>
        </div>
        <div className="space-y-3 pt-4">
            <Label htmlFor="confidence-slider" className="font-semibold">Confidence</Label>
            <Slider
                id="confidence-slider"
                min={0} max={2} step={1}
                value={[confidence]}
                onValueChange={(val) => setConfidence(val[0])}
                disabled={status !== 'predicting'}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span><span>Medium</span><span>High</span>
            </div>
        </div>
        <Button onClick={handleLock} disabled={status !== 'predicting'} size="lg" className="w-full">
            <Lock className="w-4 h-4 mr-2"/> Lock Prediction
        </Button>
      </div>
    );
}

function RangePrediction({ prediction, onLock, status }: { prediction: any, onLock: (pred: any) => void, status: string }) {
    const [answer, setAnswer] = useState<string | null>(null);
    const handleLock = () => {
        if (!answer) {
             toast({ variant: 'destructive', title: 'No Selection', description: 'Please select a range.'});
             return;
        }
        onLock({ answer });
    }

    return (
         <div className="space-y-4">
            <RadioGroup value={answer || ''} onValueChange={setAnswer} disabled={status !== 'predicting'} className="space-y-3">
                {prediction.options.map((option: string) => (
                    <Label key={option} htmlFor={option} className={`flex items-center gap-4 p-4 rounded-lg border-2 ${answer === option ? 'border-primary' : 'border-input'} cursor-pointer`}>
                        <RadioGroupItem value={option} id={option} />
                        <span className='font-semibold text-lg'>{option}</span>
                    </Label>
                ))}
            </RadioGroup>
            <Button onClick={handleLock} disabled={status !== 'predicting'} size="lg" className="w-full">
                <Lock className="w-4 h-4 mr-2"/> Lock Prediction
            </Button>
        </div>
    );
}

function RankingPrediction({ prediction, onLock, status }: { prediction: any, onLock: (pred: any) => void, status: string }) {
    const getPlayerById = (id: string) => [...players.IND, ...players.AUS].find(p => p.id === id);
    const [rankedPlayers, setRankedPlayers] = useState<string[]>([]);

    const handleSelectPlayer = (playerId: string) => {
        setRankedPlayers(prev => {
            if (prev.includes(playerId)) return prev;
            if (prev.length >= prediction.options.length) return prev;
            return [...prev, playerId];
        });
    }

    const handleLock = () => {
        if(rankedPlayers.length < prediction.options.length) {
             toast({ variant: 'destructive', title: 'Incomplete Ranking', description: `Please rank all ${prediction.options.length} players.`});
             return;
        }
        onLock({ answer: rankedPlayers });
    }

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold mb-2">Your Ranking</h4>
                <div className="p-2 rounded-lg bg-background min-h-[140px] space-y-2">
                    {rankedPlayers.map((pId, index) => {
                        const player = getPlayerById(pId);
                        return (
                            <div key={pId} className="flex items-center gap-2 p-2 bg-white/5 rounded-md">
                                <span className="font-bold font-code text-lg w-6">{index + 1}.</span>
                                <Image src={player?.avatar || ''} alt={player?.name || ''} width={32} height={32} className="rounded-full" />
                                <span>{player?.name}</span>
                            </div>
                        )
                    })}
                </div>
                <Button variant="link" onClick={() => setRankedPlayers([])} disabled={status !== 'predicting'}>Reset</Button>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Select Players in Order</h4>
                <div className="grid grid-cols-3 gap-2">
                    {prediction.options.map((pId: string) => {
                        const player = getPlayerById(pId);
                        const isSelected = rankedPlayers.includes(pId);
                        return (
                            <Card key={pId} onClick={() => handleSelectPlayer(pId)} className={cn('p-2 text-center cursor-pointer', isSelected && 'opacity-50')}>
                                <Image src={player?.avatar || ''} alt={player?.name || ''} width={40} height={40} className="rounded-full mx-auto" />
                                <p className="text-xs mt-1 truncate">{player?.name}</p>
                            </Card>
                        )
                    })}
                </div>
            </div>
            <Button onClick={handleLock} disabled={status !== 'predicting'} size="lg" className="w-full">
                <Lock className="w-4 h-4 mr-2"/> Lock Ranking
            </Button>
        </div>
    );
}

function getPointsForResult(prediction: any, userAnswer: any) {
    const confidenceLabels = ["Low", "Medium", "High"];
    const pointsMap = { 'Low': {correct: 10, incorrect: -2}, 'Medium': {correct: 15, incorrect: -5}, 'High': {correct: 20, incorrect: -10} };

    if (!userAnswer) return -5; // Penalty for not answering

    switch(prediction.type) {
        case 'yesno': {
            const isCorrect = userAnswer.answer === prediction.outcome;
            const confidence = userAnswer.confidence;
            const confidenceLabel = confidenceLabels[confidence] as keyof typeof pointsMap;
            return isCorrect ? pointsMap[confidenceLabel].correct : pointsMap[confidenceLabel].incorrect;
        }
        case 'range': {
            if (!userAnswer.answer) return -5;
            const isCorrect = userAnswer.answer === prediction.outcome;
            if (isCorrect) return 25;
            const options = prediction.options;
            const correctIndex = options.indexOf(prediction.outcome);
            const userIndex = options.indexOf(userAnswer.answer);
            if (Math.abs(correctIndex - userIndex) === 1) return 15;
            return -5;
        }
        case 'ranking': {
            let score = 0;
            if (!userAnswer.answer) return score;
            userAnswer.answer.forEach((pId: string, index: number) => {
                if (prediction.outcome[index] === pId) score += 20; // Exact rank
                else if (prediction.outcome.includes(pId)) score += 10; // Off by one
            });
            return Math.round(score / prediction.options.length);
        }
        default: return 0;
    }
}


function FirstInningsView({ onInningsEnd }: { onInningsEnd: () => void }) {
    type PredictionStatus = 'predicting' | 'locked' | 'waiting' | 'result';
    const [currentPredIndex, setCurrentPredIndex] = useState(0);
    const [userPredictions, setUserPredictions] = useState<Record<number, any>>({});
    const [status, setStatus] = useState<PredictionStatus>('predicting');
    
    const currentPrediction = livePredictions[currentPredIndex];

    const handleLockPrediction = (predictionData: any) => {
        setStatus('locked');
        setUserPredictions(prev => ({...prev, [currentPredIndex]: predictionData}));
        
        toast({ title: 'Prediction Locked!' });
        
        // Simulate waiting for outcome
        setTimeout(() => {
            setStatus('waiting');
            setTimeout(() => {
                setStatus('result');
                // Wait to show result before moving on
                setTimeout(() => {
                    if (currentPredIndex < livePredictions.length - 1) {
                        setCurrentPredIndex(prev => prev + 1);
                        setStatus('predicting');
                    } else {
                        onInningsEnd();
                    }
                }, 3000);
            }, 2000);
        }, 500);
    };

    const renderPredictionComponent = () => {
        switch(currentPrediction.type) {
            case 'yesno':
                return <YesNoPrediction prediction={currentPrediction} onLock={handleLockPrediction} status={status}/>
            case 'range':
                return <RangePrediction prediction={currentPrediction} onLock={handleLockPrediction} status={status}/>
            case 'ranking':
                return <RankingPrediction prediction={currentPrediction} onLock={handleLockPrediction} status={status}/>
            default:
                return <p>Unsupported prediction type</p>;
        }
    }
    
    if (!currentPrediction) {
        return <p>Loading predictions...</p>
    }

    const points = status === 'result' ? getPointsForResult(currentPrediction, userPredictions[currentPredIndex]) : 0;

    return (
        <div className="space-y-8">
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
                            <CardTitle className="font-headline flex items-center justify-center gap-2"><Zap className="w-6 h-6 text-primary"/> Live Prediction</CardTitle>
                            <CardDescription>Prediction {currentPredIndex + 1} of {livePredictions.length}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-2xl font-semibold text-balance min-h-[64px]">{currentPrediction.question}</p>
                            {renderPredictionComponent()}
                             {status !== 'predicting' && (
                                <div className='mt-4 min-h-[40px]'>
                                    {status === 'locked' && <p className='font-semibold text-primary animate-pulse'>Prediction Locked! Waiting for event...</p>}
                                    {status === 'waiting' && <p className='font-semibold text-muted-foreground animate-pulse'>Waiting for outcome...</p>}
                                    {status === 'result' && (
                                        <p className={`text-lg font-bold ${points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {points > 0 ? `Correct! +${points} Points` : `Incorrect! ${points} Points`}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
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


export default function LiveFantasyMatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params);
  const [matchPhase, setMatchPhase] = useState<'pre-match' | '1st-innings'>('pre-match');
  const [activeTab, setActiveTab] = useState('game');


  if (id !== 'live-match-1') {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-4">
          <Link href="/live-fantasy">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Matches
          </Link>
        </Button>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          {matchDetails.title}
        </h1>
        <p className="mt-1 text-muted-foreground">{matchDetails.series}</p>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="game">Game</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
            <TabsContent value="game" className="mt-6">
                {matchPhase === 'pre-match' && (
                    <PreMatchView onLockSelections={() => setMatchPhase('1st-innings')} />
                )}
                {matchPhase === '1st-innings' && (
                    <FirstInningsView onInningsEnd={() => alert("Innings Over!")} />
                )}
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
                <p>This is a skill-based cricket strategy and prediction game. Outcomes depend on the user’s knowledge, analysis, and timing. There is no element of chance or randomness.</p>
            </CardContent>
             <CardFooter className="justify-center text-xs text-muted-foreground">
                <p>This game is open only to users aged 18 years and above.</p>
            </CardFooter>
        </Card>
    </div>
  );
}
