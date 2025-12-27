# QuizzBuzz Points System - Complete Guide

## Overview
This document explains how QuizzBuzz points are calculated for fantasy games and how they're updated in the user's balance for redemption.

---

## 1. Points Calculation for Fantasy Games

### Location: `src/lib/points-engine.ts`

Points are calculated based on **user predictions** vs **verified event results**. The calculation happens in the `calculatePoints()` function.

### Calculation Logic by Event Type

#### A. Choice Selection Events (`choice_selection`)
- **Correct Prediction**: 
  - Base points (from `event.points` or `pointsConfig.basePoints`)
  - Plus perfect bonus (if `pointsConfig.perfectBonus` is set)
  - Accuracy: 100%
  
- **Wrong Prediction**:
  - Negative marking deducted (if `pointsConfig.negativeMarking > 0`)
  - Otherwise: 0 points

**Example:**
```typescript
// Event has basePoints: 50, perfectBonus: 10
// User predicts correctly → Gets 60 points (50 + 10)
// User predicts incorrectly → Gets -5 points (if negativeMarking: 5)
```

#### B. Numeric Prediction Events (`numeric_prediction`)

**Perfect Match:**
- Base points + perfect bonus
- Accuracy: 100%

**Accuracy-Based Scoring** (if `pointsConfig.accuracyBased: true`):
- Points scale with accuracy: `points = (basePoints * accuracy) / 100`
- Accuracy calculated based on how close prediction is to actual value
- If accuracy ≥ 95%, considered correct and gets perfect bonus

**Range-Based Scoring** (default):
- If prediction is within 10% tolerance of actual value:
  - Gets 50% of base points
  - Accuracy: 90%
- Otherwise: Negative marking (if enabled) or 0 points

**Example:**
```typescript
// Event: "Predict movie box office collection"
// Base points: 100, actual value: ₹100 crores
// User predicts ₹95 crores (within 10% tolerance)
// → Gets 50 points (50% of base)
```

#### C. Draft Selection Events (`draft_selection`)
- Currently simplified: Returns base points if result indicates success
- Accuracy: 100%

### Total Campaign Points

The `calculateTotalCampaignPoints()` function sums points across all events in a campaign:

```typescript
// For each user prediction:
// 1. Find the corresponding event
// 2. Get the verified result
// 3. Calculate points using calculatePoints()
// 4. Sum all points
```

### Points Configuration (`PointsConfig`)

Each event can have a `pointsConfig` that defines:
- `basePoints`: Base points for correct prediction
- `perfectBonus`: Bonus for perfect predictions
- `negativeMarking`: Points deducted for wrong predictions
- `accuracyBased`: Whether to use accuracy-based scoring
- `difficultyLevel`: 'easy' | 'medium' | 'hard'

---

## 2. Points Storage & Update Mechanism

### User Balance Storage
- **Location**: `users/{userId}` document
- **Field**: `points` (number)
- **Initial Value**: 0 (or set during user creation)

### Points Update Function
**Location**: `src/firebase/firestore/users.ts`

```typescript
updateUserPoints(firestore, userId, points)
```

**How it works:**
- Uses Firestore's `increment()` function for atomic updates
- Can add positive points (awards) or negative points (deductions)
- Updates the `points` field in the user's profile document

**Example:**
```typescript
// Award 100 points
updateUserPoints(firestore, userId, 100);

// Deduct 50 points (redemption)
updateUserPoints(firestore, userId, -50);
```

---

## 3. Points Distribution Flow

### Current Implementation Status

**✅ Points Calculation**: Fully implemented
- `calculatePoints()` - Calculates points per prediction
- `calculateTotalCampaignPoints()` - Sums campaign points
- `calculateMovieWisePoints()` - Calculates movie-specific points

**⚠️ Automatic Distribution**: **NOT FULLY AUTOMATED**

Currently, the system:
1. ✅ Calculates points when results are verified
2. ✅ Stores total points in `participations` subcollection (`totalPoints` field)
3. ❌ **Does NOT automatically update user balance** after results are verified

### How Points Should Be Distributed

**Option 1: Manual Distribution (Current)**
- Admin verifies results → Points are calculated but not automatically added to user balance
- Admin needs to manually trigger point distribution (if such functionality exists)

**Option 2: Automatic Distribution (Recommended)**
- When admin verifies/approves results:
  1. Fetch all participations for the campaign
  2. Calculate points for each user
  3. Call `updateUserPoints()` for each user
  4. Update participation document with awarded points

