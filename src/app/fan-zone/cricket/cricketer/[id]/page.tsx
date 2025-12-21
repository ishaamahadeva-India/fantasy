
'use client';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import { FavoriteButton } from '@/components/fan-zone/favorite-button';
import { useCollection, useFirestore, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { FanRating, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type Cricketer = {
    id: string;
    name: string;
    roles: string[];
    country: string;
    avatarUrl?: string;
    consistencyIndex?: number;
    impactScore?: number;
    recentForm?: number[];
    careerPhase?: 'Early' | 'Peak' | 'Late';
}


function RecentFormVisualizer({ form }: { form: number[] | undefined }) {
    if (!form) return <div className="h-10 text-xs text-muted-foreground flex items-center justify-center">No data</div>;

    const getBarColor = (score: number) => {
        if (score > 75) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    }
    return (
        <div className="flex items-end gap-2 h-10">
            {form.map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                        className={`w-full rounded-t-sm ${getBarColor(score)}`}
                        style={{ height: `${Math.max(score / 2, 15)}%`}}
                        title={`Score: ${score}`}
                    />
                    <span className="text-xs font-code mt-1">{score}</span>
                </div>
            ))}
        </div>
    )
}

function FanRatingDisplay({ ratings, isLoading }: { ratings: FanRating[] | null, isLoading: boolean }) {
    const cricketerAttributes = ["Batting", "Bowling", "Fielding", "Power Hitting"];
    const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!ratings || ratings.length === 0) {
            setAverageRatings({});
            return;
        }

        const newAverageRatings: Record<string, number> = {};
        cricketerAttributes.forEach(attr => {
            const relevantRatings = ratings.map(r => r.ratings[attr]).filter(v => v !== undefined);
            if(relevantRatings.length > 0) {
                const sum = relevantRatings.reduce((acc, curr) => acc + curr, 0);
                newAverageRatings[attr] = sum / relevantRatings.length;
            }
        });
        setAverageRatings(newAverageRatings);

    }, [ratings]);


    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cricketerAttributes.map(attr => (
                    <div key={attr} className="text-center space-y-1">
                        <Skeleton className="h-5 w-24 mx-auto" />
                        <Skeleton className="h-10 w-16 mx-auto" />
                    </div>
                ))}
            </div>
        )
    }

    if (ratings === null || ratings.length === 0) {
        return <p className="text-center text-muted-foreground">Be the first to rate this cricketer's attributes!</p>
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cricketerAttributes.map(attr => (
                 <div key={attr} className="text-center">
                    <p className="text-sm text-muted-foreground">{attr}</p>
                    <p className="text-4xl font-bold font-code text-primary">
                        {averageRatings[attr] ? averageRatings[attr].toFixed(1) : '-'}
                    </p>
                </div>
            ))}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Card><CardContent className="p-4"><Skeleton className="h-24" /></CardContent></Card>
                    <Card><CardContent className="p-4"><Skeleton className="h-24" /></CardContent></Card>
                    <Separator />
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-36" />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function CricketerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const cricketerAttributes = ["Batting", "Bowling", "Fielding", "Power Hitting"];
  
  const firestore = useFirestore();
  const { user } = useUser();
  const cricketerRef = firestore ? doc(firestore, 'cricketers', id) : null;
  const { data: cricketer, isLoading: cricketerLoading } = useDoc(cricketerRef);

  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc(userProfileRef);

  const ratingsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ratings'),
      where('entityId', '==', id),
      where('entityType', '==', 'cricketer')
    );
  }, [firestore, id]);

  const { data: ratings, isLoading: ratingsLoading } = useCollection(ratingsQuery);

  if (cricketerLoading) {
    return <ProfileSkeleton />;
  }

  if (!cricketer) {
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
            <div className="relative aspect-square w-full">
              <Image
                src={cricketer.avatarUrl || `https://picsum.photos/seed/${id}/400/400`}
                alt={cricketer.name}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
              {cricketer.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {cricketer.roles?.map((role: string) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
              <Badge variant="outline">{cricketer.country}</Badge>
              {cricketer.trendingRank && (
                <Badge variant="default">#{cricketer.trendingRank} Trending</Badge>
              )}
            </div>
            {cricketer.bio && (
              <p className="mt-4 text-muted-foreground">{cricketer.bio}</p>
            )}
            {(cricketer.dateOfBirth || cricketer.battingStyle || cricketer.bowlingStyle) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {cricketer.dateOfBirth && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">{new Date(cricketer.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {cricketer.battingStyle && (
                  <div>
                    <p className="text-sm text-muted-foreground">Batting Style</p>
                    <p className="font-semibold">{cricketer.battingStyle}</p>
                  </div>
                )}
                {cricketer.bowlingStyle && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bowling Style</p>
                    <p className="font-semibold">{cricketer.bowlingStyle}</p>
                  </div>
                )}
              </div>
            )}
          </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Performance Intelligence Panel</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Consistency Index</p>
                        <p className="text-4xl font-bold font-code text-primary">{cricketer.consistencyIndex?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Impact Score</p>
                        <p className="text-4xl font-bold font-code text-primary">{cricketer.impactScore?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Career Phase</p>
                        <p className="text-3xl font-bold">{cricketer.careerPhase || 'N/A'}</p>
                    </div>
                    <div className='text-center'>
                         <p className="text-sm text-muted-foreground mb-2">Recent Form</p>
                         <RecentFormVisualizer form={cricketer.recentForm} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Fan Ratings</CardTitle>
                    <CardDescription>Average scores from the community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FanRatingDisplay ratings={ratings as any as FanRating[] | null} isLoading={ratingsLoading} />
                </CardContent>
            </Card>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-xl">Fan Actions</h3>
            <div className="flex gap-4 flex-wrap">
               <AttributeRating
                triggerButtonText="Rate Performance"
                attributes={cricketerAttributes}
                icon={Star}
                entityId={id}
                entityType="cricketer"
              />
              <FavoriteButton 
                entityId={id} 
                entityType="cricketer" 
                userProfile={(userProfile as any) as UserProfile | null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
