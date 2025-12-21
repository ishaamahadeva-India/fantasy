
'use client';

import { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
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
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/components/fan-zone/favorite-button';
import { getTeamEras } from '@/firebase/firestore/team-eras';
import type { UserProfile, TeamProfile } from '@/lib/types';
import type { TeamEra } from '@/firebase/firestore/team-eras';
import { useEffect } from 'react';

export default function NationalTeamProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const teamRef = firestore ? doc(firestore, 'teams', id) : null;
  const { data: team, isLoading } = useDoc<TeamProfile>(teamRef);
  
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const [eras, setEras] = useState<TeamEra[]>([]);
  const [erasLoading, setErasLoading] = useState(true);
  const [selectedEra, setSelectedEra] = useState<string>('');

  // Fetch team eras from Firestore
  useEffect(() => {
    if (!firestore || !id) return;

    const fetchEras = async () => {
      setErasLoading(true);
      try {
        const teamEras = await getTeamEras(firestore, id);
        setEras(teamEras);
        if (teamEras.length > 0 && !selectedEra) {
          setSelectedEra(teamEras[0].eraName);
        }
      } catch (error) {
        console.error('Error fetching team eras:', error);
      } finally {
        setErasLoading(false);
      }
    };

    fetchEras();
  }, [firestore, id]);

  const eraData = eras.find(e => e.eraName === selectedEra);

  if (isLoading || erasLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!team || team.type !== 'national') {
    notFound();
  }

  // Fallback to placeholder if no eras in database
  const hasEras = eras.length > 0;
  const displayEras = hasEras ? eras : [
    {
      eraName: '2000s',
      winRate: 65,
      iccTrophies: 2,
      keyPlayers: ['Sachin Tendulkar', 'Sourav Ganguly', 'Anil Kumble'],
      definingMoment: 'The 2007 T20 World Cup victory under a young MS Dhoni, which heralded a new era in Indian cricket and sparked the IPL revolution.',
    },
    {
      eraName: '2010s',
      winRate: 72,
      iccTrophies: 3,
      keyPlayers: ['MS Dhoni', 'Virat Kohli', 'Yuvraj Singh'],
      definingMoment: 'Lifting the 2011 ODI World Cup on home soil after 28 years, a moment etched in the memory of a billion fans as Sachin Tendulkar\'s dream came true.',
    },
  ] as any[];

  if (!selectedEra && displayEras.length > 0) {
    setSelectedEra(displayEras[0].eraName);
  }

  const currentEraData = eraData || displayEras.find((e: any) => e.eraName === selectedEra) || displayEras[0];

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
           <div className="mt-4 space-y-4">
            <h1 className="text-4xl font-bold font-headline text-center">
              {team.name}
            </h1>
            {team.country && (
              <p className="text-center text-muted-foreground">{team.country}</p>
            )}
            {team.description && (
              <p className="text-center text-sm text-muted-foreground">{team.description}</p>
            )}
            {(team.foundedYear || team.homeGround) && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {team.foundedYear && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="font-semibold">{team.foundedYear}</p>
                  </div>
                )}
                {team.homeGround && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Home Ground</p>
                    <p className="font-semibold text-sm">{team.homeGround}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center mt-4">
              <FavoriteButton 
                entityId={team.id} 
                entityType="team" 
                userProfile={userProfile || null}
              />
            </div>
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
                        {displayEras.map((era: any) => (
                             <SelectItem key={era.eraName || era} value={era.eraName || era}>
                               {era.eraName || era}
                             </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {!hasEras && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Using sample data. Add eras in admin panel to see real data.
                  </p>
                )}
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
                    <p className="text-3xl font-bold font-code">{currentEraData?.winRate || 0}%</p>
                </div>
                <div className='text-center p-4 rounded-lg bg-white/5'>
                    <Trophy className="w-8 h-8 mx-auto text-primary mb-2"/>
                    <p className="text-sm text-muted-foreground">ICC Trophies</p>
                    <p className="text-3xl font-bold font-code">{currentEraData?.iccTrophies || 0}</p>
                </div>
                 <div className='text-center p-4 rounded-lg bg-white/5'>
                    <Users className="w-8 h-8 mx-auto text-primary mb-2"/>
                    <p className="text-sm text-muted-foreground">Key Players</p>
                    <p className="text-xs font-semibold">{(currentEraData?.keyPlayers || []).join(' · ') || 'N/A'}</p>
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
                 <p className='text-muted-foreground'>{currentEraData?.definingMoment || 'No defining moment data available.'}</p>
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
