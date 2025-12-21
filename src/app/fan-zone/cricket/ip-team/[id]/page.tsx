
'use client';
import { useMemo, useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import { PulseCheck } from '@/components/fan-zone/pulse-check';
import { useCollection, useFirestore, useDoc, useUser } from '@/firebase';
import type { FanRating, UserProfile, TeamProfile } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/components/fan-zone/favorite-button';

// Using TeamProfile from types.ts


function MomentumVisualizer({ momentum }: { momentum: number[] | undefined }) {
  if (!momentum) return <div className="h-10 text-xs text-muted-foreground flex items-center justify-center">No data</div>;
  return (
    <div className="flex items-end gap-2 h-10">
      {momentum.map((score, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="w-full rounded-t-sm bg-primary/50"
            style={{ height: `${Math.max(score, 10)}%` }}
            title={`Momentum: ${score}`}
          />
          <span className="text-xs font-code mt-1">{score}</span>
        </div>
      ))}
    </div>
  );
}

function FanConfidenceDisplay({ ratings, isLoading }: { ratings: FanRating[] | null, isLoading: boolean }) {
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (!ratings || ratings.length === 0) {
      setConfidence(0);
      return;
    }
    
    // Filter for pulse check ratings, which store the vote in the 'review' field
    const pulseCheckVotes = ratings.filter(r => r.review && ['Very Confident', 'Neutral', 'Not Confident'].includes(r.review));

    if (pulseCheckVotes.length === 0) {
      setConfidence(0);
      return;
    }

    const totalScore = pulseCheckVotes.reduce((acc, vote) => {
        if(vote.review === 'Very Confident') return acc + 100;
        if(vote.review === 'Neutral') return acc + 50;
        return acc; // 'Not Confident' is 0
    }, 0);

    setConfidence(totalScore / pulseCheckVotes.length);

  }, [ratings]);

  if (isLoading) {
    return (
        <div className="text-center">
            <p className="text-sm text-muted-foreground">
                Fan Confidence
            </p>
            <Skeleton className="h-10 w-20 mx-auto mt-1" />
        </div>
    )
  }

  return (
    <div className="text-center">
        <p className="text-sm text-muted-foreground">
            Fan Confidence
        </p>
        <p className="text-4xl font-bold font-code text-primary">
            {confidence.toFixed(0)}%
        </p>
    </div>
  )
}


export default function IpTeamProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const teamAttributes = [
    'Auction Strategy',
    'Youth Policy',
    'Brand Value',
    'Fan Engagement',
  ];
  
  const firestore = useFirestore();
  const { user } = useUser();
  const teamRef = firestore ? doc(firestore, 'teams', id) : null;
  const { data: team, isLoading: teamLoading } = useDoc(teamRef);
  
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc(userProfileRef);

  const ratingsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'ratings'),
        where('entityId', '==', id),
        where('entityType', '==', 'team')
    )
  }, [firestore, id]);

  const { data: ratings, isLoading: ratingsLoading } = useCollection(ratingsQuery);

  if (teamLoading) {
    return <div><Skeleton className="h-screen w-full" /></div>
  }

  if (!team || team.type !== 'ip') {
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
          <div className="mt-4 space-y-4">
            <h1 className="text-4xl font-bold font-headline text-center">
              {team.name}
            </h1>
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
                {(team.homeGround || team.homeVenue) && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Home Ground</p>
                    <p className="font-semibold text-sm">{team.homeGround || team.homeVenue}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center mt-4">
              <FavoriteButton 
                entityId={team.id} 
                entityType="team" 
                userProfile={(userProfile as any) as UserProfile | null}
              />
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">IP League</Badge>
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
                  {team.stabilityIndex?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Squad Balance</p>
                <p className="text-4xl font-bold font-code text-primary">
                  {team.squadBalance?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <FanConfidenceDisplay ratings={ratings as any as FanRating[] | null} isLoading={ratingsLoading} />
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
