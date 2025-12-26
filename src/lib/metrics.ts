/**
 * Metrics Calculation Helpers
 * 
 * Provides functions to calculate key analytics metrics:
 * - DAU (Daily Active Users)
 * - MAU (Monthly Active Users)
 * - Quiz completion rate
 * - Average session time
 * - Brand engagement rate
 * - Coupon redemption rate
 * - Cost per engaged user
 * 
 * All functions query Firestore efficiently and return calculated metrics.
 */

'use client';

import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  Timestamp,
  startAt,
  endAt,
  orderBy,
  limit
} from 'firebase/firestore';
import type { QuizAttempt, BrandEvent, CouponRedemption, Session, UserEngagement } from '@/lib/analytics-types';

/**
 * Calculate Daily Active Users (DAU)
 * Users who had at least one session or event on the given date
 */
export async function calculateDAU(
  firestore: Firestore,
  date: Date = new Date()
): Promise<number> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Query sessions for the day
    const sessionsRef = collection(firestore, 'sessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startedAt', '>=', Timestamp.fromDate(startOfDay)),
      where('startedAt', '<=', Timestamp.fromDate(endOfDay))
    );
    const sessionsSnap = await getDocs(sessionsQuery);
    
    // Get unique user IDs
    const userIds = new Set<string>();
    sessionsSnap.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        userIds.add(data.userId);
      }
    });
    
    // Also check analytics events for anonymous users
    const eventsRef = collection(firestore, 'analytics_events');
    const eventsQuery = query(
      eventsRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay))
    );
    const eventsSnap = await getDocs(eventsQuery);
    
    eventsSnap.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        userIds.add(data.userId);
      }
    });
    
    return userIds.size;
  } catch (error) {
    console.error('Failed to calculate DAU:', error);
    return 0;
  }
}

/**
 * Calculate Monthly Active Users (MAU)
 * Users who had at least one session or event in the given month
 */
export async function calculateMAU(
  firestore: Firestore,
  date: Date = new Date()
): Promise<number> {
  try {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    // Query sessions for the month
    const sessionsRef = collection(firestore, 'sessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startedAt', '>=', Timestamp.fromDate(startOfMonth)),
      where('startedAt', '<=', Timestamp.fromDate(endOfMonth))
    );
    const sessionsSnap = await getDocs(sessionsQuery);
    
    // Get unique user IDs
    const userIds = new Set<string>();
    sessionsSnap.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        userIds.add(data.userId);
      }
    });
    
    // Also check analytics events
    const eventsRef = collection(firestore, 'analytics_events');
    const eventsQuery = query(
      eventsRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfMonth)),
      where('timestamp', '<=', Timestamp.fromDate(endOfMonth))
    );
    const eventsSnap = await getDocs(eventsQuery);
    
    eventsSnap.forEach(doc => {
      const data = doc.data();
      if (data.userId) {
        userIds.add(data.userId);
      }
    });
    
    return userIds.size;
  } catch (error) {
    console.error('Failed to calculate MAU:', error);
    return 0;
  }
}

/**
 * Calculate quiz completion rate
 * Percentage of quiz attempts that were completed
 */
