# Image Advertisement Display Guide

## Where Image Ads Are Displayed

Image advertisements are displayed **when users try to enter cricket tournaments**. The ad appears as a **full-screen modal** that users must view before they can join the tournament.

### Display Location

**Cricket Tournament Entry Flow:**
- When a user clicks "Join Tournament" or "Enter Tournament" on a cricket tournament page
- The `ImageAdGate` component checks if an ad should be shown
- If an ad is available, it displays as a full-screen modal
- User must view the ad for the specified duration (default: 5 seconds)
- After viewing, user can click "Continue to Tournament" to proceed

### Current Implementation

**File:** `src/app/fantasy/cricket/tournament/[id]/page.tsx`
- Uses `<ImageAdGate>` component
- Shows ads before tournament entry
- Currently implemented for **cricket tournaments only**

---

## Tournament Targeting

### How It Works

Image ads can be targeted to **specific tournaments** using the `targetTournaments` field:

1. **All Tournaments (Default):**
   - Leave `targetTournaments` field **empty**
   - Ad will be shown for **all cricket tournaments**

2. **Specific Tournaments:**
   - Enter tournament IDs separated by commas
   - Example: `tournament-id-1, tournament-id-2, tournament-id-3`
   - Ad will **only** be shown for those specific tournaments

### How to Set Target Tournaments

1. **In the Image Ad Form:**
   - Find the "Target Tournaments (optional)" field
   - Enter tournament IDs separated by commas
   - Example: `abc123, def456, ghi789`
   - Leave empty to show for all tournaments

2. **How to Find Tournament IDs:**
   - Go to the tournament page URL
   - The ID is in the URL: `/fantasy/cricket/tournament/[ID]`
   - Copy the ID from the URL

---

## Ad Display Logic

### When Ads Are Shown

1. **User tries to enter a tournament**
2. **System checks:**
   - Is there an active ad?
   - Is the ad within date range (startDate to endDate)?
   - Is the ad status "active"?
   - Does the ad target this tournament? (or targets all if empty)
   - Has the user already viewed an ad for this tournament?
   - Has the ad reached max views? (if set)
   - Has the user reached max views per user? (if set)

3. **If all conditions pass:**
   - Full-screen ad modal appears
   - User must view for `displayDuration` seconds (default: 5 seconds)
   - Timer counts down
   - User clicks "Continue to Tournament" after timer completes

### Ad Display Features

- **Full-screen modal** (black overlay background)
- **Timer countdown** (shows remaining seconds)
- **Progress bar** (visual indicator)
- **Clickable image** (opens sponsor website if `clickThroughUrl` is set)
- **"Visit Sponsor" button** (if click-through URL is set)
- **Cannot skip** until timer completes (if `required=true`)
- **Sponsored by [Sponsor Name]** text

---

## Current Limitations

### ✅ Currently Implemented
- **Cricket tournaments only** - Ads show when entering cricket tournaments
- **Tournament targeting** - Can target specific tournaments or all tournaments
- **View tracking** - Tracks ad views and user views
- **View limits** - Max views per ad and per user

### ❌ Not Yet Implemented
- **Movie fantasy campaigns** - Ads don't show for movie campaigns yet
- **Other fantasy types** - Only cricket tournaments have ad gates
- **Multiple ad display** - Only one ad per tournament entry

---

## How to Add Ads to Other Fantasy Types

To add image ads to movie fantasy campaigns or other fantasy types:

1. **Add ImageAdGate component** to the entry page:
   ```tsx
   import { ImageAdGate } from '@/components/ads/image-ad-gate';
   
   // In the component
   <ImageAdGate
     tournamentId={campaignId} // or eventId
     onComplete={() => {
       // Allow entry after ad is viewed
     }}
     required={true}
   />
   ```

2. **Update the ad selection logic** in `selectAdForEntry`:
   - Currently filters by `tournamentId`
   - May need to support `campaignId` or `eventId` for movie campaigns

3. **Add campaign/event targeting**:
   - Extend `targetTournaments` to support `targetCampaigns` or `targetEvents`
   - Or use a generic `targetIds` field

---

## Example: Targeting Specific Tournaments

### Scenario: Show ad only for IPL 2024 and World Cup 2024

1. **Get Tournament IDs:**
   - Go to each tournament page
   - Copy the ID from URL: `/fantasy/cricket/tournament/[ID]`
   - Example IDs: `ipl-2024-id`, `world-cup-2024-id`

2. **Create/Edit Ad:**
   - Go to `/admin/image-ads`
   - Create new ad or edit existing
   - In "Target Tournaments" field, enter:
     ```
     ipl-2024-id, world-cup-2024-id
     ```
   - Save the ad

3. **Result:**
   - Ad will **only** show for IPL 2024 and World Cup 2024
   - Ad will **not** show for other tournaments

---

## Example: Show Ad for All Tournaments

1. **Create/Edit Ad:**
   - Go to `/admin/image-ads`
   - Create new ad or edit existing
   - **Leave "Target Tournaments" field empty**
   - Save the ad

2. **Result:**
   - Ad will show for **all cricket tournaments**
   - Any user entering any tournament will see this ad

---

## Ad Display Priority

If multiple ads are available for a tournament:

1. **Priority field** determines order (higher = shown first)
2. **View limits** are checked (maxViews, maxViewsPerUser)
3. **Date range** must be valid (startDate to endDate)
4. **Status** must be "active"

The ad with the **highest priority** that meets all conditions will be shown.

---

## Testing

### To Test Ad Display:

1. **Create a test tournament:**
   - Go to `/admin/fantasy/cricket/tournament/new`
   - Create a test tournament
   - Note the tournament ID from the URL

2. **Create a test ad:**
   - Go to `/admin/image-ads`
   - Create new ad
   - Set status to "active"
   - Set startDate to today
   - Set endDate to future date
   - Enter tournament ID in "Target Tournaments" (or leave empty for all)
   - Upload an image
   - Save

3. **Test as user:**
   - Go to the tournament page
   - Click "Join Tournament" or "Enter Tournament"
   - Ad should appear as full-screen modal
   - Wait for timer to complete
   - Click "Continue to Tournament"

---

## Summary

- **Where:** Cricket tournament entry pages (full-screen modal)
- **When:** Before users can join tournaments
- **Targeting:** Use "Target Tournaments" field (empty = all tournaments)
- **Duration:** Set in "Display Duration" field (default: 5 seconds)
- **Priority:** Higher priority ads shown first
- **Limits:** Max views per ad and per user can be set

