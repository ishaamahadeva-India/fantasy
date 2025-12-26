# Image Ads - Complete Guide: How, Where, and When They Display

**Last Updated:** January 2025

---

## 📋 **OVERVIEW**

Image ads are **full-screen, mandatory advertisements** that users must view before accessing certain fantasy game features. They act as an "ad gate" that users must pass through.

---

## 🎯 **WHERE IMAGE ADS DISPLAY**

Image ads display in **2 main locations**:

### **1. Movie Fantasy Campaigns** (`/fantasy/campaign/[id]`)
- **Location:** Campaign detail page
- **Trigger:** When user first views a campaign page
- **Purpose:** Show sponsor ads before viewing campaign events
- **File:** `src/app/fantasy/campaign/[id]/page.tsx`

### **2. Cricket Tournaments** (`/fantasy/cricket/tournament/[id]`)
- **Location:** Tournament detail page
- **Trigger:** When user clicks "Join Tournament" button
- **Purpose:** Show sponsor ads before joining tournament (especially for `ad_watch` entry method)
- **File:** `src/app/fantasy/cricket/tournament/[id]/page.tsx`

---

## ⏰ **WHEN IMAGE ADS DISPLAY**

### **Display Conditions:**

Image ads will display **ONLY IF** all of the following conditions are met:

#### ✅ **1. User Hasn't Viewed Ad Before**
- Checks Firestore `image-ad-views` collection
- Checks localStorage: `ad-viewed-{campaignId/tournamentId}-{userId}`
- If user already viewed an ad for this campaign/tournament → **NO AD SHOWN**

#### ✅ **2. Ad is Active**
- `status === 'active'`
- Current date is between `startDate` and `endDate`
- Ad hasn't exceeded `maxViews` (total view limit)

#### ✅ **3. Ad Targets This Campaign/Tournament**
- For campaigns: `targetCampaigns` is empty (all campaigns) OR includes this `campaignId`
- For tournaments: `targetTournaments` is empty (all tournaments) OR includes this `tournamentId`

#### ✅ **4. User Hasn't Reached Per-User Limit**
- If `maxViewsPerUser` is set, checks if user has completed that many views
- If user reached limit → **NO AD SHOWN** (allows entry)

#### ✅ **5. User is Logged In**
- Requires authenticated user (`user?.uid`)

---

## 🔢 **HOW MANY TIMES ADS DISPLAY**

### **Per Campaign/Tournament:**
- **Once per user per campaign/tournament**
- After viewing, user can access that campaign/tournament without seeing ads again
- Tracked in:
  - Firestore: `image-ad-views` collection
  - localStorage: `ad-viewed-{id}-{userId}`

### **Per Advertisement:**
- **Per-User Limit:** Controlled by `maxViewsPerUser` field
  - If set to `5`, user can see this ad maximum 5 times across all campaigns/tournaments
  - After limit reached, ad won't show to that user anymore
- **Total Limit:** Controlled by `maxViews` field
  - If set to `1000`, ad stops showing after 1000 total views across all users
  - After limit reached, ad won't show to anyone

### **Example Scenarios:**

**Scenario 1: User views Campaign A**
- ✅ Ad shows (first time)
- User views ad for 5 seconds
- ✅ Ad marked as viewed
- User refreshes page → ❌ No ad (already viewed)
- User visits Campaign B → ✅ Ad shows (different campaign)

**Scenario 2: Ad with `maxViewsPerUser = 3`**
- User views ad in Campaign A → ✅ Shows (1/3)
- User views ad in Campaign B → ✅ Shows (2/3)
- User views ad in Campaign C → ✅ Shows (3/3)
- User views ad in Campaign D → ❌ No ad (limit reached)

**Scenario 3: Ad with `maxViews = 100`**
- 100 users view the ad → ✅ Still shows
- 101st user tries to view → ❌ No ad (total limit reached)

---

## 🎬 **HOW ADS DISPLAY (User Experience)**

### **Step-by-Step Flow:**

1. **User Action:**
   - Clicks on campaign/tournament OR clicks "Join Tournament"

2. **Ad Gate Check:**
   - System checks if user already viewed an ad
   - If yes → Skip ad, allow entry
   - If no → Show ad

3. **Ad Selection:**
   - System queries active ads matching campaign/tournament
   - Filters by date range, view limits, targeting
   - Selects highest priority ad

4. **Full-Screen Display:**
   - Ad displays in full-screen overlay (`z-50`)
   - Shows ad image
   - Shows countdown timer (default 5 seconds)
   - Shows "Continue" button (disabled until timer ends)

5. **User Interaction:**
   - User must wait for timer to complete
   - Timer shows: "X seconds remaining"
   - Progress bar fills up
   - After timer: "Continue" button becomes active

6. **Ad Completion:**
   - User clicks "Continue"
   - System records ad view in Firestore
   - Marks ad as viewed in localStorage
   - Increments ad view count
   - Allows user to proceed

7. **Skip Option (if not required):**
   - If `required={false}`, user can click X button to skip
   - If `required={true}`, user must view ad

---

## 📊 **AD DISPLAY LOGIC**

### **Ad Selection Priority:**

1. **Filter Active Ads:**
   ```typescript
   - status === 'active'
   - startDate <= now <= endDate
   - currentViews < maxViews (if maxViews set)
   - Matches targetCampaigns/targetTournaments
   ```

2. **Sort by Priority:**
   - Higher `priority` value = shown first
   - If multiple ads have same priority, first one found is shown

