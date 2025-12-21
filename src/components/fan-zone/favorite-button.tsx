'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

type FavoriteButtonProps = {
    entityId: string;
    entityType: 'cricketer' | 'star' | 'team';
    userProfile: UserProfile | null;
};

export function FavoriteButton({ entityId, entityType, userProfile }: FavoriteButtonProps) {
    const { user, isLoading: userLoading } = useUser();
    const firestore = useFirestore();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (userProfile?.favorites?.[entityType]?.includes(entityId)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [userProfile, entityId, entityType]);

    const handleToggleFavorite = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to add favorites.',
            });
            return;
        }

        try {
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            const currentFavorites = userDoc.data()?.favorites || {};
            const entityFavorites = currentFavorites[entityType] || [];

            const newIsFavorite = !isFavorite;
            let updatedFavorites = { ...currentFavorites };

            if (newIsFavorite) {
                updatedFavorites[entityType] = [...entityFavorites, entityId];
            } else {
                updatedFavorites[entityType] = entityFavorites.filter((id: string) => id !== entityId);
            }

            await updateDoc(userRef, {
                favorites: updatedFavorites,
            });

            setIsFavorite(newIsFavorite);
            toast({
                title: newIsFavorite ? 'Added to Favorites' : 'Removed from Favorites',
                description: newIsFavorite 
                    ? 'This has been added to your favorites.' 
                    : 'This has been removed from your favorites.',
            });
        } catch (error) {
            console.error('Error updating favorites:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update favorites. Please try again.',
            });
        }
    };

    return (
        <Button 
            variant="outline" 
            size="lg" 
            onClick={handleToggleFavorite} 
            disabled={userLoading}
            className={isFavorite ? 'border-primary text-primary' : ''}
        >
            <Heart className={`mr-2 ${isFavorite ? 'fill-primary' : ''}`} />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </Button>
    );
}

