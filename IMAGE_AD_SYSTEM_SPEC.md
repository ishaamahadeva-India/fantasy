# Image Advertisement System - Technical Specification

## Overview

Simplified ad system using static images instead of videos. Users view an image ad for a few seconds, then can proceed to participate in tournaments.

**Advantages:**
- ✅ Faster to implement (2-3 weeks vs 5-6 weeks)
- ✅ Lower bandwidth costs
- ✅ Faster loading
- ✅ Works on all devices
- ✅ Easier for sponsors (no video production needed)

---

## System Architecture

### High-Level Flow

```
User → Select Tournament → Check Entry Requirement → 
  → If "Ad Watch" Required → Show Image Ad → 
  → Timer (3-5 seconds) → Show Cancel Button → 
  → User Clicks Continue → Track View → Unlock Participation
```

---

## Database Schema

### Enhanced Collections

#### 1. `advertisements` Collection (Simplified)

```typescript
type Advertisement = {
  id: string;
  sponsorId: string;
  sponsorName: string;
  title: string;
  description?: string;
  
  // Image instead of video
  imageUrl: string; // URL to ad image
  thumbnailUrl?: string;
  
  // Display Settings
  displayDuration: number; // Seconds to show (default: 5)
  clickThroughUrl?: string; // URL when image is clicked
  
  // Targeting
  targetTournaments?: string[];
  targetCategories?: string[];
  
  // Status & Scheduling
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  startDate: Date;
  endDate: Date;
  priority: number;
  
  // Limits
  maxViews?: number;
  currentViews: number;
  maxViewsPerUser?: number;
  
  // Tracking
  trackingPixel?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

#### 2. `ad-views` Collection (Simplified)

```typescript
type AdView = {
  id: string;
  advertisementId: string;
  userId: string;
  tournamentId?: string;
  
  // View Details
  viewedAt: Date;
  viewedDuration: number; // Seconds viewed
  wasCompleted: boolean; // Viewed for required duration
  
  // Interaction
  clicked: boolean;
  clickedAt?: Date;
  clickThroughUrl?: string;
  
  // Device Info
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
}
```

---

## Component Structure

### 1. Image Ad Display Component

**File:** `src/components/ads/image-ad-display.tsx`

**Features:**
- Display image ad
- Timer countdown (3-5 seconds)
- Click-through on image
- Cancel/Continue button after timer
- Progress indicator
- Mobile-responsive

**Props:**
```typescript
type ImageAdDisplayProps = {
  advertisement: Advertisement;
  onComplete: (viewId: string) => void;
  onCancel?: () => void;
  required?: boolean; // If true, must wait for timer
  displayDuration?: number; // Override default duration
}
```

**UI Flow:**
1. Show image ad (full screen or modal)
2. Show timer countdown (e.g., "5... 4... 3...")
3. After timer: Show "Continue" button
4. User clicks Continue → Track view → Callback

---

### 2. Image Ad Gate Component

**File:** `src/components/ads/image-ad-gate.tsx`

**Purpose:** Controls access based on image ad view

**Features:**
- Checks if user viewed ad
- Shows ad display if not viewed
- Unlocks after completion
- Handles multiple ads (rotation)

---

## User Flow

### Flow: Tournament Entry via Image Ad

```
1. User clicks "Join Tournament"
2. System checks entry requirement:
   - If free → Direct entry
   - If paid → Show payment
   - If ad_watch → Show image ad gate
   
3. Image Ad Gate Flow:
   a. Check if user already viewed ad
   b. If yes → Direct entry
   c. If no → Show ad selection:
      - Get active ads for tournament
      - Select highest priority ad
      - Show image ad display
   
4. Image Ad Display:
   a. Show image (full screen or modal)
   b. Start timer (5 seconds default)
   c. Show countdown
   d. After timer: Show "Continue" button
   e. User can click image to visit sponsor URL
   
5. User clicks Continue:
   a. Create ad-view record
   b. Mark as completed
   c. Create tournament-entry
   d. Show success message
   e. Redirect to tournament
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1) - 20-25 hours

**Day 1-2: Database & Types (8-10 hours)**
- Create simplified Advertisement type
- Create AdView type
- Update Firestore collections
- Write security rules

**Day 3: Firestore Functions (6-8 hours)**
- `createAdvertisement()`
- `getActiveAdsForTournament()`
- `createAdView()`
- `hasUserViewedAd()`

**Day 4-5: Image Hosting (4-6 hours)**
- Set up image upload (Cloudinary/ImgBB)
- Create upload utility
- Test image upload/display

---

### Phase 2: Image Ad Component (Week 2) - 25-30 hours

**Day 6-7: Ad Display Component (10-12 hours)**
- Create image ad display component
- Add timer countdown
- Add continue button
- Add click-through on image
- Mobile optimization

**Day 8: Ad Gate Component (6-8 hours)**
- Create ad gate component
- Integrate ad selection
- Handle completion
- Error handling

**Day 9-10: Tournament Integration (8-10 hours)**
- Integrate with tournament entry
- Update entry flow
- Add entry method selection
- Test complete flow

---

### Phase 3: Admin Panel (Week 2-3) - 25-30 hours

**Day 11-12: Ad Management (10-12 hours)**
- Ad list page
- Create/edit ad form
- Image upload
- Status management

**Day 13: Sponsor Management (4-6 hours)**
- Sponsor CRUD
- Link ads to sponsors

**Day 14: Tournament Assignment (4-6 hours)**
- Assign ads to tournaments
- Entry method selection

**Day 15: Testing (4-6 hours)**
- Test admin operations
- Test user flow
- Fix bugs

---

