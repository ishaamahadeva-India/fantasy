/**
 * Standard Analytics Event Names
 * 
 * These events are used consistently across the application for tracking
 * user engagement, brand interactions, and quiz performance.
 * 
 * All events are automatically logged to Firebase Analytics and Firestore.
 */

export enum AnalyticsEvent {
  // App & Session Events
  APP_OPEN = 'app_open',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',

  // Quiz Engagement Events
  QUIZ_START = 'quiz_start',
  QUESTION_ANSWERED = 'question_answered',
  QUIZ_COMPLETED = 'quiz_completed',
  QUIZ_ABANDONED = 'quiz_abandoned',

  // Brand & Ads Events
  BRAND_IMPRESSION = 'brand_impression',
  BRAND_QUIZ_START = 'brand_quiz_start',
  BRAND_CTA_CLICK = 'brand_cta_click',
  COUPON_REDEEMED = 'coupon_redeemed',
  EVENT_PARTICIPATION = 'event_participation',
}

/**
 * Event parameter keys (standardized)
 */
export const EventParams = {
  // Common
  USER_ID: 'userId',
  SESSION_ID: 'sessionId',
  TIMESTAMP: 'timestamp',
  PLATFORM: 'platform',
  APP_VERSION: 'appVersion',
  
  // Quiz
  QUIZ_ID: 'quizId',
  QUIZ_TYPE: 'quizType',
  QUESTION_INDEX: 'questionIndex',
  TOTAL_QUESTIONS: 'totalQuestions',
  SCORE: 'score',
  TIME_SPENT: 'timeSpent',
  COMPLETED: 'completed',
  
  // Brand
  BRAND: 'brand',
  CAMPAIGN_ID: 'campaignId',
  EVENT_TYPE: 'eventType',
  
  // Coupon
  COUPON_CODE: 'couponCode',
  ORDER_VALUE: 'orderValue',
  
  // Engagement
  ENGAGEMENT_SCORE: 'engagementScore',
} as const;

/**
 * Platform types
 */
export type Platform = 'web' | 'mobile';

/**
 * Brand event types
 */
export type BrandEventType = 'impression' | 'click' | 'start' | 'complete';

