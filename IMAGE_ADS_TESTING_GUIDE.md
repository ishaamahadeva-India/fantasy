# Image Ads Feature - End-to-End Testing Guide

## Overview
This guide will help you test the complete Image Ads feature flow from creation to user interaction.

---

## Prerequisites

1. **Firebase Setup**
   - Ensure Firestore is enabled
   - Update Firestore security rules (see `FIRESTORE_RULES_COMPLETE.txt`)
   - Ensure you have admin access

2. **Admin Access**
   - Log in as admin user
   - Navigate to `/admin/image-ads`

---

## Test Flow

### Phase 1: Sponsor Management

#### Step 1.1: Create a Sponsor
1. Navigate to `/admin/image-ads/sponsors`
2. Click "Create Sponsor"
3. Fill in the form:
   - **Contact Name**: John Doe
   - **Company Name**: Test Sponsor Inc.
   - **Contact Email**: sponsor@test.com
   - **Logo**: Upload a logo image
   - **Status**: Active
4. Click "Create Sponsor"
5. ✅ **Expected**: Sponsor appears in the list

#### Step 1.2: Edit Sponsor
1. Click the edit icon on the sponsor
2. Update the company name
3. Click "Update Sponsor"
4. ✅ **Expected**: Changes are saved

#### Step 1.3: Delete Sponsor (Optional)
1. Click the delete icon
2. Confirm deletion
3. ✅ **Expected**: Sponsor is removed

---

### Phase 2: Create Image Advertisement

#### Step 2.1: Create an Ad
1. Navigate to `/admin/image-ads`
2. Click "Create Ad"
3. Fill in the form:
   - **Sponsor**: Select the sponsor created in Step 1.1
   - **Title**: "Test Tournament Ad"
   - **Description**: "Join our tournament!"
   - **Ad Image**: Upload an image (800x600px recommended)
   - **Display Duration**: 5 seconds
   - **Click-Through URL**: https://example.com
   - **Status**: Active
   - **Start Date**: Today
   - **End Date**: 30 days from now
   - **Priority**: 10
4. Click "Create Ad"
5. ✅ **Expected**: Ad appears in the list

#### Step 2.2: Verify Ad Display
1. Check the ad appears in the "Active" tab
2. Verify image thumbnail is visible
3. ✅ **Expected**: Ad is listed and visible

---

### Phase 3: Create Tournament with Ad Watch Entry

#### Step 3.1: Create Tournament
1. Navigate to `/admin/fantasy/tournament/new`
2. Fill in tournament details:
   - **Name**: "Test Tournament with Ad"
   - **Format**: T20
   - **Start Date**: Today
   - **End Date**: 7 days from now
   - **Status**: Live
   - **Teams**: Add at least 2 teams
   - **Entry Type**: Select "Watch Ad to Join"
3. Add at least one event
4. Click "Create Tournament"
5. ✅ **Expected**: Tournament is created

#### Step 3.2: Verify Tournament Entry Method
1. Navigate to `/fantasy/cricket/tournament/[tournament-id]`
2. Check the entry method display
3. ✅ **Expected**: Shows "Watch Ad to Join" instead of "Free Entry"

---

### Phase 4: User Flow - Join Tournament via Ad

#### Step 4.1: User Clicks Join
1. Log in as a regular user (not admin)
2. Navigate to the tournament page
3. Click "Join Tournament"
4. ✅ **Expected**: Ad gate appears (not dialog)

#### Step 4.2: View Ad
1. Ad image should be displayed
2. Timer should countdown from 5 seconds
3. Progress bar should fill up
4. ✅ **Expected**: Timer works correctly

#### Step 4.3: Complete Ad View
1. Wait for timer to complete
2. "Continue to Tournament" button should appear
3. Click "Continue to Tournament"
4. ✅ **Expected**: 
   - Ad closes
   - User is registered for tournament
   - Success toast appears
   - Tournament entry is created

#### Step 4.4: Verify Entry
1. Check tournament page shows "You're Registered!"
2. Check user can see live events
3. ✅ **Expected**: User can participate

---

### Phase 5: Ad Click-Through

