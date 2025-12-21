
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Check } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { updateWatchlist } from '@/firebase/firestore/users';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

type WatchlistButtonProps = {
    movieId: string;
    userProfile: UserProfile | null;
};

export function WatchlistButton({ movieId, userProfile }: WatchlistButtonProps) {
    const { user, isLoading: userLoading } = useUser();
    const firestore = useFirestore();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (userProfile?.watchlist?.includes(movieId)) {
            setIsSaved(true);
        } else {
            setIsSaved(false);
        }
    }, [userProfile, movieId]);

    const handleToggleWatchlist = () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to save to your watchlist.',
            });
            return;
        }

        const newIsSaved = !isSaved;
        updateWatchlist(firestore, user.uid, movieId, isSaved);
        setIsSaved(newIsSaved); // Optimistic update

        toast({
            title: newIsSaved ? 'Saved to Watchlist' : 'Removed from Watchlist',
            description: newIsSaved ? 'This movie has been added to your profile.' : 'This movie has been removed from your profile.',
        });
    };

    return (
        <Button variant="outline" size="lg" onClick={handleToggleWatchlist} disabled={userLoading}>
            {isSaved ? <Check className="mr-2" /> : <Bookmark className="mr-2" />}
            {isSaved ? 'Saved to Watchlist' : 'Save to Watchlist'}
        </Button>
    );
}
