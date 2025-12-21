
'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Users, Trophy, Percent } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Note: This component is still partially using placeholder data for "eras"
// as this is a complex data structure not modeled in the DB.
// The main team data is fetched live.
const placeholderEras = {
    "2000s": {
        winRate: 65,
        iccTrophies: 2,
        keyPlayers: ["Sachin Tendulkar", "Sourav Ganguly", "Anil Kumble"],
        definingMoment: "The 2007 T20 World Cup victory under a young MS Dhoni, which heralded a new era in Indian cricket and sparked the IPL revolution."
    },
    "2010s": {
        winRate: 72,
        iccTrophies: 3,
        keyPlayers: ["MS Dhoni", "Virat Kohli", "Yuvraj Singh"],
        definingMoment: "Lifting the 2011 ODI World Cup on home soil after 28 years, a moment etched in the memory of a billion fans as Sachin Tendulkar's dream came true."
    }
};

type TeamProfile = {
    id: string;
    name: string;
    type: 'ip' | 'national';
    logoUrl?: string;
};

export default function NationalTeamProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();
  const teamRef = firestore ? doc(firestore, 'teams', id) : null;
  const { data: team, isLoading } = useDoc<TeamProfile>(teamRef);

  const eras = placeholderEras; // Using placeholder for now
  const defaultEra = Object.keys(eras)[0];
  const [selectedEra, setSelectedEra] = useState(defaultEra);
  const eraData = eras[selectedEra as keyof typeof eras];

  if (isLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!team || team.type !== 'national') {
    notFound();
  }

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
                src={team.logoUrl || `https://picsum.photos/seed/${team.id}/400/400`}
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
                        {Object.keys(eras).map(era => (
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
                <CardTitle className="font-headline">Defining Moment: {selectedEra}</CardTitle>
                <CardDescription>A summary of the team's defining achievement during this era.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="p-4 rounded-lg bg-white/5 prose prose-invert max-w-none prose-sm">
                 <p className='text-muted-foreground'>{eraData.definingMoment}</p>
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
