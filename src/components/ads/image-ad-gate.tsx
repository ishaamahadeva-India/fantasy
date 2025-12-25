'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { selectAdForEntry, selectAdForCampaign, incrementAdViews } from '@/firebase/firestore/image-advertisements';
import { createImageAdView, completeImageAdView, hasUserViewedAd, hasUserViewedAdForCampaign, getUserAdViews } from '@/firebase/firestore/image-ad-views';
import { ImageAdDisplay } from './image-ad-display';
import { Skeleton } from '@/components/ui/skeleton';
import type { ImageAdvertisement } from '@/lib/types';

type ImageAdGateProps = {
  tournamentId?: string; // For cricket tournaments
  campaignId?: string; // For movie fantasy campaigns
  onComplete: (adViewId?: string, advertisementId?: string) => void;
  onCancel?: () => void;
  required?: boolean;
};

export function ImageAdGate({ 
  tournamentId,
  campaignId,
  onComplete, 
  onCancel,
  required = true 
}: ImageAdGateProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [ad, setAd] = useState<ImageAdvertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    const checkAndLoadAd = async () => {
      if (!firestore || !user || (!tournamentId && !campaignId)) {
        setIsLoading(false);
        return;
      }

      try {
        const targetId = tournamentId || campaignId!;
        const isCampaign = !!campaignId;
        
        // Check if user already viewed an ad
        const alreadyViewed = isCampaign
          ? await hasUserViewedAdForCampaign(firestore, user.uid, targetId)
          : await hasUserViewedAd(firestore, user.uid, targetId);
        
        if (alreadyViewed) {
          setHasViewed(true);
          setIsLoading(false);
          // User already viewed, allow entry
          setTimeout(() => {
            onComplete();
          }, 500);
          return;
        }

        // Select an ad
        const selectedAd = isCampaign
          ? await selectAdForCampaign(firestore, targetId, user.uid)
          : await selectAdForEntry(firestore, targetId, user.uid);
        
        if (!selectedAd) {
          // No ads available, allow entry or show error
          setIsLoading(false);
          if (required) {
            // If required but no ads, still allow (fallback)
            onComplete();
          } else if (onCancel) {
            onCancel();
          }
          return;
        }

        // Check user's view limit for this ad
        if (selectedAd.maxViewsPerUser) {
          const userViews = await getUserAdViews(firestore, user.uid, selectedAd.id);
          const completedViews = userViews.filter(v => v.wasCompleted).length;
          
          if (completedViews >= selectedAd.maxViewsPerUser) {
            // User reached limit, allow entry
            setHasViewed(true);
            setIsLoading(false);
            onComplete();
            return;
          }
        }

        setAd(selectedAd);
      } catch (error) {
        console.error('Error loading ad:', error);
        // On error, allow entry (don't block user)
        setIsLoading(false);
        if (!required && onCancel) {
          onCancel();
        } else {
          onComplete();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAndLoadAd();
  }, [firestore, user, tournamentId, campaignId, required, onComplete, onCancel]);

  const handleAdComplete = async (advertisementId: string) => {
    if (!firestore || !user || !ad) {
      // If missing required data, still allow entry
      onComplete();
      return;
    }

    try {
      // Create ad view record
      const deviceType = typeof window !== 'undefined' 
        ? window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        : 'desktop';
      
      const browser = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

      const viewData: any = {
        advertisementId: ad.id,
        userId: user.uid,
        viewedAt: new Date(),
        viewedDuration: ad.displayDuration || 5,
        wasCompleted: true,
        clicked: false,
        deviceType,
        browser,
      };

      // Add tournamentId or campaignId based on which one is provided
      if (tournamentId) {
        viewData.tournamentId = tournamentId;
      }
      if (campaignId) {
        viewData.campaignId = campaignId;
      }

      const newView = await createImageAdView(firestore, viewData);

      const viewIdStr = newView.id;
      setViewId(viewIdStr);

      // Mark as completed
      await completeImageAdView(firestore, viewIdStr);

      // Increment ad view count
      await incrementAdViews(firestore, ad.id);

      // Call completion callback with view ID and ad ID
      onComplete(viewIdStr, ad.id);
    } catch (error) {
      console.error('Error completing ad view:', error);
      // Still allow entry even if tracking fails
      onComplete(undefined, ad.id);
    }
  };

  const handleAdClick = async () => {
    if (!firestore || !viewId || !ad?.clickThroughUrl) return;

    try {
      const { trackImageAdClick } = await import('@/firebase/firestore/image-ad-views');
      await trackImageAdClick(firestore, viewId, ad.clickThroughUrl);
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="bg-background rounded-lg p-8 max-w-md w-full mx-4">
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (hasViewed || !ad) {
    return null; // Already viewed or no ad available
  }

  return (
    <ImageAdDisplay
      advertisement={ad}
      onComplete={handleAdComplete}
      onCancel={onCancel}
      required={required}
    />
  );
}

