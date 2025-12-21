
'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import type { Star } from '@/lib/types';


function FollowButton({ starId }: { starId: string }) {
    const [isFollowing, setIsFollowing] = useState(false);

    const handleFollow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFollowing(!isFollowing);
    };

    return (
        <Button 
            variant={isFollowing ? 'secondary' : 'outline'} 
            size="sm" 
            className="w-full text-xs"
            onClick={handleFollow}
        >
            {isFollowing ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
}

export function StarsTab({ searchTerm }: { searchTerm: string }) {
  const firestore = useFirestore();
  const starsQuery = firestore ? collection(firestore, 'stars') : null;
  const { data: stars, isLoading } = useCollection(starsQuery);

  const filteredStars =
    stars
      ?.filter((star) =>
        star.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

  if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="text-center">
                    <CardContent className="p-4 flex flex-col items-center gap-3">
                         <Skeleton className="w-24 h-24 rounded-full" />
                         <Skeleton className="h-5 w-20" />
                         <Skeleton className="h-8 w-full rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
      )
  }

  if (filteredStars.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No stars found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredStars.map((star) => (
        <Link href={`/fan-zone/star/${star.id}`} key={star.id} className="group">
          <Card className="text-center h-full">
            <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
              <Avatar className="w-24 h-24">
                <AvatarImage src={star.avatar || `https://picsum.photos/seed/${star.id}/400/400`} alt={star.name} />
                <AvatarFallback>{star.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold font-headline text-sm group-hover:text-primary">
                {star.name}
              </h3>
              <FollowButton starId={star.id} />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