3. **Check User Eligibility:**
   - User hasn't viewed this ad before (for this campaign/tournament)
   - User hasn't exceeded `maxViewsPerUser` limit

4. **Select Best Ad:**
   - Returns highest priority eligible ad
   - If no ads available → No ad shown, user proceeds

---

## 🔍 **TECHNICAL DETAILS**

### **Components:**

1. **`ImageAdGate`** (`src/components/ads/image-ad-gate.tsx`)
   - Main gate component
   - Checks if ad should show
   - Handles ad selection
   - Manages view tracking

2. **`ImageAdDisplay`** (`src/components/ads/image-ad-display.tsx`)
   - Displays the actual ad
   - Shows countdown timer
   - Handles user interaction
   - Tracks view duration

### **Firestore Collections:**

1. **`image-advertisements`**
   - Stores ad configuration
   - Fields: `status`, `startDate`, `endDate`, `maxViews`, `maxViewsPerUser`, `targetCampaigns`, `targetTournaments`, `priority`

2. **`image-ad-views`**
   - Tracks each ad view
   - Fields: `userId`, `advertisementId`, `campaignId`/`tournamentId`, `wasCompleted`, `viewedDuration`, `clicked`

### **Functions:**

1. **`selectAdForCampaign()`** - Selects ad for movie campaigns
2. **`selectAdForEntry()`** - Selects ad for cricket tournaments
3. **`hasUserViewedAdForCampaign()`** - Checks if user viewed ad for campaign
4. **`hasUserViewedAd()`** - Checks if user viewed ad for tournament
5. **`createImageAdView()`** - Records ad view
6. **`completeImageAdView()`** - Marks view as completed
7. **`incrementAdViews()`** - Increments ad's total view count

---

## 📝 **AD CONFIGURATION**

### **Admin Panel:**
- **Location:** `/admin/image-ads`
- **Fields:**
  - `title` - Ad title
  - `sponsorName` - Sponsor name
  - `imageUrl` - Ad image URL
  - `status` - Active/Inactive
  - `startDate` / `endDate` - Display period
  - `displayDuration` - Seconds to show (default: 5)
  - `maxViews` - Total view limit (optional)
  - `maxViewsPerUser` - Per-user limit (optional)
  - `targetCampaigns` - Specific campaigns (empty = all)
  - `targetTournaments` - Specific tournaments (empty = all)
  - `priority` - Display priority (higher = shown first)
  - `clickThroughUrl` - Link when ad is clicked

---

## 🎯 **USE CASES**

### **Use Case 1: Campaign Entry**
```
User → Clicks Campaign → Ad Gate Checks → Shows Ad (if not viewed) → User Views → Proceeds to Campaign
```

### **Use Case 2: Tournament Join (ad_watch)**
```
User → Clicks "Join Tournament" → Ad Gate Shows → User Views Ad → Automatically Joins Tournament
```

### **Use Case 3: Tournament Join (free/paid)**
```
User → Clicks "Join Tournament" → Ad Gate Shows (optional) → User Views/Skips → Joins Tournament
```

---

## ⚙️ **AD DISPLAY SETTINGS**

### **Required vs Optional:**

- **`required={true}`** (Default)
  - User MUST view ad to proceed
  - No skip button
  - Used for `ad_watch` entry method

- **`required={false}`**
  - User can skip ad
  - Shows X button
  - Used for free/paid tournaments

### **Display Duration:**

- **Default:** 5 seconds
- **Configurable:** Set `displayDuration` in ad config
- **Timer:** Countdown from duration to 0
- **Progress Bar:** Visual indicator of time remaining

---

## 🔐 **TRACKING & ANALYTICS**

### **What Gets Tracked:**

1. **Ad View:**
   - User ID
   - Advertisement ID
   - Campaign/Tournament ID
   - View timestamp
   - View duration
   - Device type (mobile/tablet/desktop)
   - Browser info

2. **Ad Click:**
   - Click timestamp
   - Click-through URL
   - Linked to view record

3. **Ad Completion:**
   - `wasCompleted: true`
   - Total view duration
   - Completion timestamp

### **View Limits:**

- **Per-User Limit:** Tracks completed views per user per ad
- **Total Limit:** Tracks `currentViews` count on ad document
- **Automatic Filtering:** Ads exceeding limits won't be selected

---

## 📱 **RESPONSIVE BEHAVIOR**

- **Mobile:** Full-screen overlay, optimized image sizing
- **Tablet:** Full-screen overlay, larger image
- **Desktop:** Full-screen overlay, max-width container

---

## 🚫 **WHEN ADS DON'T SHOW**

Ads **WON'T SHOW** if:

1. ❌ User already viewed an ad for this campaign/tournament
2. ❌ No active ads available
3. ❌ Ad is inactive or expired
4. ❌ Ad exceeded `maxViews` limit
5. ❌ User exceeded `maxViewsPerUser` limit
6. ❌ Ad doesn't target this campaign/tournament
7. ❌ User is not logged in
8. ❌ Error loading ad (fallback: allows entry)

---

## ✅ **SUMMARY**

| Aspect | Details |
|--------|---------|
| **Where** | Campaign pages, Tournament join pages |
| **When** | First time user accesses campaign/tournament |
| **How Many Times** | Once per campaign/tournament per user (unless `maxViewsPerUser` limit) |
| **Duration** | 5 seconds (configurable) |
| **Required** | Yes for campaigns, Yes for `ad_watch` tournaments, Optional for others |
| **Tracking** | Full analytics in Firestore |
| **Limits** | Per-user and total view limits supported |

---

**Status:** ✅ **Fully Implemented and Working**

