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
import { ArrowLeft, Check, Lock, Flame } from 'lucide-react';
import Link from 'next/link';
import { placeholderCricketers } from '@/lib/cricket-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

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
    IND: placeholderCricketers.filter(p => p.country === 'IND'),
    AUS: [
        { id: 'c4', name: 'Pat Cummins', roles: ['Bowler', 'Captain'], country: 'AUS', avatar: 'https://picsum.photos/seed/cummins/400/400', consistencyIndex: 8.9, impactScore: 9.1, recentForm: [8,7,9,8,9], careerPhase: 'Peak' },
        { id: 'c5', name: 'David Warner', roles: ['Batsman', 'Opener'], country: 'AUS', avatar: 'https://picsum.photos/seed/warner/400/400', consistencyIndex: 8.2, impactScore: 9.0, recentForm: [70, 20, 90, 45, 30], careerPhase: 'Late' },
        { id: 'c6', name: 'Mitchell Starc', roles: ['Bowler', 'Pacer'], country: 'AUS', avatar: 'https://picsum.photos/seed/starc/400/400', consistencyIndex: 8.5, impactScore: 9.4, recentForm: [9,8,7,9,8], careerPhase: 'Peak' },
    ]
};

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

function PreMatchView() {
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
                  onSelect={() => !isLocked && handleSelectPlayer(role.id, player.id)}
                />
              ))}
            </div>
          </div>
        ))}
        
        <div className="sticky bottom-6 z-10">
            <Button onClick={handleLock} disabled={isLocked} size="lg" className="w-full shadow-2xl shadow-primary/20">
                <Lock className="w-5 h-5 mr-2" />
                {isLocked ? `Selections Locked` : `Lock Selections for 1st Innings`}
            </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LiveFantasyMatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = use(params);

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

      <PreMatchView />

    </div>
  );
}
