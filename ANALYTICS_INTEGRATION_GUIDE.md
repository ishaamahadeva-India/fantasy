# QuizzBuzz Analytics System Integration Guide

## Overview

The QuizzBuzz analytics system provides comprehensive tracking of user engagement, brand interactions, and quiz performance. All analytics are automatically logged to Firebase Analytics and Firestore for detailed analysis.

## Quick Start

### 1. Analytics is Auto-Initialized

Analytics is automatically initialized when the Firebase provider loads. No manual setup required.

### 2. Using Analytics Hooks

#### Quiz Analytics

```typescript
import { useQuizAnalytics } from '@/hooks/use-analytics';

function QuizComponent() {
  const { startQuiz, completeQuiz, abandonQuiz, answerQuestion } = useQuizAnalytics();
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const handleStart = async () => {
    const id = await startQuiz('quiz-id', 'daily-news', 'dominos', 'campaign-123');
    setAttemptId(id);
  };

  const handleComplete = async (score: number, timeSpent: number) => {
    if (attemptId) {
      await completeQuiz(attemptId, score, 10, timeSpent);
    }
  };

  const handleAnswer = async (questionIndex: number, isCorrect: boolean) => {
    if (attemptId) {
      await answerQuestion(attemptId, questionIndex, isCorrect);
    }
  };

  return (
    // Your quiz UI
  );
}
```

#### Brand Analytics

```typescript
import { useBrandAnalytics } from '@/hooks/use-analytics';

function BrandAdComponent({ brand, quizId, campaignId }: Props) {
  const { trackImpression, trackClick, trackBrandQuizStart } = useBrandAnalytics();

  useEffect(() => {
    // Track impression when ad is shown
    trackImpression(brand, quizId, campaignId);
  }, []);

  const handleClick = () => {
    trackClick(brand, quizId, campaignId);
    // Navigate to quiz
  };

  const handleQuizStart = () => {
    trackBrandQuizStart(brand, quizId, campaignId);
  };

  return (
    // Your ad UI
  );
}
```

#### Coupon Analytics

```typescript
import { useCouponAnalytics } from '@/hooks/use-analytics';

function CouponRedemptionComponent() {
  const { redeemCoupon } = useCouponAnalytics();

  const handleRedeem = async (couponCode: string, orderValue: number) => {
    await redeemCoupon('dominos', couponCode, 'campaign-123', 'quiz-id', orderValue);
    // Show success message
  };

  return (
    // Your coupon UI
  );
}
```

### 3. Manual Event Tracking

```typescript
import { useAnalytics } from '@/hooks/use-analytics';
import { AnalyticsEvent } from '@/constants/analyticsEvents';

function CustomComponent() {
  const { track } = useAnalytics();

  const handleCustomEvent = async () => {
    await track(AnalyticsEvent.EVENT_PARTICIPATION, {
      eventId: 'custom-event-123',
      category: 'special',
    });
  };

  return (
    // Your component
  );
}
```

## Firestore Collections

The analytics system creates the following Firestore collections:

### `quiz_attempts`
Tracks quiz starts, completions, and abandonments.

### `brand_events`
Tracks brand impressions, clicks, and quiz starts.

### `coupon_redemptions`
Tracks coupon redemptions (high-value events).

### `sessions`
Tracks user sessions with start/end times and duration.

### `users`
Stores user engagement flags and scores (merged with existing user profile).

### `analytics_events`
Raw analytics events for detailed analysis.

## Metrics Calculation

```typescript
import {
  calculateDAU,
  calculateMAU,
  calculateQuizCompletionRate,
  calculateAverageSessionTime,
  calculateBrandEngagementRate,
  calculateCouponRedemptionRate,
  calculateCostPerEngagedUser,
} from '@/lib/metrics';

// Get daily active users
const dau = await calculateDAU(firestore, new Date());

// Get quiz completion rate for a specific quiz
const completionRate = await calculateQuizCompletionRate(
  firestore,
  'quiz-id',
  { start: new Date('2024-01-01'), end: new Date('2024-01-31') }
);

// Get brand engagement rate
const engagementRate = await calculateBrandEngagementRate(
  firestore,
  'dominos',
  { start: new Date('2024-01-01'), end: new Date('2024-01-31') }
);

// Calculate cost per engaged user
const costPerUser = await calculateCostPerEngagedUser(
  firestore,
  100000, // Total spend
  'dominos',
  'campaign-123'
);
```

## Engagement Scoring

Users are automatically marked as "engaged" if they:
- Complete ≥ 1 quiz
- OR spend ≥ 300 seconds total
- OR interact with any brand content

Engagement scores are calculated as:
- Quiz start: 1 point
- Quiz complete: 2 points
- Brand click: 3 points
- Coupon redeem: 5 points

## Event Names

All standard events are defined in `AnalyticsEvent` enum:

- `APP_OPEN` - App opened
- `SESSION_START` - Session started
- `SESSION_END` - Session ended
- `QUIZ_START` - Quiz started
- `QUESTION_ANSWERED` - Question answered
- `QUIZ_COMPLETED` - Quiz completed
- `QUIZ_ABANDONED` - Quiz abandoned
- `BRAND_IMPRESSION` - Brand ad shown
- `BRAND_QUIZ_START` - Brand quiz started
- `BRAND_CTA_CLICK` - Brand CTA clicked
- `COUPON_REDEEMED` - Coupon redeemed
- `EVENT_PARTICIPATION` - Event participation

## Best Practices

1. **Non-blocking**: All analytics calls are non-blocking and won't slow down your UI
2. **Error handling**: Analytics failures are handled gracefully and won't break your app
3. **Privacy**: User IDs are only tracked when users are logged in
4. **Performance**: Events are batched and sent asynchronously
5. **Scalability**: Designed to handle 1M+ users efficiently

## Firestore Security Rules

Make sure your Firestore security rules allow writes to analytics collections:

```javascript
match /quiz_attempts/{attemptId} {
  allow create: if request.auth != null;
  allow read, update: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     request.auth.token.email == 'admin@fantasy.com');
}

match /brand_events/{eventId} {
  allow create: if true; // Allow anonymous tracking
  allow read: if request.auth != null;
}

match /coupon_redemptions/{redemptionId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     request.auth.token.email == 'admin@fantasy.com');
}

match /sessions/{sessionId} {
  allow create: if true; // Allow anonymous tracking
  allow read: if request.auth != null;
}

match /analytics_events/{eventId} {
  allow create: if true; // Allow anonymous tracking
  allow read: if request.auth != null;
}
```

## Sample Analytics Report

See `ANALYTICS_SAMPLE_REPORT.md` for a sample Domino's analytics report.

