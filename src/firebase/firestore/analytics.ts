/**
 * Analytics Firestore Service
 * 
 * Provides functions to write analytics data to Firestore
 * All functions are non-blocking and handle errors gracefully
 */

'use client';

import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import type { 
  QuizAttempt, 
  BrandEvent, 
  CouponRedemption, 
  Session,
  UserEngagement 
} from '@/lib/analytics-types';
import { trackEvent, getSessionId } from '@/lib/analytics';
import { AnalyticsEvent, EventParams } from '@/constants/analyticsEvents';

/**
 * Create or update a quiz attempt
 */
export async function createQuizAttempt(
  firestore: Firestore,
  data: {
    userId: string | null;
    quizId: string;
    quizType?: string;
    brand?: string | null;
    campaignId?: string | null;
    platform: 'web' | 'mobile';
    appVersion: string;
  }
): Promise<string> {
  try {
    const sessionId = getSessionId() || 'unknown';
    
    const quizAttempt = {
      ...data,
      brand: data.brand || null,
      campaignId: data.campaignId || null,
      startedAt: serverTimestamp(),
      completed: false,
      abandoned: false,
      score: 0,
      totalQuestions: 0, // Will be updated when quiz completes
      questionsAnswered: 0,
      timeSpent: 0,
      sessionId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as Omit<QuizAttempt, 'id'>;
    
    const docRef = await addDoc(collection(firestore, 'quiz_attempts'), quizAttempt);
    
    // Track quiz start event
    await trackEvent(AnalyticsEvent.QUIZ_START, {
      [EventParams.QUIZ_ID]: data.quizId,
      quizAttemptId: docRef.id,
      brand: data.brand || null,
      campaignId: data.campaignId || null,
    }, data.userId || undefined);
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to create quiz attempt:', error);
    throw error;
  }
}

/**
 * Update quiz attempt when completed
 */
export async function completeQuizAttempt(
  firestore: Firestore,
  attemptId: string,
  data: {
    score: number;
    questionsAnswered: number;
    timeSpent: number;
  }
): Promise<void> {
  try {
    const attemptRef = doc(firestore, 'quiz_attempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);
    
    if (!attemptSnap.exists()) {
      throw new Error('Quiz attempt not found');
    }
    
    const attemptData = attemptSnap.data() as QuizAttempt;
    
    await updateDoc(attemptRef, {
      completed: true,
      completedAt: serverTimestamp(),
      score: data.score,
      questionsAnswered: data.questionsAnswered,
      timeSpent: data.timeSpent,
      updatedAt: serverTimestamp(),
    });
    
    // Track quiz completed event
    await trackEvent(AnalyticsEvent.QUIZ_COMPLETED, {
      [EventParams.QUIZ_ID]: attemptData.quizId,
      [EventParams.SCORE]: data.score,
      [EventParams.TIME_SPENT]: data.timeSpent,
      quizAttemptId: attemptId,
      brand: attemptData.brand || null,
      campaignId: attemptData.campaignId || null,
    }, attemptData.userId || undefined);
    
    // Update user engagement
    if (attemptData.userId) {
      await updateUserEngagement(firestore, attemptData.userId, {
        quizCompleted: true,
        timeSpent: data.timeSpent,
      });
    }
  } catch (error) {
    console.error('Failed to complete quiz attempt:', error);
    throw error;
  }
}

/**
 * Mark quiz attempt as abandoned
 */
export async function abandonQuizAttempt(
  firestore: Firestore,
  attemptId: string,
  data?: {
    questionsAnswered?: number;
    timeSpent?: number;
  }
): Promise<void> {
  try {
    const attemptRef = doc(firestore, 'quiz_attempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);
    
    if (!attemptSnap.exists()) {
      throw new Error('Quiz attempt not found');
    }
    
    const attemptData = attemptSnap.data() as QuizAttempt;
    
    await updateDoc(attemptRef, {
      abandoned: true,
      abandonedAt: serverTimestamp(),
      questionsAnswered: data?.questionsAnswered || attemptData.questionsAnswered || 0,
      timeSpent: data?.timeSpent || attemptData.timeSpent || 0,
      updatedAt: serverTimestamp(),
    });
    
    // Track quiz abandoned event
    await trackEvent(AnalyticsEvent.QUIZ_ABANDONED, {
      [EventParams.QUIZ_ID]: attemptData.quizId,
      quizAttemptId: attemptId,
      questionsAnswered: data?.questionsAnswered || 0,
      timeSpent: data?.timeSpent || 0,
      brand: attemptData.brand || null,
      campaignId: attemptData.campaignId || null,
    }, attemptData.userId || undefined);
  } catch (error) {
    console.error('Failed to abandon quiz attempt:', error);
    throw error;
  }
}

/**
 * Track a brand event
 */
export async function trackBrandEvent(
  firestore: Firestore,
  data: {
    userId: string | null;
    brand: string;
    quizId?: string | null;
    campaignId?: string | null;
    eventType: 'impression' | 'click' | 'start' | 'complete';
  }
): Promise<string> {
  try {
    const sessionId = getSessionId() || 'unknown';
    const platform = typeof window !== 'undefined' && /mobile/i.test(navigator.userAgent) ? 'mobile' : 'web';
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    
    const brandEvent = {
      ...data,
      sessionId,
      platform,
      appVersion,
      timestamp: serverTimestamp(),
    } as Omit<BrandEvent, 'id'>;
    
    const docRef = await addDoc(collection(firestore, 'brand_events'), brandEvent);
    
    // Track brand event in Firebase Analytics
    const eventName = data.eventType === 'impression' 
      ? AnalyticsEvent.BRAND_IMPRESSION
      : data.eventType === 'click'
      ? AnalyticsEvent.BRAND_CTA_CLICK
      : data.eventType === 'start'
      ? AnalyticsEvent.BRAND_QUIZ_START
      : AnalyticsEvent.EVENT_PARTICIPATION;
    
    await trackEvent(eventName, {
      [EventParams.BRAND]: data.brand,
      [EventParams.CAMPAIGN_ID]: data.campaignId || null,
      [EventParams.QUIZ_ID]: data.quizId || null,
      [EventParams.EVENT_TYPE]: data.eventType,
      brandEventId: docRef.id,
    }, data.userId || undefined);
    
    // Update user engagement if user interacted with brand
    if (data.userId && (data.eventType === 'click' || data.eventType === 'start')) {
      await updateUserEngagement(firestore, data.userId, {
        brandInteraction: true,
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to track brand event:', error);
    throw error;
  }
}

/**
 * Track coupon redemption
 */
export async function trackCouponRedemption(
  firestore: Firestore,
  data: {
    userId: string;
    brand: string;
    couponCode: string;
    campaignId?: string | null;
    quizId?: string | null;
    orderValue?: number;
  }
): Promise<string> {
  try {
    const sessionId = getSessionId() || 'unknown';
    const platform = typeof window !== 'undefined' && /mobile/i.test(navigator.userAgent) ? 'mobile' : 'web';
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    
    const redemption = {
      ...data,
      sessionId,
      platform,
      appVersion,
      redeemedAt: serverTimestamp(),
    } as Omit<CouponRedemption, 'id'>;
    
    const docRef = await addDoc(collection(firestore, 'coupon_redemptions'), redemption);
    
    // Track coupon redeemed event
    await trackEvent(AnalyticsEvent.COUPON_REDEEMED, {
      [EventParams.BRAND]: data.brand,
      [EventParams.CAMPAIGN_ID]: data.campaignId || null,
      [EventParams.QUIZ_ID]: data.quizId || null,
      [EventParams.COUPON_CODE]: data.couponCode,
      [EventParams.ORDER_VALUE]: data.orderValue || 0,
      redemptionId: docRef.id,
    }, data.userId);
    
    // Update user engagement (high-value event)
    await updateUserEngagement(firestore, data.userId, {
      couponRedeemed: true,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to track coupon redemption:', error);
    throw error;
  }
}

/**
 * Update user engagement flags and scores
 */
async function updateUserEngagement(
  firestore: Firestore,
  userId: string,
  updates: {
    quizCompleted?: boolean;
    timeSpent?: number;
    brandInteraction?: boolean;
    couponRedeemed?: boolean;
  }
): Promise<void> {
  try {
    const userEngagementRef = doc(firestore, 'users', userId);
    const userEngagementSnap = await getDoc(userEngagementRef);
    
    let engagementData: Partial<UserEngagement>;
    
    if (userEngagementSnap.exists()) {
      const existing = userEngagementSnap.data() as UserEngagement;
      engagementData = { ...existing };
    } else {
      engagementData = {
        userId,
        isEngaged: false,
        engagementScore: 0,
        totalQuizzesCompleted: 0,
        totalTimeSpent: 0,
        totalBrandInteractions: 0,
        totalCouponsRedeemed: 0,
        updatedAt: serverTimestamp(),
      };
    }
    
    // Update metrics
    if (updates.quizCompleted) {
      engagementData.totalQuizzesCompleted = (engagementData.totalQuizzesCompleted || 0) + 1;
      engagementData.engagementScore = (engagementData.engagementScore || 0) + 2; // Quiz complete = 2 points
    }
    
    if (updates.timeSpent) {
      engagementData.totalTimeSpent = (engagementData.totalTimeSpent || 0) + updates.timeSpent;
      
      // Mark as engaged if total time >= 300 seconds
      if ((engagementData.totalTimeSpent || 0) >= 300) {
        engagementData.isEngaged = true;
        if (!engagementData.firstEngagedAt) {
          engagementData.firstEngagedAt = serverTimestamp();
        }
      }
    }
    
    if (updates.brandInteraction) {
      engagementData.totalBrandInteractions = (engagementData.totalBrandInteractions || 0) + 1;
      engagementData.engagementScore = (engagementData.engagementScore || 0) + 3; // Brand click = 3 points
    }
    
    if (updates.couponRedeemed) {
      engagementData.totalCouponsRedeemed = (engagementData.totalCouponsRedeemed || 0) + 1;
      engagementData.engagementScore = (engagementData.engagementScore || 0) + 5; // Coupon redeem = 5 points
    }
    
    // Mark as engaged if completed at least one quiz
    if ((engagementData.totalQuizzesCompleted || 0) > 0) {
      engagementData.isEngaged = true;
      if (!engagementData.firstEngagedAt) {
        engagementData.firstEngagedAt = serverTimestamp();
      }
    }
    
    // Mark as engaged if any brand interaction
    if ((engagementData.totalBrandInteractions || 0) > 0) {
      engagementData.isEngaged = true;
      if (!engagementData.firstEngagedAt) {
        engagementData.firstEngagedAt = serverTimestamp();
      }
    }
    
    engagementData.lastEngagedAt = serverTimestamp();
    engagementData.updatedAt = serverTimestamp();
    
    await setDoc(userEngagementRef, engagementData, { merge: true });
  } catch (error) {
    console.error('Failed to update user engagement:', error);
    // Don't throw - engagement updates are non-critical
  }
}

/**
 * Track question answered (for quiz progress)
 */
export async function trackQuestionAnswered(
  firestore: Firestore,
  attemptId: string,
  questionIndex: number,
  isCorrect: boolean
): Promise<void> {
  try {
    const attemptRef = doc(firestore, 'quiz_attempts', attemptId);
    const attemptSnap = await getDoc(attemptRef);
    
    if (!attemptSnap.exists()) {
      return;
    }
    
    const attemptData = attemptSnap.data() as QuizAttempt;
    
    await updateDoc(attemptRef, {
      questionsAnswered: (attemptData.questionsAnswered || 0) + 1,
      updatedAt: serverTimestamp(),
    });
    
    // Track question answered event
    await trackEvent(AnalyticsEvent.QUESTION_ANSWERED, {
      [EventParams.QUIZ_ID]: attemptData.quizId,
      [EventParams.QUESTION_INDEX]: questionIndex,
      isCorrect,
      quizAttemptId: attemptId,
    }, attemptData.userId || undefined);
  } catch (error) {
    console.error('Failed to track question answered:', error);
    // Don't throw - non-critical
  }
}

