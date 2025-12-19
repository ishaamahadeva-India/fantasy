
'use client';
import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Lock, Users, Flame, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { placeholderCricketers } from '@/lib/cricket-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
    AUS: placeholderCricketers.filter(p => p.country === 'AUS' || p.id === 'c2'), // temp
};
// Add Pat Cummins for AUS
players.AUS.push({ id: 'c4', name: 'Pat Cummins', roles: ['Bowler'], country: 'AUS', avatar: 'https://picsum.photos/seed/cummins/400/400', consistencyIndex: 8.9, impactScore: 9.1, recentForm: [], careerPhase: 'Peak' });


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


function PreMatchView() {
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [isLocked, setIsLocked] = useState(false);

    const handleSelectPlayer = (roleId: string, playerId: string) => {
        setSelections(prev => ({
            ...prev,
            [roleId]: prev[roleId] === playerId ? '' : playerId
        }));
    };

    const handleLockSelections = () => {
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
            description: 'Good luck! Micro-predictions will appear as the match goes live.',
        });
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
                                    key={player.id}
                                    player={player}
                                    isSelected={selections[role.id] === player.id}
                                    isDisabled={isLocked || (!!selections[role.id] && selections[role.id] !== player.id)}
                                    onSelect={() => !isLocked && handleSelectPlayer(role.id, player.id)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                <div className="sticky bottom-6 z-10">
                    <Button onClick={handleLockSelections} disabled={isLocked} size="lg" className="w-full shadow-2xl shadow-primary/20">
                        <Lock className="w-5 h-5 mr-2" />
                        {isLocked ? `Selections Locked` : `Lock Selections for 1st Innings`}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}


export default function CricketMatchPage({ params }: { params: { id: string } }) {
  const { id } = use(params);

  if (!matchDetails) {
    return notFound();
  }

  return (
    <div className="space-y-6">
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

        <Tabs defaultValue="pre-match" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pre-match">Pre-Match</TabsTrigger>
                <TabsTrigger value="1st-innings" disabled>1st Innings</TabsTrigger>
                <TabsTrigger value="2nd-innings" disabled>2nd Innings</TabsTrigger>
                <TabsTrigger value="leaderboard" disabled>Leaderboard</TabsTrigger>
            </TabsList>
            <TabsContent value="pre-match" className="mt-6">
                <PreMatchView />
            </TabsContent>
            {/* Other TabsContent will be built in later phases */}
        </Tabs>
    </div>
  );
}
