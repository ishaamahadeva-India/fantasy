
'use client';

import { useState, use } from 'react';
import { placeholderNationalTeams } from '@/lib/cricket-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Lock, Users, Trophy, Percent } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NationalTeamProfilePage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const team = placeholderNationalTeams.find((t) => t.id === id);

  if (!team) {
    notFound();
  }
    
  const defaultEra = Object.keys(team.eras)[0];
  const [selectedEra, setSelectedEra] = useState(defaultEra);
  const eraData = team.eras[selectedEra];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/fan-zone/cricket">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cricket Fan Zone
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full bg-white/10 flex items-center justify-center p-4">
              <Image
                src={team.crest}
                alt={team.name}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </Card>
           <div className="mt-4">
            <h1 className="text-4xl font-bold font-headline text-center">
              {team.name}
            </h1>
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Era Selector</CardTitle>
              <CardDescription>Select an era to analyze the team's performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedEra} onValueChange={setSelectedEra}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Era" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(team.eras).map(era => (
                             <SelectItem key={era} value={era}>{era}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Team DNA: {selectedEra}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className='text-center p-4 rounded-lg bg-white/5'>
                    <Percent className="w-8 h-8 mx-auto text-primary mb-2"/>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-3xl font-bold font-code">{eraData.winRate}%</p>
                </div>
                <div className='text-center p-4 rounded-lg bg-white/5'>
                    <Trophy className="w-8 h-8 mx-auto text-primary mb-2"/>
                    <p className="text-sm text-muted-foreground">ICC Trophies</p>
                    <p className="text-3xl font-bold font-code">{eraData.iccTrophies}</p>
                </div>
                 <div className='text-center p-4 rounded-lg bg-white/5'>
                    <Users className="w-8 h-8 mx-auto text-primary mb-2"/>
                    <p className="text-sm text-muted-foreground">Key Players</p>
                    <p className="text-xs font-semibold">{eraData.keyPlayers.join(' · ')}</p>
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Era Analysis (Game Pass)</CardTitle>
                <CardDescription>In-depth analysis of team strategies, player impact, and defining moments of the {selectedEra}.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="relative text-center p-8 rounded-lg bg-white/5">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Lock className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-headline text-xl mb-2">
                    Unlock Full Era Analysis
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Game Pass for detailed analytics.
                  </p>
                  <Button>Unlock Game Pass</Button>
                </div>
                <p className="text-muted-foreground opacity-30">Compare player stats across eras...</p>
                <p className="text-muted-foreground opacity-30 mt-2">Deep dive into tactical shifts...</p>
                <p className="text-muted-foreground opacity-30 mt-2">Watch iconic match highlights...</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
