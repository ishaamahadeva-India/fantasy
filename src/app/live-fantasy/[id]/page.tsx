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
} from '@/components/ui/card';
import { ArrowLeft, Check, Lock, Flame, Zap } from 'lucide-react';
import Link from 'next/link';
import { placeholderCricketers } from '@/lib/cricket-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// --- MOCK DATA ---
const matchDetails = {
  id: 'live-match-1',
  title: 'IND vs AUS',
  series: 'T20 World Cup Final',
  status: 'Upcoming',
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
    },
  ],
};

const livePredictions = [
    { id: 'pred-1', type: 'yesno', question: 'Total score after 1st Over: Over 6.5 runs?', outcome: true, phase: 'Powerplay' },
    { id: 'pred-2', type: 'yesno', question: 'Will a wicket fall in the first 3 overs?', outcome: false, phase: 'Powerplay' },
    { id: 'pred-3', type: 'yesno', question: 'Powerplay (1-6 overs) total score: Over 48.5 runs?', outcome: true, phase: 'Powerplay' },
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

function FirstInningsView({ onInningsEnd }: { onInningsEnd: () => void }) {
    type PredictionStatus = 'predicting' | 'locked' | 'waiting' | 'result';
    const [currentPredIndex, setCurrentPredIndex] = useState(0);
    const [userPredictions, setUserPredictions] = useState<Record<number, { answer: boolean, confidence: number }>>({});
    const [status, setStatus] = useState<PredictionStatus>('predicting');
    
    const currentPrediction = livePredictions[currentPredIndex];
    const hasAnswered = userPredictions[currentPredIndex] !== undefined;

    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [confidence, setConfidence] = useState(1); // 0=Low, 1=Medium, 2=High
    const confidenceLabels = ["Low", "Medium", "High"];
    const pointsMap = { 'Low': {correct: 10, incorrect: -2}, 'Medium': {correct: 15, incorrect: -5}, 'High': {correct: 20, incorrect: -10} };

    const handleLockPrediction = () => {
        if(selectedAnswer === null) {
            toast({ variant: 'destructive', title: 'No Answer', description: 'Please select Yes or No.'});
            return;
        }
        setStatus('locked');
        setUserPredictions(prev => ({...prev, [currentPredIndex]: { answer: selectedAnswer, confidence }}));
        
        toast({ title: 'Prediction Locked!', description: `You predicted '${selectedAnswer ? 'Yes' : 'No'}' with ${confidenceLabels[confidence]} confidence.` });
        
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
                        setSelectedAnswer(null);
                        setConfidence(1);
                    } else {
                        onInningsEnd();
                    }
                }, 3000);
            }, 2000);
        }, 500);
    };

    if (!currentPrediction) {
        return <p>Loading predictions...</p>
    }

    const isCorrect = status === 'result' && userPredictions[currentPredIndex]?.answer === currentPrediction.outcome;
    const points = isCorrect ? pointsMap[confidenceLabels[confidence] as keyof typeof pointsMap].correct : pointsMap[confidenceLabels[confidence] as keyof typeof pointsMap].incorrect;

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
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => setSelectedAnswer(true)} disabled={status !== 'predicting'} variant={selectedAnswer === true ? 'default' : 'outline'} className="h-20 text-xl">Yes</Button>
                                <Button onClick={() => setSelectedAnswer(false)} disabled={status !== 'predicting'} variant={selectedAnswer === false ? 'default' : 'outline'} className="h-20 text-xl">No</Button>
                            </div>
                            
                             <div className="space-y-3 pt-4">
                               <Label htmlFor="confidence-slider" className="font-semibold">Confidence</Label>
                               <Slider
                                 id="confidence-slider"
                                 min={0}
                                 max={2}
                                 step={1}
                                 value={[confidence]}
                                 onValueChange={(val) => setConfidence(val[0])}
                                 disabled={status !== 'predicting'}
                               />
                               <div className="flex justify-between text-xs text-muted-foreground">
                                 <span>Low</span>
                                 <span>Medium</span>
                                 <span>High</span>
                               </div>
                             </div>

                             <Button onClick={handleLockPrediction} disabled={status !== 'predicting'} size="lg" className="w-full">
                                <Lock className="w-4 h-4 mr-2"/> Lock Prediction
                             </Button>

                             {status !== 'predicting' && (
                                <div className='mt-4 min-h-[40px]'>
                                    {status === 'locked' && <p className='font-semibold text-primary animate-pulse'>Prediction Locked! Waiting for event...</p>}
                                    {status === 'waiting' && <p className='font-semibold text-muted-foreground animate-pulse'>Waiting for outcome...</p>}
                                    {status === 'result' && (
                                        isCorrect ? (
                                            <p className="text-lg font-bold text-green-400">Correct! +{points} Points</p>
                                        ) : (
                                            <p className="text-lg font-bold text-red-400">Incorrect! {points} Points. The outcome was '{currentPrediction.outcome ? 'Yes' : 'No'}'</p>
                                        )
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

export default function LiveFantasyMatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params);
  const [matchPhase, setMatchPhase] = useState<'pre-match' | '1st-innings'>(
    'pre-match'
  );

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

      {matchPhase === 'pre-match' && (
        <PreMatchView onLockSelections={() => setMatchPhase('1st-innings')} />
      )}
      {matchPhase === '1st-innings' && (
        <FirstInningsView onInningsEnd={() => alert("Innings Over!")} />
      )}
    </div>
  );
}
