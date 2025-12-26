/**
 * React Hook for Analytics
 * 
 * Provides easy access to analytics functions in React components
 */

'use client';

import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase';
import { 
  createQuizAttempt, 
  completeQuizAttempt, 
  abandonQuizAttempt,
  trackBrandEvent,
  trackCouponRedemption,
  trackQuestionAnswered
} from '@/firebase/firestore/analytics';
import { trackEvent } from '@/lib/analytics';
import { AnalyticsEvent } from '@/constants/analyticsEvents';

/**
 * Hook for quiz analytics
 */
export function useQuizAnalytics() {
  const firestore = useFirestore();
  const { user } = useUser();

  const startQuiz = async (quizId: string, quizType?: string, brand?: string, campaignId?: string) => {
    if (!firestore) return null;
    
    return createQuizAttempt(firestore, {
      userId: user?.uid || null,
      quizId,
      quizType,
      brand: brand || null,
      campaignId: campaignId || null,
      platform: typeof window !== 'undefined' && /mobile/i.test(navigator.userAgent) ? 'mobile' : 'web',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    });
  };

  const completeQuiz = async (
    attemptId: string,
    score: number,
    questionsAnswered: number,
    timeSpent: number
  ) => {
    if (!firestore) return;
    
    await completeQuizAttempt(firestore, attemptId, {
      score,
      questionsAnswered,
      timeSpent,
    });
  };

  const abandonQuiz = async (
    attemptId: string,
    questionsAnswered?: number,
    timeSpent?: number
  ) => {
    if (!firestore) return;
    
    await abandonQuizAttempt(firestore, attemptId, {
      questionsAnswered,
      timeSpent,
    });
  };

  const answerQuestion = async (
    attemptId: string,
    questionIndex: number,
    isCorrect: boolean
  ) => {
    if (!firestore) return;
    
    await trackQuestionAnswered(firestore, attemptId, questionIndex, isCorrect);
  };

  return {
    startQuiz,
    completeQuiz,
    abandonQuiz,
    answerQuestion,
  };
}

/**
 * Hook for brand analytics
 */
export function useBrandAnalytics() {
  const firestore = useFirestore();
  const { user } = useUser();

  const trackImpression = async (brand: string, quizId?: string, campaignId?: string) => {
    if (!firestore) return;
    
    await trackBrandEvent(firestore, {
      userId: user?.uid || null,
      brand,
      quizId: quizId || null,
      campaignId: campaignId || null,
      eventType: 'impression',
    });
  };

  const trackClick = async (brand: string, quizId?: string, campaignId?: string) => {
    if (!firestore) return;
    
    await trackBrandEvent(firestore, {
      userId: user?.uid || null,
      brand,
      quizId: quizId || null,
      campaignId: campaignId || null,
      eventType: 'click',
    });
  };

  const trackBrandQuizStart = async (brand: string, quizId: string, campaignId?: string) => {
    if (!firestore) return;
    
    await trackBrandEvent(firestore, {
      userId: user?.uid || null,
      brand,
      quizId,
      campaignId: campaignId || null,
      eventType: 'start',
    });
  };

  return {
    trackImpression,
    trackClick,
    trackBrandQuizStart,
  };
}

/**
 * Hook for coupon analytics
 */
export function useCouponAnalytics() {
  const firestore = useFirestore();
  const { user } = useUser();

  const redeemCoupon = async (
    brand: string,
    couponCode: string,
    campaignId?: string,
    quizId?: string,
    orderValue?: number
  ) => {
    if (!firestore || !user) return;
    
    await trackCouponRedemption(firestore, {
      userId: user.uid,
      brand,
      couponCode,
      campaignId: campaignId || null,
      quizId: quizId || null,
      orderValue,
    });
  };

  return {
    redeemCoupon,
  };
}

/**
 * Hook for general analytics events
 */
export function useAnalytics() {
  const { user } = useUser();

  const track = async (eventName: string, params: Record<string, any> = {}) => {
    await trackEvent(eventName, params, user?.uid || null);
  };

  return {
    track,
  };
}