### Phase 4: Analytics & Polish (Week 3) - 15-20 hours

**Day 16-17: Basic Analytics (8-10 hours)**
- View count tracking
- Completion rate
- Click-through rate
- Simple dashboard

**Day 18-19: Testing & Optimization (6-8 hours)**
- Comprehensive testing
- Performance optimization
- Bug fixes
- UI polish

**Day 20: Launch Prep (2-3 hours)**
- Documentation
- Final testing
- Deploy

---

## Total Timeline

**Duration:** 3 weeks (20 days)  
**Hours:** 85-105 hours  
**Developer:** 1 full-time developer

---

## Component Code Structure

### Image Ad Display Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImageAdDisplayProps = {
  advertisement: {
    id: string;
    imageUrl: string;
    clickThroughUrl?: string;
    displayDuration: number;
    sponsorName: string;
  };
  onComplete: (viewId: string) => void;
  onCancel?: () => void;
  required?: boolean;
};

export function ImageAdDisplay({ 
  advertisement, 
  onComplete, 
  onCancel,
  required = true 
}: ImageAdDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(advertisement.displayDuration);
  const [canContinue, setCanContinue] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanContinue(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleContinue = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete(advertisement.id);
    }, 300);
  };

  const handleImageClick = () => {
    if (advertisement.clickThroughUrl) {
      window.open(advertisement.clickThroughUrl, '_blank');
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-opacity",
      isClosing && "opacity-0"
    )}>
      <div className="relative bg-background rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Close button (if not required) */}
        {!required && onCancel && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Ad Image */}
        <div 
          className={cn(
            "relative aspect-video w-full cursor-pointer",
            advertisement.clickThroughUrl && "hover:opacity-90 transition-opacity"
          )}
          onClick={handleImageClick}
        >
          <Image
            src={advertisement.imageUrl}
            alt={`Advertisement from ${advertisement.sponsorName}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {advertisement.clickThroughUrl && (
            <div className="absolute bottom-4 right-4">
              <Button variant="secondary" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Sponsor
              </Button>
            </div>
          )}
        </div>

        {/* Timer & Continue Button */}
        <div className="p-6 bg-muted/50">
          {!canContinue ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Please view this ad to continue
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-2xl font-bold text-primary">
                  {timeRemaining}
                </div>
                <span className="text-muted-foreground">seconds remaining</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Sponsored by <span className="font-semibold">{advertisement.sponsorName}</span>
              </p>
              <Button 
                onClick={handleContinue}
                size="lg"
                className="w-full sm:w-auto"
              >
                Continue to Tournament
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Advantages Over Video Ads

| Feature | Image Ads | Video Ads |
|---------|-----------|-----------|
| **Implementation Time** | 3 weeks | 5-6 weeks |
| **Development Hours** | 85-105 hrs | 180-220 hrs |
| **Bandwidth** | Low | High |
| **Loading Speed** | Fast (<1s) | Slower (2-5s) |
| **Sponsor Cost** | Low (no video production) | High (video production) |
| **User Experience** | Quick (5 seconds) | Longer (15-30 seconds) |
| **Mobile Friendly** | Excellent | Good |
| **Data Usage** | Minimal | High |

---

## Pricing Model for Sponsors

### Image Ad Pricing (Lower than Video)
- **Per View:** ₹2-10 per view
- **Per Tournament:** ₹5,000-25,000 per tournament
- **CPM:** ₹50-250 per 1000 views
- **Package Deals:** Multiple tournaments at discount

---

## Success Metrics

### Technical Metrics
- ✅ Ad load time < 1 second
- ✅ 95%+ completion rate (easier than video)
- ✅ Zero data loss
- ✅ Works on all devices

### Business Metrics
- ✅ 90%+ ad completion rate
- ✅ 8-10% click-through rate (higher than video)
- ✅ 60%+ user preference for image ads
- ✅ Lower sponsor costs = more sponsors

---

## File Structure

```
src/
├── components/
│   ├── ads/
│   │   ├── image-ad-display.tsx
│   │   ├── image-ad-gate.tsx
│   │   └── image-ad-thumbnail.tsx
│   └── admin/
│       └── ads/
│           ├── image-ad-form.tsx
│           ├── image-ad-list.tsx
│           └── analytics-dashboard.tsx
├── firebase/
│   └── firestore/
│       ├── advertisements.ts (simplified)
│       └── ad-views.ts (simplified)
└── app/
    └── admin/
        └── ads/
            ├── page.tsx
            ├── new/page.tsx
            └── edit/[id]/page.tsx
```

---

## Quick Comparison

### Image Ad System
- ⏱️ **Time:** 3 weeks
- 💰 **Cost:** Lower development cost
- 📱 **Mobile:** Excellent
- ⚡ **Speed:** Fast loading
- 🎯 **Completion Rate:** Higher (90%+)

### Video Ad System
- ⏱️ **Time:** 5-6 weeks
- 💰 **Cost:** Higher development cost
- 📱 **Mobile:** Good
- ⚡ **Speed:** Slower loading
- 🎯 **Completion Rate:** Lower (80%+)

---

## Recommendation

**Use Image Ads because:**
1. ✅ **3x faster to implement** (3 weeks vs 9 weeks)
2. ✅ **Better user experience** (5 seconds vs 15-30 seconds)
3. ✅ **Higher completion rates** (easier to view)
4. ✅ **Lower costs** (for both you and sponsors)
5. ✅ **Works everywhere** (no video codec issues)
6. ✅ **Easier for sponsors** (just need an image, not video production)

**You can always add video ads later** as an enhancement if needed!

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Estimated Timeline:** 3 weeks (85-105 hours)