#### Step 5.1: Click Ad Image
1. Join tournament again (or use different user)
2. When ad appears, click on the ad image
3. ✅ **Expected**: 
   - Sponsor URL opens in new tab
   - Click is tracked

---

### Phase 6: Analytics Verification

#### Step 6.1: Check Analytics
1. Navigate to `/admin/image-ads/analytics`
2. Check overall statistics:
   - Total Ads
   - Total Views
   - Completion Rate
   - Click-Through Rate
3. ✅ **Expected**: Statistics reflect test data

#### Step 6.2: Check Per-Ad Stats
1. Go to "By Ad" tab
2. Find your test ad
3. Check views, completion rate, CTR
4. ✅ **Expected**: Metrics are accurate

#### Step 6.3: Check Device Breakdown
1. Go to "Device Breakdown" tab
2. Check device distribution
3. ✅ **Expected**: Shows device types

---

### Phase 7: Edge Cases

#### Step 7.1: User Already Viewed Ad
1. User who already joined tries to join again
2. ✅ **Expected**: Direct entry (no ad shown)

#### Step 7.2: No Active Ads
1. Deactivate all ads
2. Try to join tournament
3. ✅ **Expected**: Direct entry (fallback)

#### Step 7.3: Ad Expired
1. Set ad end date to past
2. Try to join tournament
3. ✅ **Expected**: Different ad selected or direct entry

#### Step 7.4: Max Views Reached
1. Set ad maxViews to 1
2. Have 2 users join
3. ✅ **Expected**: First user sees ad, second gets different ad or direct entry

---

## Expected Results Summary

### ✅ Success Criteria

1. **Sponsor Management**
   - ✅ Can create, edit, delete sponsors
   - ✅ Sponsor data persists correctly

2. **Ad Management**
   - ✅ Can create, edit, delete ads
   - ✅ Ad images upload correctly
   - ✅ Ads appear in active list when scheduled

3. **Tournament Integration**
   - ✅ Tournament can be set to "ad_watch" entry method
   - ✅ Entry method displays correctly

4. **User Experience**
   - ✅ Ad displays correctly with timer
   - ✅ Timer counts down properly
   - ✅ Continue button appears after timer
   - ✅ User can join tournament after viewing ad
   - ✅ Ad click-through works

5. **Tracking**
   - ✅ Ad views are tracked
   - ✅ Completion is tracked
   - ✅ Clicks are tracked
   - ✅ Analytics display correctly

6. **Security**
   - ✅ Only admins can create/edit ads
   - ✅ Users can only create their own ad views
   - ✅ Firestore rules work correctly

---

## Troubleshooting

### Issue: Ad not showing
- **Check**: Ad status is "active"
- **Check**: Ad dates are valid (start <= now <= end)
- **Check**: Ad has valid image URL
- **Check**: Tournament entryMethod is "ad_watch"

### Issue: Timer not working
- **Check**: Browser console for errors
- **Check**: Component is mounted correctly
- **Check**: displayDuration is set correctly

### Issue: Analytics not updating
- **Check**: Ad views are being created in Firestore
- **Check**: Analytics query is correct
- **Check**: Date filters are correct

### Issue: User can't join after viewing ad
- **Check**: Tournament entry is being created
- **Check**: Firestore permissions
- **Check**: User is authenticated

---

## Test Checklist

- [ ] Sponsor CRUD operations work
- [ ] Ad CRUD operations work
- [ ] Tournament can be set to ad_watch
- [ ] Ad displays correctly
- [ ] Timer works
- [ ] Continue button appears
- [ ] User can join tournament
- [ ] Ad views are tracked
- [ ] Analytics display correctly
- [ ] Click-through works
- [ ] Already-viewed users skip ad
- [ ] Edge cases handled correctly
- [ ] Mobile responsive
- [ ] Firestore rules work

---

## Next Steps After Testing

1. **If all tests pass**: Feature is ready for production
2. **If issues found**: Document and fix
3. **Performance**: Monitor ad load times
4. **Analytics**: Track completion rates over time

---

**Last Updated**: Today  
**Status**: Ready for Testing