**Implementation Location Needed:**
- `src/app/admin/fantasy/campaign/[id]/results/page.tsx`
- Add logic in `handleApproveResult()` to distribute points

---

## 4. Redemption Centre Balance

### Location: `src/app/redeem/page.tsx`

### How Balance is Displayed
```typescript
// Reads from user profile
const userProfile = useDoc(doc(firestore, 'users', userId));
const userPoints = userProfile?.points || 0;
```

### How Redemption Works
1. User selects a reward
2. Checks if `userPoints >= reward.cost`
3. On confirmation, calls:
   ```typescript
   updateUserPoints(firestore, user.uid, -cost);
   ```
4. Points are deducted from balance
5. User receives the reward

### Balance Update Flow
```
User Balance (users/{userId}.points)
    ↓
Points Earned: +points (from campaigns, quizzes, etc.)
    ↓
Points Redeemed: -points (from redemption centre)
    ↓
Current Balance = Previous Balance + Earned - Redeemed
```

---

## 5. Other Sources of Points

### A. Quiz Completion
**Location**: `src/components/quiz/quiz-completion.tsx`
- Points awarded when user completes a quiz
- Calls `updateUserPoints(firestore, user.uid, pointsEarned)`

### B. Ratings & Feedback
**Location**: `src/firebase/firestore/ratings.ts`
- 25 points for submitting ratings
- 25 points for pulse checks
- 10 points for score ratings

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FANTASY CAMPAIGN                         │
│                                                             │
│  1. User makes predictions                                  │
│  2. Admin verifies results                                  │
│  3. Points calculated (calculatePoints)                      │
│  4. Total points stored in participations/{userId}         │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ (NEEDS IMPLEMENTATION)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              POINTS DISTRIBUTION                            │
│                                                             │
│  For each participation:                                    │
│  - Calculate totalPoints                                    │
│  - Call updateUserPoints(userId, totalPoints)               │
│  - Update users/{userId}.points                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              USER BALANCE (users/{userId})                  │
│                                                             │
│  points: number (cumulative balance)                        │
│                                                             │
│  Sources:                                                   │
│  - Fantasy campaign points                                  │
│  - Quiz completion points                                   │
│  - Rating/feedback points                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              REDEMPTION CENTRE                              │
│                                                             │
│  1. Display userPoints                                     │
│  2. User selects reward                                     │
│  3. Deduct points: updateUserPoints(userId, -cost)         │
│  4. Update balance                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/points-engine.ts` | Points calculation logic |
| `src/firebase/firestore/users.ts` | User balance update function |
| `src/app/redeem/page.tsx` | Redemption centre UI |
| `src/app/admin/fantasy/campaign/[id]/results/page.tsx` | Result verification (needs point distribution) |
| `src/lib/types.ts` | Type definitions (PointsConfig, EventResult, etc.) |

---

## 8. Important Notes

### ⚠️ Current Gap
**Points are calculated but NOT automatically added to user balance after campaign results are verified.**

### ✅ What Works
- Points calculation logic is complete
- User balance storage and updates work
- Redemption centre deducts points correctly
- Points from quizzes and ratings are awarded

### 🔧 What Needs Implementation
- **Automatic point distribution** after campaign results are approved
- This should happen in the admin results page when results are verified/approved

---

## 9. Example: Complete Flow

### Scenario: User participates in a fantasy campaign

1. **User Makes Predictions**
   - Predicts 3 events in a campaign
   - Each event worth 50 base points

2. **Admin Verifies Results**
   - Event 1: User correct → 50 points
   - Event 2: User correct → 50 points  
   - Event 3: User wrong → 0 points
   - **Total: 100 points calculated**

3. **Points Distribution** (NEEDS IMPLEMENTATION)
   - System should call: `updateUserPoints(userId, 100)`
   - User balance increases by 100

4. **User Checks Balance**
   - Goes to Redemption Centre
   - Sees updated balance: `Previous Balance + 100`

5. **User Redeems Reward**
   - Selects reward costing 50 points
   - System calls: `updateUserPoints(userId, -50)`
   - Balance decreases by 50

---

## 10. Recommendations

1. **Implement Automatic Distribution**
   - Add point distribution logic when results are approved
   - Ensure points are only distributed once per campaign

2. **Add Point History**
   - Track point transactions (earned/redeemed)
   - Show users where their points came from

3. **Add Validation**
   - Prevent negative balances (except for negative marking)
   - Validate point amounts before distribution

4. **Add Admin Controls**
   - Manual point adjustment capability
   - Point distribution status tracking