export async function calculateQuizCompletionRate(
  firestore: Firestore,
  quizId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<number> {
  try {
    let attemptsQuery = query(collection(firestore, 'quiz_attempts'));
    
    if (quizId) {
      attemptsQuery = query(
        collection(firestore, 'quiz_attempts'),
        where('quizId', '==', quizId)
      );
    }
    
    if (dateRange) {
      attemptsQuery = query(
        attemptsQuery,
        where('startedAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('startedAt', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const attemptsSnap = await getDocs(attemptsQuery);
    
    let totalAttempts = 0;
    let completedAttempts = 0;
    
    attemptsSnap.forEach(doc => {
      const data = doc.data() as QuizAttempt;
      totalAttempts++;
      if (data.completed) {
        completedAttempts++;
      }
    });
    
    if (totalAttempts === 0) return 0;
    
    return (completedAttempts / totalAttempts) * 100;
  } catch (error) {
    console.error('Failed to calculate quiz completion rate:', error);
    return 0;
  }
}

/**
 * Calculate average session time
 * Average duration of all sessions in milliseconds
 */
export async function calculateAverageSessionTime(
  firestore: Firestore,
  dateRange?: { start: Date; end: Date }
): Promise<number> {
  try {
    let sessionsQuery = query(
      collection(firestore, 'sessions'),
      where('duration', '!=', null)
    );
    
    if (dateRange) {
      sessionsQuery = query(
        sessionsQuery,
        where('startedAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('startedAt', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const sessionsSnap = await getDocs(sessionsQuery);
    
    let totalDuration = 0;
    let sessionCount = 0;
    
    sessionsSnap.forEach(doc => {
      const data = doc.data() as Session;
      if (data.duration) {
        totalDuration += data.duration;
        sessionCount++;
      }
    });
    
    if (sessionCount === 0) return 0;
    
    return totalDuration / sessionCount;
  } catch (error) {
    console.error('Failed to calculate average session time:', error);
    return 0;
  }
}

/**
 * Calculate brand engagement rate
 * Percentage of users who interacted with brand content
 */
export async function calculateBrandEngagementRate(
  firestore: Firestore,
  brand: string,
  dateRange?: { start: Date; end: Date }
): Promise<number> {
  try {
    let brandEventsQuery = query(
      collection(firestore, 'brand_events'),
      where('brand', '==', brand)
    );
    
    if (dateRange) {
      brandEventsQuery = query(
        brandEventsQuery,
        where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
        where('timestamp', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const eventsSnap = await getDocs(brandEventsQuery);
    
    // Get unique users who interacted
    const engagedUserIds = new Set<string>();
    eventsSnap.forEach(doc => {
      const data = doc.data() as BrandEvent;
      if (data.userId && (data.eventType === 'click' || data.eventType === 'start')) {
        engagedUserIds.add(data.userId);
      }
    });
    
    // Get total users who saw brand content (impressions)
    let impressionsQuery = query(
      collection(firestore, 'brand_events'),
      where('brand', '==', brand),
      where('eventType', '==', 'impression')
    );
    
    if (dateRange) {
      impressionsQuery = query(
        impressionsQuery,
        where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
        where('timestamp', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const impressionsSnap = await getDocs(impressionsQuery);
    const totalUserIds = new Set<string>();
    impressionsSnap.forEach(doc => {
      const data = doc.data() as BrandEvent;
      if (data.userId) {
        totalUserIds.add(data.userId);
      }
    });
    
    if (totalUserIds.size === 0) return 0;
    
    return (engagedUserIds.size / totalUserIds.size) * 100;
  } catch (error) {
    console.error('Failed to calculate brand engagement rate:', error);
    return 0;
  }
}

/**
 * Calculate coupon redemption rate
 * Percentage of users who redeemed coupons
 */
export async function calculateCouponRedemptionRate(
  firestore: Firestore,
  brand?: string,
  campaignId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<number> {
  try {
    let redemptionsQuery = query(collection(firestore, 'coupon_redemptions'));
    
    if (brand) {
      redemptionsQuery = query(redemptionsQuery, where('brand', '==', brand));
    }
    
    if (campaignId) {
      redemptionsQuery = query(redemptionsQuery, where('campaignId', '==', campaignId));
    }
    
    if (dateRange) {
      redemptionsQuery = query(
        redemptionsQuery,
        where('redeemedAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('redeemedAt', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const redemptionsSnap = await getDocs(redemptionsQuery);
    
    // Get unique users who redeemed
    const redeemedUserIds = new Set<string>();
    redemptionsSnap.forEach(doc => {
      const data = doc.data() as CouponRedemption;
      redeemedUserIds.add(data.userId);
    });
    
    // Get total users who participated in brand campaigns
    let brandEventsQuery = query(
      collection(firestore, 'brand_events'),
      where('brand', '==', brand || '')
    );
    
    if (campaignId) {
      brandEventsQuery = query(brandEventsQuery, where('campaignId', '==', campaignId));
    }
    
    if (dateRange) {
      brandEventsQuery = query(
        brandEventsQuery,
        where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
        where('timestamp', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const brandEventsSnap = await getDocs(brandEventsQuery);
    const totalUserIds = new Set<string>();
    brandEventsSnap.forEach(doc => {
      const data = doc.data() as BrandEvent;
      if (data.userId) {
        totalUserIds.add(data.userId);
      }
    });
    
    if (totalUserIds.size === 0) return 0;
    
    return (redeemedUserIds.size / totalUserIds.size) * 100;
  } catch (error) {
    console.error('Failed to calculate coupon redemption rate:', error);
    return 0;
  }
}

/**
 * Calculate cost per engaged user
 * Total spend divided by number of engaged users
 */
export async function calculateCostPerEngagedUser(
  firestore: Firestore,
  totalSpend: number,
  brand?: string,
  campaignId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<number> {
  try {
    // Get engaged users (users with isEngaged = true)
    let usersQuery = query(
      collection(firestore, 'users'),
      where('isEngaged', '==', true)
    );
    
    const usersSnap = await getDocs(usersQuery);
    
    // Filter by brand/campaign if specified
    let engagedUserIds = new Set<string>();
    
    if (brand || campaignId) {
      // Get users who engaged with specific brand/campaign
      let brandEventsQuery = query(collection(firestore, 'brand_events'));
      
      if (brand) {
        brandEventsQuery = query(brandEventsQuery, where('brand', '==', brand));
      }
      
      if (campaignId) {
        brandEventsQuery = query(brandEventsQuery, where('campaignId', '==', campaignId));
      }
      
      if (dateRange) {
        brandEventsQuery = query(
          brandEventsQuery,
          where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
          where('timestamp', '<=', Timestamp.fromDate(dateRange.end))
        );
      }
      
      const brandEventsSnap = await getDocs(brandEventsQuery);
      brandEventsSnap.forEach(doc => {
        const data = doc.data() as BrandEvent;
        if (data.userId) {
          engagedUserIds.add(data.userId);
        }
      });
    } else {
      // Use all engaged users
      usersSnap.forEach(doc => {
        const data = doc.data() as UserEngagement;
        engagedUserIds.add(data.userId);
      });
    }
    
    if (engagedUserIds.size === 0) return 0;
    
    return totalSpend / engagedUserIds.size;
  } catch (error) {
    console.error('Failed to calculate cost per engaged user:', error);
    return 0;
  }
}

/**
 * Get engagement score for a user
 */
export async function getUserEngagementScore(
  firestore: Firestore,
  userId: string
): Promise<number> {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) return 0;
    
    const userData = userDocSnap.data() as UserEngagement;
    return userData.engagementScore || 0;
  } catch (error) {
    console.error('Failed to get user engagement score:', error);
    return 0;
  }
}

/**
 * Get engagement score for a campaign
 */
export async function getCampaignEngagementScore(
  firestore: Firestore,
  campaignId: string
): Promise<number> {
  try {
    // Get all users who participated in this campaign
    const brandEventsQuery = query(
      collection(firestore, 'brand_events'),
      where('campaignId', '==', campaignId)
    );
    
    const eventsSnap = await getDocs(brandEventsQuery);
    const userIds = new Set<string>();
    
    eventsSnap.forEach(doc => {
      const data = doc.data() as BrandEvent;
      if (data.userId) {
        userIds.add(data.userId);
      }
    });
    
    // Calculate total engagement score
    let totalScore = 0;
    for (const userId of userIds) {
      const score = await getUserEngagementScore(firestore, userId);
      totalScore += score;
    }
    
    return totalScore;
  } catch (error) {
    console.error('Failed to get campaign engagement score:', error);
    return 0;
  }
}

