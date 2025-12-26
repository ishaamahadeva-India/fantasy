'use client';

import { useState, useEffect, useRef } from 'react';
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
  const hasRunRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  
  // Use refs to store callbacks to avoid infinite loops from function recreation
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);
  
  // Update refs when callbacks change (this doesn't trigger main effect)
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCancelRef.current = onCancel;
  }, [onComplete, onCancel]);

  useEffect(() => {
    // Don't run if already viewed
    if (hasViewed) {
      return;
    }
    
    const targetId = tournamentId || campaignId;
    if (!targetId || !firestore || !user?.uid) {
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple runs for the same targetId
    if (hasRunRef.current === targetId) {
      return;
    }
    
    // Mark as run immediately to prevent concurrent runs
    hasRunRef.current = targetId;
    
    let cancelled = false;
    
    const checkAndLoadAd = async () => {
      try {
        const isCampaign = !!campaignId;
        
        // Select an ad first (needed to check repeat settings)
        const selectedAd = isCampaign
          ? await selectAdForCampaign(firestore, targetId, user.uid)
          : await selectAdForEntry(firestore, targetId, user.uid);
        
        if (cancelled) return;
        
        if (!selectedAd) {
          // No ads available, allow entry or show error
          setIsLoading(false);
          if (required) {
            // If required but no ads, still allow (fallback)
            onCompleteRef.current();
          } else if (onCancelRef.current) {
            onCancelRef.current();
          }
          return;
        }

        // Check user's view limit for this ad
        if (selectedAd.maxViewsPerUser) {
          const userViews = await getUserAdViews(firestore, user.uid, selectedAd.id);
          const completedViews = userViews.filter(v => v.wasCompleted).length;
          
          if (cancelled) return;
          
          if (completedViews >= selectedAd.maxViewsPerUser) {
            // User reached limit, allow entry
            setHasViewed(true);
            setIsLoading(false);
            onCompleteRef.current();
            return;
          }
        }

        // Check repeat behavior settings
        const repeatInterval = selectedAd.repeatInterval || 'never';
        const minTimeBetweenViews = selectedAd.minTimeBetweenViews;
        const allowMultipleViews = selectedAd.allowMultipleViews || false;

        // Handle session-based repeat (check localStorage)
        if (repeatInterval === 'session') {
          const sessionKey = `ad-viewed-session-${targetId}-${user.uid}`;
          const hasViewedThisSession = localStorage.getItem(sessionKey);
          if (hasViewedThisSession) {
            // Already viewed this session, skip
            setHasViewed(true);
            setIsLoading(false);
            setTimeout(() => {
              if (!cancelled) {
                onCompleteRef.current();
              }
            }, 500);
            return;
          }
        }

        // Check if user already viewed an ad (respecting repeat settings)
        if (repeatInterval !== 'always' && !allowMultipleViews) {
          const alreadyViewed = isCampaign
            ? await hasUserViewedAdForCampaign(
                firestore, 
                user.uid, 
                targetId, 
                selectedAd.id,
                repeatInterval,
                minTimeBetweenViews
              )
            : await hasUserViewedAd(
                firestore, 
                user.uid, 
                targetId, 
                selectedAd.id,
                repeatInterval,
                minTimeBetweenViews
              );
          
          if (cancelled) return;
          
          if (alreadyViewed) {
            setHasViewed(true);
            setIsLoading(false);
            // User already viewed (based on repeat rules), allow entry
            setTimeout(() => {
              if (!cancelled) {
                onCompleteRef.current();
              }
            }, 500);
            return;
          }
        }

        if (!cancelled) {
          setAd(selectedAd);
          setIsLoading(false);
          
          // Mark session view if using session-based repeat
          if (selectedAd.repeatInterval === 'session') {
            const sessionKey = `ad-viewed-session-${targetId}-${user.uid}`;
            localStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (error) {
        console.error('Error loading ad:', error);
        // On error, allow entry (don't block user)
        if (!cancelled) {
          setIsLoading(false);
          if (!required && onCancelRef.current) {
            onCancelRef.current();
          } else {
            onCompleteRef.current();
          }
        }
      }
    };

    checkAndLoadAd();
    
    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [firestore, user?.uid, tournamentId, campaignId, required]);

  const handleAdComplete = async (advertisementId: string) => {
    if (!firestore || !user?.uid || !ad) {
      // If missing required data, still allow entry
      onCompleteRef.current();
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

      // Call completion callback with view ID and ad ID using ref
      onCompleteRef.current(viewIdStr, ad.id);
    } catch (error) {
      console.error('Error completing ad view:', error);
      // Still allow entry even if tracking fails
      onCompleteRef.current(undefined, ad.id);
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

