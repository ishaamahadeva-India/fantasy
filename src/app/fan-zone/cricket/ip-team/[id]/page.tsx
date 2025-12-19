
'use client';
import { use } from 'react';
import { placeholderIpTeams } from '@/lib/cricket-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import { PulseCheck } from '@/components/fan-zone/pulse-check';

function MomentumVisualizer({ momentum }: { momentum: number[] }) {
    return (
        <div className="flex items-end gap-2 h-10">
            {momentum.map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                        className="w-full rounded-t-sm bg-primary/50"
                        style={{ height: `${Math.max(score, 10)}%`}}
                        title={`Momentum: ${score}`}
                    />
                    <span className="text-xs font-code mt-1">{score}</span>
                </div>
            ))}
        </div>
    )
}

export default function IpTeamProfilePage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const team = placeholderIpTeams.find((t) => t.id === id);
  const teamAttributes = ["Auction Strategy", "Youth Policy", "Brand Value", "Fan Engagement"];

  if (!team) {
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
                src={team.logo}
                alt={team.name}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </Card>
          <div className='text-center mt-4'>
            <p className='text-sm text-muted-foreground'>{team.homeVenue}</p>
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
              {team.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{team.league}</Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Team Intelligence Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Stability Index
                </p>
                <p className="text-4xl font-bold font-code text-primary">
                  {team.stabilityIndex.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Squad Balance</p>
                <p className="text-4xl font-bold font-code text-primary">
                  {team.squadBalance.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Fan Confidence
                </p>
                <p className="text-4xl font-bold font-code text-primary">
                  {team.fanConfidence}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Momentum</p>
                <MomentumVisualizer momentum={team.momentum} />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-xl">Fan Actions</h3>
            <div className="flex flex-wrap gap-4">
              <AttributeRating
                triggerButtonText="Rate Team Attributes"
                attributes={teamAttributes}
                icon={BrainCircuit}
                entityId={team.id}
                entityType="team"
              />
               <PulseCheck 
                 question="How confident are you in the team's chances this season?"
                 options={['Very Confident', 'Neutral', 'Not Confident']}
                 entityId={team.id}
                 entityType="team"
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
