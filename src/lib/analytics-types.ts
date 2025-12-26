/**
 * Analytics Data Types
 * 
 * Type definitions for analytics data stored in Firestore
 */

import { Timestamp, FieldValue } from 'firebase/firestore';
import { BrandEventType } from '@/constants/analyticsEvents';

/**
 * Quiz Attempt Document
 * Created when a quiz starts, updated when completed or abandoned
 */
export type QuizAttempt = {
  id?: string;
  userId: string | null;
  quizId: string;
  quizType?: string;
  brand: string | null;
  campaignId?: string | null;
  
  // Timing
  startedAt: Date | Timestamp | FieldValue;
  completedAt?: Date | Timestamp | FieldValue;
  abandonedAt?: Date | Timestamp | FieldValue;
  
  // Status
  completed: boolean;
  abandoned: boolean;
  
  // Performance
  score: number;
  totalQuestions: number;
  questionsAnswered: number;
  timeSpent: number; // in seconds
  
  // Metadata
  sessionId: string;
  platform: 'web' | 'mobile';
  appVersion: string;
  
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
};

/**
 * Brand Event Document
 * Tracks all brand-related interactions
 */
export type BrandEvent = {
  id?: string;
  userId: string | null;
  brand: string;
  quizId?: string | null;
  campaignId?: string | null;
  eventType: BrandEventType; // 'impression' | 'click' | 'start' | 'complete'
  
  // Metadata
  sessionId: string;
  timestamp: Date | Timestamp;
  platform: 'web' | 'mobile';
  appVersion: string;
  
  // Additional context
  metadata?: Record<string, any>;
};

/**
 * Coupon Redemption Document
 * Tracks coupon redemptions (high-value events)
 */
export type CouponRedemption = {
  id?: string;
  userId: string;
  brand: string;
  campaignId?: string | null;
  quizId?: string | null;
  
  // Coupon details
  couponCode: string;
  orderValue?: number;
  
  // Redemption details
  redeemedAt: Date | Timestamp | FieldValue;
  
  // Metadata
  sessionId: string;
  platform: 'web' | 'mobile';
  appVersion: string;
  
  // Additional context
  metadata?: Record<string, any>;
  
  timestamp: Date | Timestamp | FieldValue;
};

/**
 * Session Document
 * Tracks user sessions
 */
export type Session = {
  id?: string;
  userId: string | null;
  sessionId: string;
  
  // Timing
  startedAt: Date | Timestamp | FieldValue;
  endedAt?: Date | Timestamp | FieldValue;
  duration?: number; // in milliseconds
  
  // Metadata
  platform: 'web' | 'mobile';
  appVersion: string;
  
  // Engagement metrics
  eventsCount?: number;
  quizzesStarted?: number;
  quizzesCompleted?: number;
};

/**
 * User Engagement Document
 * Stores user engagement flags and scores
 */
export type UserEngagement = {
  id?: string;
  userId: string;
  
  // Engagement flags
  isEngaged: boolean;
  engagementScore: number;
  
  // Metrics
  totalQuizzesCompleted: number;
  totalTimeSpent: number; // in seconds
  totalBrandInteractions: number;
  totalCouponsRedeemed: number;
  
  // Per-campaign engagement scores
  campaignScores?: Record<string, number>; // campaignId -> score
  
  // Timestamps
  firstEngagedAt?: Date | Timestamp | FieldValue;
  lastEngagedAt?: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
};

/**
 * Analytics Event Document (raw events)
 * Stores all analytics events for detailed analysis
 */
export type AnalyticsEventDoc = {
  id?: string;
  eventName: string;
  userId?: string | null;
  sessionId: string;
  timestamp: Date | Timestamp;
  platform: 'web' | 'mobile';
  appVersion: string;
  
  // Event-specific data
  eventData: Record<string, any>;
  
  createdAt: Date | Timestamp | FieldValue;
};

