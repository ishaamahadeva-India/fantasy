
'use client';
import { useState } from 'react';
import { fanWarData } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

export default function FanWarPage() {
  const [battles, setBattles] = useState(fanWarData);

  const handleVote = (battleId: string, entity: 'entityOne' | 'entityTwo') => {
    setBattles(currentBattles => 
      currentBattles.map(battle => {
        if (battle.id === battleId) {
          // In a real app, you'd prevent multiple votes from the same user.
          // For this demo, we'll just increment the votes.
          const newVotes = { ...battle };
          if (entity === 'entityOne') {
            newVotes.entityOne.votes += 1;
          } else {
            newVotes.entityTwo.votes += 1;
          }
          return newVotes;
        }
        return battle;
      })
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline flex items-center gap-2">
            <Flame className="w-8 h-8 text-primary"/>
            Fan War
        </h1>
        <p className="mt-2 text-muted-foreground">
          Vote for your favorite, compare stats, and settle the debate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {battles.map(battle => {
          const totalVotes = battle.entityOne.votes + battle.entityTwo.votes;
          const entityOnePercentage = totalVotes > 0 ? (battle.entityOne.votes / totalVotes) * 100 : 50;

          return (
            <Card key={battle.id} className="overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{battle.title}</CardTitle>
                <CardDescription>{battle.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 items-center relative">
                  {/* Divider */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                     <div className="w-px h-24 bg-border"/>
                     <div className="bg-background border rounded-full p-2 text-primary">
                        <Flame className="w-6 h-6"/>
                     </div>
                     <div className="w-px h-24 bg-border"/>
                  </div>
                  
                  {/* Entity One */}
                  <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-white/10">
                      <AvatarImage src={battle.entityOne.avatar} alt={battle.entityOne.name} />
                      <AvatarFallback>{battle.entityOne.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold font-headline">{battle.entityOne.name}</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                        {battle.entityOne.stats.map(stat => (
                            <p key={stat.label}>{stat.label}: <span className="font-semibold text-foreground">{stat.value}</span></p>
                        ))}
                    </div>
                    <Button onClick={() => handleVote(battle.id, 'entityOne')}>Vote</Button>
                  </div>

                  {/* Entity Two */}
                  <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-white/10">
                      <AvatarImage src={battle.entityTwo.avatar} alt={battle.entityTwo.name} />
                      <AvatarFallback>{battle.entityTwo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold font-headline">{battle.entityTwo.name}</h3>
                     <div className="text-sm space-y-1 text-muted-foreground">
                        {battle.entityTwo.stats.map(stat => (
                            <p key={stat.label}>{stat.label}: <span className="font-semibold text-foreground">{stat.value}</span></p>
                        ))}
                    </div>
                    <Button onClick={() => handleVote(battle.id, 'entityTwo')}>Vote</Button>
                  </div>
                </div>

                {/* Progress Bar & Vote Count */}
                <div className="mt-6 space-y-2">
                    <Progress value={entityOnePercentage} className="h-4"/>
                    <div className="flex justify-between text-sm font-bold font-code">
                        <div className="text-left">
                            <p className="text-primary">{entityOnePercentage.toFixed(0)}%</p>
                            <p className="text-xs font-normal text-muted-foreground">{battle.entityOne.votes.toLocaleString()} votes</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary">{(100 - entityOnePercentage).toFixed(0)}%</p>
                            <p className="text-xs font-normal text-muted-foreground">{battle.entityTwo.votes.toLocaleString()} votes</p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
