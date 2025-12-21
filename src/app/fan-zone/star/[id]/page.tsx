
'use client';

import { useMemo, useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
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
import { getStarEras } from '@/firebase/firestore/star-eras';
import type { StarEra } from '@/firebase/firestore/star-eras';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function StarProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const starAttributes = ['Screen Presence', 'Acting Range', 'Dialogue Delivery', 'Consistency'];

  const firestore = useFirestore();
  const { user } = useUser();
  const starRef = firestore ? doc(firestore, 'stars', id) : null;
  const { data: star, isLoading: starLoading } = useDoc(starRef);
  
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc(userProfileRef);

  const ratingsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ratings'),
      where('entityId', '==', id),
      where('entityType', '==', 'star')
    );
  }, [firestore, id]);

  const { data: ratings, isLoading: ratingsLoading } = useCollection(ratingsQuery);
  
  const [starEras, setStarEras] = useState<StarEra[]>([]);
  const [erasLoading, setErasLoading] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [era1, setEra1] = useState<string>('');
  const [era2, setEra2] = useState<string>('');

  // Fetch star eras
  useEffect(() => {
    if (!firestore || !id) return;

    const fetchEras = async () => {
      setErasLoading(true);
      try {
        const eras = await getStarEras(firestore, id);
        setStarEras(eras);
        if (eras.length >= 2) {
          setEra1(eras[0].eraName);
          setEra2(eras[1].eraName);
        }
      } catch (error) {
        console.error('Error fetching star eras:', error);
      } finally {
        setErasLoading(false);
      }
    };

    fetchEras();
  }, [firestore, id]);

  if (starLoading) {
    return <StarProfileSkeleton />;
  }

  if (!star) {
    notFound();
  }

  const selectedEra1 = starEras.find(e => e.eraName === era1);
  const selectedEra2 = starEras.find(e => e.eraName === era2);

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
                        {star.genre?.map((g: string) => <Badge key={g} variant="secondary">{g}</Badge>)}
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
                        <CommunityStarRatingDisplay ratings={ratings as any as FanRating[] | null} isLoading={ratingsLoading} />
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
                            userProfile={(userProfile as any) as UserProfile | null}
                        />
                        <PulseCheck question={`How do you rate ${star.name}'s recent script selections?`} options={["Excellent", "Average", "Poor"]} entityId={star.id} entityType='star' />
                        {starEras.length >= 2 && (
                          <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <BrainCircuit className="w-4 h-4 mr-2" />
                                Compare Eras
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Compare Eras</DialogTitle>
                                <DialogDescription>
                                  Compare {star.name}'s performance across different career eras.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Era 1</label>
                                    <Select value={era1} onValueChange={setEra1}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {starEras.map(era => (
                                          <SelectItem key={era.id || era.eraName} value={era.eraName}>
                                            {era.eraName} ({era.startYear}{era.endYear ? `-${era.endYear}` : '+'})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Era 2</label>
                                    <Select value={era2} onValueChange={setEra2}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {starEras.map(era => (
                                          <SelectItem key={era.id || era.eraName} value={era.eraName}>
                                            {era.eraName} ({era.startYear}{era.endYear ? `-${era.endYear}` : '+'})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                {selectedEra1 && selectedEra2 && (
                                  <div className="grid grid-cols-2 gap-6">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>{selectedEra1.eraName}</CardTitle>
                                        <CardDescription>
                                          {selectedEra1.startYear}{selectedEra1.endYear ? ` - ${selectedEra1.endYear}` : '+'}
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Average Rating</p>
                                          <p className="text-2xl font-bold">{selectedEra1.averageRating.toFixed(1)}/10</p>
                                        </div>
                                        {selectedEra1.definingRole && (
                                          <div>
                                            <p className="text-sm text-muted-foreground">Defining Role</p>
                                            <p className="font-semibold">{selectedEra1.definingRole}</p>
                                          </div>
                                        )}
                                        {selectedEra1.notableMovies.length > 0 && (
                                          <div>
                                            <p className="text-sm text-muted-foreground">Notable Movies</p>
                                            <p className="text-sm">{selectedEra1.notableMovies.length} movies</p>
                                          </div>
                                        )}
                                        {selectedEra1.notes && (
                                          <div>
                                            <p className="text-sm text-muted-foreground">Notes</p>
                                            <p className="text-sm">{selectedEra1.notes}</p>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                    
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>{selectedEra2.eraName}</CardTitle>
                                        <CardDescription>
                                          {selectedEra2.startYear}{selectedEra2.endYear ? ` - ${selectedEra2.endYear}` : '+'}
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Average Rating</p>
                                          <p className="text-2xl font-bold">{selectedEra2.averageRating.toFixed(1)}/10</p>
                                        </div>
                                        {selectedEra2.definingRole && (
                                          <div>
                                            <p className="text-sm text-muted-foreground">Defining Role</p>
                                            <p className="font-semibold">{selectedEra2.definingRole}</p>
                                          </div>
                                        )}
                                        {selectedEra2.notableMovies.length > 0 && (
                                          <div>
                                            <p className="text-sm text-muted-foreground">Notable Movies</p>
                                            <p className="text-sm">{selectedEra2.notableMovies.length} movies</p>
                                          </div>
                                        )}
                                        {selectedEra2.notes && (
                                          <div>
                                            <p className="text-sm text-muted-foreground">Notes</p>
                                            <p className="text-sm">{selectedEra2.notes}</p>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                                
                                {starEras.length < 2 && (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <p>At least 2 eras are required for comparison.</p>
                                    <p className="text-sm mt-2">Add eras in the admin panel to enable this feature.</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
