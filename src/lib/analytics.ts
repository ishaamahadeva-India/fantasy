/**
 * Centralized Analytics Module
 * 
 * Provides a unified interface for tracking user engagement, brand interactions,
 * and quiz performance across the QuizzBuzz platform.
 * 
 * Features:
 * - Firebase Analytics integration
 * - Firestore event logging
 * - Automatic session tracking
 * - User engagement scoring
 * - Non-blocking event logging
 */

'use client';

import { getAnalytics, logEvent, setUserId, setUserProperties, Analytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { AnalyticsEvent, EventParams, Platform, BrandEventType } from '@/constants/analyticsEvents';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  if (typeof window !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session management
let sessionId: string | null = null;
let sessionStartTime: number | null = null;
let analyticsInstance: Analytics | null = null;
let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

// App version (can be set from environment or package.json)
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/**
 * Initialize Firebase Analytics (client-side only)
 */
export function initializeAnalytics(firebaseApp: any, firestore: ReturnType<typeof getFirestore>): void {
  if (typeof window === 'undefined') return;
  
  try {
    analyticsInstance = getAnalytics(firebaseApp);
    firestoreInstance = firestore;
    
    // Generate session ID
    sessionId = getOrCreateSessionId();
    sessionStartTime = Date.now();
    
    // Track app open
    trackEvent(AnalyticsEvent.APP_OPEN, {
      [EventParams.SESSION_ID]: sessionId,
      [EventParams.PLATFORM]: getPlatform(),
      [EventParams.APP_VERSION]: APP_VERSION,
    });
    
    // Track session start
    trackEvent(AnalyticsEvent.SESSION_START, {
      [EventParams.SESSION_ID]: sessionId,
      [EventParams.PLATFORM]: getPlatform(),
    });
    
    // Log session start to Firestore
    logSessionStart(sessionId);
    
    // Track session end on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        trackSessionEnd();
      });
    }
  } catch (error) {
    // Analytics initialization failed - fail silently in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics initialization failed:', error);
    }
  }
}

/**
 * Get or create session ID from localStorage
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return generateUUID();
  
  const stored = localStorage.getItem('quizzbuzz_session_id');
  const storedTime = localStorage.getItem('quizzbuzz_session_start');
  
  // Check if session is still valid (24 hours)
  if (stored && storedTime) {
    const sessionAge = Date.now() - parseInt(storedTime, 10);
    if (sessionAge < 24 * 60 * 60 * 1000) {
      return stored;
    }
  }
  
  // Create new session
  const newSessionId = generateUUID();
  localStorage.setItem('quizzbuzz_session_id', newSessionId);
  localStorage.setItem('quizzbuzz_session_start', Date.now().toString());
  
  return newSessionId;
}

/**
 * Detect platform (web or mobile)
 */
function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  
  return isMobile ? 'mobile' : 'web';
}

/**
 * Track an analytics event
 * 
 * @param eventName - The event name (from AnalyticsEvent enum)
 * @param params - Event parameters
 * @param userId - Optional user ID (will be auto-attached if available)
 */
export async function trackEvent(
  eventName: string,
  params: Record<string, any> = {},
  userId?: string | null
): Promise<void> {
  // Don't block UI - use async logging
  Promise.resolve().then(async () => {
    try {
      // Get current user ID if not provided
      const currentUserId = userId || getCurrentUserId();
      
      // Prepare event data with automatic fields
      const eventData: Record<string, any> = {
        ...params,
        [EventParams.SESSION_ID]: sessionId || getOrCreateSessionId(),
        [EventParams.TIMESTAMP]: new Date().toISOString(),
        [EventParams.PLATFORM]: getPlatform(),
        [EventParams.APP_VERSION]: APP_VERSION,
      };
      
      if (currentUserId) {
        eventData[EventParams.USER_ID] = currentUserId;
      }
      
      // Log to Firebase Analytics
      if (analyticsInstance) {
        logEvent(analyticsInstance, eventName, eventData);
        
        // Set user ID if available
        if (currentUserId) {
          setUserId(analyticsInstance, currentUserId);
          setUserProperties(analyticsInstance, {
            platform: getPlatform(),
            app_version: APP_VERSION,
          });
        }
      }
      
      // Log to Firestore (for detailed analytics)
      await logToFirestore(eventName, eventData);
      
    } catch (error) {
      // Fail silently in production, log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics tracking failed:', error);
      }
    }
  });
}

/**
 * Get current user ID from localStorage or auth
 */
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get from localStorage (set by auth system)
  const storedUserId = localStorage.getItem('quizzbuzz_user_id');
  if (storedUserId) return storedUserId;
  
  return null;
}

/**
 * Set current user ID (called by auth system)
 */
export function setCurrentUserId(userId: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (userId) {
    localStorage.setItem('quizzbuzz_user_id', userId);
    
    // Update Firebase Analytics user ID
    if (analyticsInstance) {
      setUserId(analyticsInstance, userId);
    }
  } else {
    localStorage.removeItem('quizzbuzz_user_id');
  }
}

/**
 * Log event to Firestore
 */
async function logToFirestore(eventName: string, eventData: Record<string, any>): Promise<void> {
  if (!firestoreInstance) return;
  
  try {
    await addDoc(collection(firestoreInstance, 'analytics_events'), {
      eventName,
      ...eventData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firestore logging failed:', error);
    }
  }
}

/**
 * Log session start to Firestore
 */
async function logSessionStart(sessionId: string): Promise<void> {
  if (!firestoreInstance) return;
  
  try {
    const userId = getCurrentUserId();
    
    await addDoc(collection(firestoreInstance, 'sessions'), {
      userId: userId || null,
      sessionId,
      startedAt: serverTimestamp(),
      platform: getPlatform(),
      appVersion: APP_VERSION,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Session logging failed:', error);
    }
  }
}

/**
 * Track session end
 */
export async function trackSessionEnd(): Promise<void> {
  if (!sessionId || !sessionStartTime) return;
  
  try {
    const duration = Date.now() - sessionStartTime;
    const userId = getCurrentUserId();
    
    // Log to Firebase Analytics
    await trackEvent(AnalyticsEvent.SESSION_END, {
      [EventParams.SESSION_ID]: sessionId,
      duration,
    }, userId);
    
    // Update session in Firestore
    if (firestoreInstance) {
      const sessionsRef = collection(firestoreInstance, 'sessions');
      // Note: In production, you'd query for the session document and update it
      // For now, we'll create a new document with end time
      await addDoc(sessionsRef, {
        userId: userId || null,
        sessionId,
        endedAt: serverTimestamp(),
        duration,
        platform: getPlatform(),
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Session end tracking failed:', error);
    }
  }
}

/**
 * Get current session ID
 */
export function getSessionId(): string | null {
  return sessionId || getOrCreateSessionId();
}

