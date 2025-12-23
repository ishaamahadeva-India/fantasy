# Video Advertisement System - Technical Specification

## Overview

This document outlines the technical specification for implementing a video advertisement system that allows users to watch sponsor videos to unlock tournament participation instead of paying entry fees.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Component Structure](#component-structure)
4. [User Flow](#user-flow)
5. [Admin Panel Features](#admin-panel-features)
6. [Analytics & Tracking](#analytics--tracking)
7. [API Design](#api-design)
8. [Security Considerations](#security-considerations)
9. [Implementation Phases](#implementation-phases)
10. [Testing Requirements](#testing-requirements)

---

## System Architecture

### High-Level Flow

```
User → Select Tournament → Check Entry Requirement → 
  → If "Ad Watch" Required → Show Video Ad → 
  → Track Completion → Unlock Participation → 
  → Create Tournament Entry
```

### Components

1. **Video Ad Player Component** - Custom video player with tracking
2. **Ad Verification Service** - Validates ad completion
3. **Ad Management System** - Admin panel for managing ads
4. **Analytics Dashboard** - Sponsor analytics and reporting
5. **Entry Gate System** - Controls tournament access based on ad completion

---

## Database Schema

### New Collections

#### 1. `advertisements` Collection (Enhanced)

```typescript
type Advertisement = {
  id: string;
  sponsorId: string; // Reference to sponsor
  sponsorName: string;
  title: string;
  description: string;
  videoUrl: string; // URL to video file (S3, Cloudinary, etc.)
  thumbnailUrl: string;
  duration: number; // Duration in seconds
  type: 'pre_roll' | 'mid_roll' | 'post_roll' | 'standalone';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  
  // Targeting
  targetTournaments?: string[]; // Specific tournaments
  targetCategories?: string[]; // Article categories, etc.
  targetAudience?: {
    ageRange?: [number, number];
    location?: string[];
    interests?: string[];
  };
  
  // Scheduling
  startDate: Date;
  endDate: Date;
  priority: number; // Higher = shown first
  
  // Pricing & Limits
  maxViews?: number; // Total views allowed
  currentViews: number;
  maxViewsPerUser?: number; // Prevent spam
  cpmRate?: number; // Cost per 1000 views
  totalBudget?: number;
  
  // Tracking
  clickThroughUrl?: string; // CTA button URL
  trackingPixel?: string; // Third-party tracking
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
}
```

#### 2. `ad-views` Collection

```typescript
type AdView = {
  id: string;
  advertisementId: string;
  userId: string;
  tournamentId?: string; // If ad was for tournament entry
  articleId?: string; // If ad was for article access
  
  // View Details
  startedAt: Date;
  completedAt?: Date;
  watchedDuration: number; // Seconds watched
  completionPercentage: number; // 0-100
  wasCompleted: boolean;
  
  // Interaction
  clicked: boolean;
  clickedAt?: Date;
  clickThroughUrl?: string;
  
  // Device & Context
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  ipAddress?: string; // For fraud detection
  
  // Verification
  verified: boolean; // Manual/admin verification
  verificationNotes?: string;
}
```

#### 3. `ad-sponsors` Collection

```typescript
type AdSponsor = {
  id: string;
  name: string;
  companyName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Social Links
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  
  // Billing
  billingAddress?: string;
  paymentMethod?: string;
  totalSpent: number;
  totalViews: number;
  
  // Status
  status: 'active' | 'inactive' | 'suspended';
  contractStartDate?: Date;
  contractEndDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. Enhanced `tournament-entries` Collection

```typescript
type TournamentEntry = {
  // ... existing fields ...
  
  // Entry Method
  entryMethod: 'free' | 'paid' | 'ad_watch' | 'social_follow' | 'hybrid';
  
  // Ad Watch Details (if applicable)
  adViewId?: string; // Reference to ad-views collection
  advertisementId?: string;
  adWatchedAt?: Date;
  
  // Social Follow Details (if applicable)
  socialFollows?: {
    instagram?: boolean;
    twitter?: boolean;
    facebook?: boolean;
    verifiedAt?: Date;
  };
}
```

---

## Component Structure

### 1. Video Ad Player Component

**File:** `src/components/ads/video-ad-player.tsx`

**Features:**
- Custom video player with progress tracking
- Completion detection (80%+ watched = complete)
- Skip prevention (for required ads)
- Click-through button overlay
- Loading states
- Error handling
- Mobile-optimized controls

**Props:**
```typescript
type VideoAdPlayerProps = {
  advertisement: Advertisement;
  onComplete: (viewId: string) => void;
  onError: (error: Error) => void;
  required?: boolean; // If true, cannot skip
  showSkipAfter?: number; // Allow skip after X seconds (optional)
  autoPlay?: boolean;
  muted?: boolean;
}
```

**Key Features:**
- Progress tracking every 1 second
- Completion callback at 80% watched
- Click tracking on CTA button
- View duration tracking
- Pause/resume tracking

### 2. Ad Gate Component

**File:** `src/components/ads/ad-gate.tsx`

**Purpose:** Controls access based on ad completion

**Features:**
- Checks if user has watched required ad
- Shows ad player if not watched
- Unlocks content after completion
- Handles multiple ad requirements

### 3. Ad Analytics Component

**File:** `src/components/admin/ads/analytics-dashboard.tsx`

**Features:**
- View count charts
- Completion rate metrics
- Click-through rate
- User demographics
- Revenue tracking
- Export reports

---

## User Flow

### Flow 1: Tournament Entry via Ad Watch

```
1. User clicks "Join Tournament"
2. System checks entry requirement:
   - If free → Direct entry
   - If paid → Show payment options
   - If ad_watch → Show ad gate
   
3. Ad Gate Flow:
   a. Check if user already watched ad for this tournament
   b. If yes → Direct entry
   c. If no → Show ad selection logic:
      - Get active ads for this tournament
      - Filter by targeting rules
      - Select highest priority ad
      - Show ad player
   
4. User watches ad:
   a. Track start time
   b. Track progress (every 1 second)
   c. Track completion (80%+ watched)
   d. Track clicks on CTA
   
5. After completion:
   a. Create ad-view record
   b. Create tournament-entry with adViewId
   c. Show success message
   d. Redirect to tournament page
```

### Flow 2: Ad Selection Logic

```typescript
function selectAdForTournament(tournamentId: string, userId: string): Advertisement | null {
  // 1. Get active ads
  const activeAds = getActiveAds({
    targetTournaments: [tournamentId],
    status: 'active',
    startDate: { $lte: now() },
    endDate: { $gte: now() }
  });
  
  // 2. Filter by user eligibility
  const eligibleAds = activeAds.filter(ad => {
    // Check view limits
    if (ad.maxViewsPerUser) {
      const userViews = getUserAdViews(userId, ad.id);
      if (userViews >= ad.maxViewsPerUser) return false;
    }
    
    // Check total views
    if (ad.maxViews && ad.currentViews >= ad.maxViews) return false;
    
    // Check targeting
    if (!matchesTargeting(ad, userId)) return false;
    
    return true;
  });
  
  // 3. Sort by priority (highest first)
  eligibleAds.sort((a, b) => b.priority - a.priority);
  
  // 4. Return highest priority ad
  return eligibleAds[0] || null;
}
```

---

## Admin Panel Features

### 1. Ad Management Page

**Route:** `/admin/ads/video`

**Features:**
- List all video ads
- Create new ad
- Edit existing ad
- Delete/deactivate ad
- Upload video files
- Set targeting rules
- Set scheduling
- Set pricing/budgets

### 2. Sponsor Management

**Route:** `/admin/ads/sponsors`

**Features:**
- CRUD for sponsors
- Link ads to sponsors
- View sponsor analytics
- Manage contracts
- Billing information

### 3. Analytics Dashboard

**Route:** `/admin/ads/analytics`

**Features:**
- Real-time view counts
- Completion rates
- Click-through rates
- Revenue tracking
- User demographics
- Export reports (CSV, PDF)
- Date range filters
- Ad performance comparison

### 4. Ad Assignment to Tournaments

**Route:** `/admin/fantasy/tournament/[id]/edit`

**Features:**
- Select entry method (free/paid/ad_watch/hybrid)
- If ad_watch:
  - Select specific ad
  - Or auto-select based on targeting
  - Set ad requirements (pre-roll, mid-roll, etc.)

---

## Analytics & Tracking

### Metrics to Track

1. **View Metrics:**
   - Total views
   - Unique views
   - Completion rate (%)
   - Average watch duration
   - Drop-off points

2. **Engagement Metrics:**
   - Click-through rate
   - Click-through count
   - Time to click
   - Post-ad actions

3. **User Metrics:**
   - Demographics (age, location, device)
   - Returning vs new viewers
   - View frequency

4. **Revenue Metrics:**
   - Total revenue per ad
   - CPM achieved
   - Cost per acquisition
   - ROI for sponsors

### Tracking Implementation

```typescript
// Track ad view progress
function trackAdProgress(viewId: string, currentTime: number, duration: number) {
  const percentage = (currentTime / duration) * 100;
  
  updateDoc(doc(firestore, 'ad-views', viewId), {
    watchedDuration: currentTime,
    completionPercentage: percentage,
    wasCompleted: percentage >= 80,
    updatedAt: serverTimestamp()
  });
}

// Track ad completion
function trackAdCompletion(viewId: string, advertisementId: string) {
  // Update ad-view
  updateDoc(doc(firestore, 'ad-views', viewId), {
    completedAt: serverTimestamp(),
    wasCompleted: true,
    completionPercentage: 100
  });
  
  // Update advertisement view count
  const adRef = doc(firestore, 'advertisements', advertisementId);
  updateDoc(adRef, {
    currentViews: increment(1),
    updatedAt: serverTimestamp()
  });
  
  // Update sponsor stats
  // ... update sponsor totalViews
}

// Track click-through
function trackClickThrough(viewId: string, url: string) {
  updateDoc(doc(firestore, 'ad-views', viewId), {
    clicked: true,
    clickedAt: serverTimestamp(),
    clickThroughUrl: url
  });
  
  // Fire tracking pixel if configured
  // ... third-party tracking
}
```

---

## API Design

### Firestore Functions

#### 1. `src/firebase/firestore/advertisements.ts`

```typescript
// Create advertisement
export function createAdvertisement(
  firestore: Firestore,
  adData: NewAdvertisement
): Promise<DocumentReference>

// Update advertisement
export function updateAdvertisement(
  firestore: Firestore,
  adId: string,
  adData: Partial<NewAdvertisement>
): Promise<void>

// Get active ads for tournament
export function getActiveAdsForTournament(
  firestore: Firestore,
  tournamentId: string
): Promise<Advertisement[]>

// Select best ad for user/tournament
export function selectAdForEntry(
  firestore: Firestore,
  tournamentId: string,
  userId: string
): Promise<Advertisement | null>
```

#### 2. `src/firebase/firestore/ad-views.ts`

```typescript
// Create ad view record
export function createAdView(
  firestore: Firestore,
  viewData: NewAdView
): Promise<DocumentReference>

// Track ad progress
export function updateAdViewProgress(
  firestore: Firestore,
  viewId: string,
  progress: {
    watchedDuration: number;
    completionPercentage: number;
  }
): Promise<void>

// Mark ad as completed
export function completeAdView(
  firestore: Firestore,
  viewId: string
): Promise<void>

// Track click-through
export function trackAdClick(
  firestore: Firestore,
  viewId: string,
  url: string
): Promise<void>

// Check if user watched ad for tournament
export function hasUserWatchedAd(
  firestore: Firestore,
  userId: string,
  tournamentId: string
): Promise<boolean>

// Get user's ad views
export function getUserAdViews(
  firestore: Firestore,
  userId: string,
  advertisementId?: string
): Promise<AdView[]>
```

---

## Security Considerations

### 1. Fraud Prevention

- **View Verification:**
  - Minimum watch duration (80% of video)
  - Progress tracking (prevent fast-forward)
  - Device fingerprinting
  - IP address tracking
  - Rate limiting (max views per user/IP)

- **Bot Detection:**
  - CAPTCHA for suspicious activity
  - Human interaction verification
  - Playback event tracking

### 2. Video Security

- **Video Hosting:**
  - Use secure CDN (Cloudflare, CloudFront)
  - Signed URLs with expiration
  - Domain restrictions
  - DRM for premium content (optional)

- **Access Control:**
  - Verify user authentication
  - Check ad availability
  - Validate view limits

### 3. Data Privacy

- **GDPR Compliance:**
  - User consent for tracking
  - Data anonymization options
  - Right to deletion

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)

**Tasks:**
1. Create database collections
2. Set up Firestore security rules
3. Create basic ad management functions
4. Create ad-view tracking functions
5. Set up video hosting (Cloudinary/S3)

**Deliverables:**
- Database schema implemented
- Basic CRUD operations
- Security rules configured

### Phase 2: Video Player Component (Week 2-3)

**Tasks:**
1. Build custom video player component
2. Implement progress tracking
3. Add completion detection
4. Add click-through tracking
5. Mobile optimization

**Deliverables:**
- Working video ad player
- Progress tracking
- Completion verification

### Phase 3: Ad Gate System (Week 3-4)

**Tasks:**
1. Build ad gate component
2. Integrate with tournament entry flow
3. Implement ad selection logic
4. Add entry method selection
5. Handle multiple ad requirements

**Deliverables:**
- Ad gate working
- Tournament entry via ad watch
- Ad selection logic

### Phase 4: Admin Panel (Week 4-5)

**Tasks:**
1. Create ad management UI
2. Create sponsor management UI
3. Add video upload functionality
4. Add targeting configuration
5. Add scheduling interface

**Deliverables:**
- Complete admin panel
- Ad CRUD operations
- Sponsor management

### Phase 5: Analytics Dashboard (Week 5-6)

**Tasks:**
1. Build analytics dashboard
2. Implement metrics calculation
3. Add charts and visualizations
4. Add export functionality
5. Add real-time updates

**Deliverables:**
- Analytics dashboard
- Reports and exports
- Real-time metrics

### Phase 6: Testing & Optimization (Week 6-7)

**Tasks:**
1. Unit testing
2. Integration testing
3. Performance optimization
4. Security audit
5. User acceptance testing

**Deliverables:**
- Test coverage
- Performance benchmarks
- Security report

---

## Testing Requirements

### Unit Tests

- Ad selection logic
- View tracking functions
- Completion verification
- Analytics calculations

### Integration Tests

- Ad gate flow
- Tournament entry with ad
- Admin panel operations
- Analytics data flow

### E2E Tests

- Complete user journey:
  1. Select tournament
  2. Watch ad
  3. Complete entry
  4. Verify access

### Performance Tests

- Video loading time
- Tracking overhead
- Database query performance
- Concurrent view handling

### Security Tests

- Fraud prevention
- Access control
- Data validation
- Rate limiting

---

## File Structure

```
src/
├── components/
│   ├── ads/
│   │   ├── video-ad-player.tsx
│   │   ├── ad-gate.tsx
│   │   ├── ad-thumbnail.tsx
│   │   └── ad-skip-button.tsx
│   └── admin/
│       └── ads/
│           ├── ad-form.tsx
│           ├── ad-list.tsx
│           ├── sponsor-form.tsx
│           ├── analytics-dashboard.tsx
│           └── ad-assignment.tsx
├── firebase/
│   └── firestore/
│       ├── advertisements.ts
│       ├── ad-views.ts
│       └── ad-sponsors.ts
├── app/
│   ├── admin/
│   │   └── ads/
│   │       ├── page.tsx (list)
│   │       ├── new/page.tsx
│   │       ├── edit/[id]/page.tsx
│   │       ├── sponsors/page.tsx
│   │       └── analytics/page.tsx
│   └── fantasy/
│       └── cricket/
│           └── tournament/
│               └── [id]/
│                   └── entry/page.tsx (ad gate)
└── lib/
    └── utils/
        ├── ad-selection.ts
        ├── ad-tracking.ts
        └── ad-analytics.ts
```

---

## Environment Variables

```bash
# Video Hosting (Cloudinary example)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Video Hosting (AWS S3 example)
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Ad Tracking
AD_TRACKING_ENABLED=true
AD_MIN_COMPLETION_PERCENTAGE=80
AD_MAX_VIEWS_PER_USER=5
```

---

## Firestore Security Rules

```javascript
// Advertisements - public read, admin write
match /advertisements/{adId} {
  allow read: if true; // Public for ad serving
  allow create, update, delete: if isAdmin();
}

// Ad Views - users can create their own, read own, admin read all
match /ad-views/{viewId} {
  allow read: if isAuthenticated() && 
                (resource.data.userId == request.auth.uid || isAdmin());
  allow create: if isAuthenticated() && 
                  request.resource.data.userId == request.auth.uid;
  allow update: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.userId == request.auth.uid;
  allow delete: if isAdmin();
}

// Ad Sponsors - admin only
match /ad-sponsors/{sponsorId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}
```

---

## Success Metrics

### Technical Metrics
- ✅ Ad load time < 2 seconds
- ✅ Completion tracking accuracy > 99%
- ✅ Zero data loss in tracking
- ✅ 99.9% uptime

### Business Metrics
- ✅ 80%+ ad completion rate
- ✅ 5%+ click-through rate
- ✅ 50%+ user preference for ad watch vs paid
- ✅ 20%+ revenue increase from sponsors

---

## Future Enhancements

1. **A/B Testing:** Test different ad creatives
2. **Programmatic Ads:** Integrate with ad networks
3. **Advanced Targeting:** ML-based ad selection
4. **Rewarded Ads:** Bonus points for watching extra ads
5. **Social Follow Integration:** Combine with social follow requirements
6. **Ad Scheduling:** Time-based ad rotation
7. **Multi-ad Support:** Show multiple ads for premium tournaments

---

## Conclusion

This specification provides a complete roadmap for implementing a video advertisement system that:
- ✅ Maximizes sponsor value
- ✅ Provides excellent user experience
- ✅ Generates measurable ROI
- ✅ Scales efficiently
- ✅ Prevents fraud
- ✅ Provides comprehensive analytics

**Estimated Development Time:** 6-7 weeks
**Estimated Cost:** Medium (video hosting + development)
**ROI Potential:** High (sponsor revenue + user growth)

---

**Document Version:** 1.0
**Last Updated:** 2024
**Status:** Ready for Implementation

