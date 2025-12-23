'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  articleId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  interactive?: boolean;
};

export function StarRating({ articleId, size = 'md', showLabel = true, interactive = true }: StarRatingProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Fetch ratings for this article
  useEffect(() => {
    const fetchRatings = async () => {
      if (!firestore || !articleId) return;

      try {
        const ratingsRef = collection(firestore, 'ratings');
        const articleRatingsQuery = query(
          ratingsRef,
          where('articleId', '==', articleId)
        );
        const snapshot = await getDocs(articleRatingsQuery);
        
        const ratings: number[] = [];
        let userRatingValue: number | null = null;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rating && typeof data.rating === 'number') {
            ratings.push(data.rating);
            if (user && data.userId === user.uid) {
              userRatingValue = data.rating;
            }
          }
        });

        if (ratings.length > 0) {
          const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          setAverageRating(avg);
          setTotalRatings(ratings.length);
          setRating(avg);
        }

        if (userRatingValue !== null) {
          setUserRating(userRatingValue);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [firestore, articleId, user]);

  const handleRatingClick = async (selectedRating: number) => {
    if (!interactive || !user || !firestore || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Check if user already rated this article
      const ratingsRef = collection(firestore, 'ratings');
      const userRatingQuery = query(
        ratingsRef,
        where('articleId', '==', articleId),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(userRatingQuery);

      if (!snapshot.empty) {
        // Update existing rating
        const existingRatingDoc = snapshot.docs[0];
        await updateDoc(doc(firestore, 'ratings', existingRatingDoc.id), {
          rating: selectedRating,
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Rating Updated',
          description: `You rated this article ${selectedRating} star${selectedRating > 1 ? 's' : ''}.`,
        });
      } else {
        // Create new rating
        await addDoc(ratingsRef, {
          articleId,
          userId: user.uid,
          rating: selectedRating,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Rating Submitted',
          description: `You rated this article ${selectedRating} star${selectedRating > 1 ? 's' : ''}.`,
        });
      }

      setUserRating(selectedRating);
      
      // Recalculate average
      const allRatingsQuery = query(
        ratingsRef,
        where('articleId', '==', articleId)
      );
      const allSnapshot = await getDocs(allRatingsQuery);
      const allRatings: number[] = [];
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.rating && typeof data.rating === 'number') {
          allRatings.push(data.rating);
        }
      });

      if (allRatings.length > 0) {
        const avg = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
        setAverageRating(avg);
        setTotalRatings(allRatings.length);
        setRating(avg);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || (userRating !== null ? userRating : rating);
  const isInteractive = interactive && user && !isSubmitting;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= displayRating;
          const isHalfFilled = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;
          
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleRatingClick(starValue)}
              onMouseEnter={() => isInteractive && setHoveredRating(starValue)}
              onMouseLeave={() => isInteractive && setHoveredRating(0)}
              disabled={!isInteractive}
              className={cn(
                'transition-colors',
                isInteractive && 'cursor-pointer hover:scale-110',
                !isInteractive && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled && 'fill-amber-400 text-amber-400',
                  !isFilled && 'text-muted-foreground',
                  isHalfFilled && 'fill-amber-200 text-amber-400'
                )}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <div className="flex items-center gap-2 text-sm">
          {!isLoading && (
            <>
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              {totalRatings > 0 && (
                <span className="text-muted-foreground">
                  ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              )}
              {userRating !== null && (
                <span className="text-xs text-muted-foreground">
                  • Your rating: {userRating} star{userRating > 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

