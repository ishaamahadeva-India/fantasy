
'use client';

import { useMemo, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUp, BrainCircuit, Gamepad2, PieChart, Star, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';
import Link from 'next/link';
import { useCollection, useFirestore, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { FanRating, Star as StarType, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PulseCheck } from '@/components/fan-zone/pulse-check';
import { FavoriteButton } from '@/components/fan-zone/favorite-button';

function CommunityStarRatingDisplay({ ratings, isLoading }: { ratings: FanRating[] | null, isLoading: boolean }) {
    const starAttributes = ['Screen Presence', 'Acting Range', 'Dialogue Delivery', 'Consistency'];
    const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!ratings || ratings.length === 0) {
            setAverageRatings({});
            return;
        }

        const newAverageRatings: Record<string, number> = {};
        starAttributes.forEach(attr => {
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
                {starAttributes.map(attr => (
                    <div key={attr} className="text-center space-y-1">
                        <Skeleton className="h-5 w-24 mx-auto" />
                        <Skeleton className="h-10 w-16 mx-auto" />
                    </div>
                ))}
            </div>
        )
    }

    if (ratings === null || ratings.length === 0) {
        return <p className="text-center text-muted-foreground">Be the first to rate this star's attributes!</p>
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {starAttributes.map(attr => (
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

function StarProfileSkeleton() {
     return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6"><Skeleton className="h-8 w-48" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-square w-full" />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Card><CardContent className="p-4"><Skeleton className="h-24" /></CardContent></Card>
                    <Card><CardContent className="p-4"><Skeleton className="h-24" /></CardContent></Card>
                    <Separator />
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                     </div>
                </div>
            </div>
        </div>
    )
}

export default function StarProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const starAttributes = ['Screen Presence', 'Acting Range', 'Dialogue Delivery', 'Consistency'];

  const firestore = useFirestore();
  const { user } = useUser();
  const starRef = firestore ? doc(firestore, 'stars', id) : null;
  const { data: star, isLoading: starLoading } = useDoc<StarType>(starRef);
  
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const ratingsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ratings'),
      where('entityId', '==', id),
      where('entityType', '==', 'star')
    );
  }, [firestore, id]);

  const { data: ratings, isLoading: ratingsLoading } = useCollection<FanRating>(ratingsQuery);

  if (starLoading) {
    return <StarProfileSkeleton />;
  }

  if (!star) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
        <div className="mb-6">
            <Button variant="ghost" asChild>
                <Link href="/fan-zone/movies">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Movie Zone
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-1">
                <Card className="overflow-hidden">
                    <div className="relative aspect-square w-full">
                        <Image
                        src={star.avatar || `https://picsum.photos/seed/${star.id}/400/400`}
                        alt={star.name}
                        fill
                        className="object-cover"
                        />
                    </div>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
                        {star.name}
                    </h1>
                     <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {star.profession && <Badge variant="default">{star.profession}</Badge>}
                        {star.genre?.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
                        {star.industry && <Badge variant="outline">{star.industry}</Badge>}
                        {star.trendingRank && <Badge variant="default">#{star.trendingRank} Trending</Badge>}
                    </div>
                    {star.bio && (
                        <p className="mt-4 text-muted-foreground">{star.bio}</p>
                    )}
                    {(star.dateOfBirth || star.debutYear) && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {star.dateOfBirth && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-semibold">{new Date(star.dateOfBirth).toLocaleDateString()}</p>
                                </div>
                            )}
                            {star.debutYear && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Debut Year</p>
                                    <p className="font-semibold">{star.debutYear}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <PieChart />
                           Fan Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Popularity Index</p>
                            <p className="text-3xl font-bold font-code">{star.popularityIndex?.toFixed(1) || 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Consistency Score</p>
                            <p className="text-3xl font-bold font-code">N/A</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Trend</p>
                            <p className="text-3xl font-bold font-code flex items-center justify-center text-green-400"><ArrowUp /></p>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Community Ratings</CardTitle>
                        <CardDescription>Average scores from the community.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CommunityStarRatingDisplay ratings={ratings} isLoading={ratingsLoading} />
                    </CardContent>
                </Card>

                <Separator />
                
                <div className='space-y-4'>
                    <h3 className="font-headline text-xl">Fan Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <AttributeRating triggerButtonText="Rate Performance" attributes={starAttributes} icon={Star} entityId={star.id} entityType="star" />
                        <FavoriteButton 
                            entityId={star.id} 
                            entityType="star" 
                            userProfile={userProfile || null}
                        />
                        <PulseCheck question={`How do you rate ${star.name}'s recent script selections?`} options={["Excellent", "Average", "Poor"]} entityId={star.id} entityType='star' />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
