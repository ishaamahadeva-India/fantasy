# Video Ad System - MVP Development Plan (Phase-Wise)

## Overview
**Total Duration:** 5-6 weeks (1 developer, full-time)  
**Total Hours:** 180-220 hours  
**Approach:** MVP First - Launch fast, iterate based on feedback

---

## Phase 1: Foundation & Database Setup
**Duration:** Week 1 (Days 1-5)  
**Hours:** 30-35 hours  
**Priority:** Critical

### Day 1-2: Database Schema & Types (12-15 hours)

#### Tasks:
1. **Create TypeScript Types** (3-4 hours)
   - [ ] Create `src/lib/types.ts` additions:
     - `Advertisement` type
     - `AdView` type
     - `AdSponsor` type
     - Enhanced `TournamentEntry` type
   - [ ] Export types properly

2. **Firestore Collections Setup** (4-5 hours)
   - [ ] Create `advertisements` collection structure
   - [ ] Create `ad-views` collection structure
   - [ ] Create `ad-sponsors` collection structure
   - [ ] Update `tournament-entries` schema

3. **Firestore Security Rules** (3-4 hours)
   - [ ] Write rules for `advertisements` (public read, admin write)
   - [ ] Write rules for `ad-views` (users create own, read own)
   - [ ] Write rules for `ad-sponsors` (admin only)
   - [ ] Test rules in Firebase Console

4. **Environment Variables** (1-2 hours)
   - [ ] Add video hosting config (Cloudinary/S3)
   - [ ] Add ad tracking config
   - [ ] Update `.env.local` template

#### Deliverables:
- ✅ All TypeScript types defined
- ✅ Firestore collections ready
- ✅ Security rules deployed and tested
- ✅ Environment variables configured

---

### Day 3-4: Core Firestore Functions (10-12 hours)

#### Tasks:
1. **Create `src/firebase/firestore/advertisements.ts`** (4-5 hours)
   - [ ] `createAdvertisement()` - Create new ad
   - [ ] `updateAdvertisement()` - Update existing ad
   - [ ] `deleteAdvertisement()` - Delete ad
   - [ ] `getAdvertisement()` - Get single ad
   - [ ] `getActiveAds()` - Get active ads (filtered)
   - [ ] `getActiveAdsForTournament()` - Get ads for tournament
   - [ ] Error handling and validation

2. **Create `src/firebase/firestore/ad-views.ts`** (4-5 hours)
   - [ ] `createAdView()` - Create view record
   - [ ] `updateAdViewProgress()` - Update progress
   - [ ] `completeAdView()` - Mark as completed
   - [ ] `trackAdClick()` - Track click-through
   - [ ] `hasUserWatchedAd()` - Check if user watched
   - [ ] `getUserAdViews()` - Get user's views
   - [ ] Error handling

3. **Create `src/firebase/firestore/ad-sponsors.ts`** (2-3 hours)
   - [ ] `createSponsor()` - Create sponsor
   - [ ] `updateSponsor()` - Update sponsor
   - [ ] `getSponsor()` - Get sponsor
   - [ ] `getAllSponsors()` - List sponsors

#### Deliverables:
- ✅ All Firestore functions implemented
- ✅ Functions tested manually
- ✅ Error handling in place

---

### Day 5: Video Hosting Setup (4-5 hours)

#### Tasks:
1. **Choose Video Hosting** (1 hour)
   - [ ] Decide: Cloudinary vs AWS S3 vs Vercel Blob
   - [ ] Set up account

2. **Configure Upload** (2-3 hours)
   - [ ] Set up upload endpoint/API
   - [ ] Configure signed URLs (if needed)
   - [ ] Test video upload
   - [ ] Test video playback

3. **Create Upload Utility** (1 hour)
   - [ ] Create `src/lib/utils/video-upload.ts`
   - [ ] Function to upload video
   - [ ] Function to get video URL

#### Deliverables:
- ✅ Video hosting configured
- ✅ Upload functionality working
- ✅ Video playback tested

---

## Phase 2: Video Player Component
**Duration:** Week 2 (Days 6-10)  
**Hours:** 35-40 hours  
**Priority:** Critical

### Day 6-7: Basic Video Player (12-15 hours)

#### Tasks:
1. **Create Component Structure** (2-3 hours)
   - [ ] Create `src/components/ads/video-ad-player.tsx`
   - [ ] Set up basic component structure
   - [ ] Add props interface
   - [ ] Add state management

2. **Integrate Video Element** (4-5 hours)
   - [ ] Use HTML5 `<video>` or `react-player`
   - [ ] Configure video source
   - [ ] Add basic controls (play, pause, volume)
   - [ ] Handle video loading states
   - [ ] Handle video errors

3. **Basic Styling** (3-4 hours)
   - [ ] Responsive video container
   - [ ] Custom control styling
   - [ ] Loading spinner
   - [ ] Error message display
   - [ ] Mobile-friendly controls

4. **Video Events** (3-4 hours)
   - [ ] `onPlay` handler
   - [ ] `onPause` handler
   - [ ] `onEnded` handler
   - [ ] `onError` handler
   - [ ] `onTimeUpdate` handler

#### Deliverables:
- ✅ Basic video player working
- ✅ Video plays correctly
- ✅ Controls functional
- ✅ Responsive design

---

### Day 8: Progress Tracking (8-10 hours)

#### Tasks:
1. **Time Update Tracking** (3-4 hours)
   - [ ] Track `currentTime` every 1 second
   - [ ] Calculate `watchedDuration`
   - [ ] Calculate `completionPercentage`
   - [ ] Store in component state

2. **Firestore Integration** (3-4 hours)
   - [ ] Call `updateAdViewProgress()` on time update
   - [ ] Debounce updates (every 2-3 seconds)
   - [ ] Handle Firestore errors gracefully
   - [ ] Optimize write operations

3. **Completion Detection** (2-3 hours)
   - [ ] Detect when 80% watched
   - [ ] Call `completeAdView()` automatically
   - [ ] Trigger `onComplete` callback
   - [ ] Show completion message

#### Deliverables:
- ✅ Progress tracked in real-time
- ✅ Completion detected at 80%
- ✅ Data saved to Firestore

---

### Day 9: Click-Through & UI Polish (8-10 hours)

#### Tasks:
1. **Click-Through Button** (3-4 hours)
   - [ ] Add CTA button overlay
   - [ ] Position button (bottom-right or center)
   - [ ] Style button attractively
   - [ ] Handle click event
   - [ ] Call `trackAdClick()`
   - [ ] Open URL in new tab

2. **Skip Prevention** (2-3 hours)
   - [ ] Hide native controls (if needed)
   - [ ] Prevent right-click menu
   - [ ] Disable keyboard shortcuts (space, arrow keys)
   - [ ] Show "Please watch to continue" message

3. **UI Enhancements** (3-4 hours)
   - [ ] Add video thumbnail/preview
   - [ ] Add loading animation
   - [ ] Add progress bar
   - [ ] Add completion animation
   - [ ] Improve mobile experience

#### Deliverables:
- ✅ Click-through button working
- ✅ Skip prevention implemented
- ✅ Polished UI

---

### Day 10: Testing & Refinement (5-6 hours)

#### Tasks:
1. **Cross-Browser Testing** (2-3 hours)
   - [ ] Test on Chrome
   - [ ] Test on Firefox
   - [ ] Test on Safari
   - [ ] Test on mobile browsers
   - [ ] Fix any compatibility issues

2. **Edge Cases** (2-3 hours)
   - [ ] Handle slow network
   - [ ] Handle video load failure
   - [ ] Handle user closing tab
   - [ ] Handle ad blocking
   - [ ] Handle autoplay restrictions

3. **Performance** (1 hour)
   - [ ] Optimize re-renders
   - [ ] Reduce Firestore writes
   - [ ] Test with slow connections

#### Deliverables:
- ✅ Player tested on all browsers
- ✅ Edge cases handled
- ✅ Performance optimized

---

## Phase 3: Ad Gate System
**Duration:** Week 3 (Days 11-15)  
**Hours:** 30-35 hours  
**Priority:** Critical

### Day 11-12: Ad Gate Component (10-12 hours)

#### Tasks:
1. **Create Ad Gate Component** (4-5 hours)
   - [ ] Create `src/components/ads/ad-gate.tsx`
   - [ ] Add props: `tournamentId`, `onComplete`, `required`
   - [ ] Add state: `isLoading`, `ad`, `hasWatched`
   - [ ] Create UI structure

2. **Ad Selection Logic** (4-5 hours)
   - [ ] Create `src/lib/utils/ad-selection.ts`
   - [ ] Function: `selectAdForTournament()`
   - [ ] Get active ads for tournament
   - [ ] Filter by availability
   - [ ] Select highest priority ad
   - [ ] Handle no ads available

3. **Integration** (2-3 hours)
   - [ ] Integrate ad selection in ad gate
   - [ ] Load ad when component mounts
   - [ ] Show loading state
   - [ ] Handle errors

#### Deliverables:
- ✅ Ad gate component created
- ✅ Ad selection working
- ✅ Basic flow functional

---

### Day 13: Tournament Entry Integration (8-10 hours)

#### Tasks:
1. **Update Tournament Entry Flow** (4-5 hours)
   - [ ] Modify `src/app/fantasy/cricket/tournament/[id]/page.tsx`
   - [ ] Add entry method check
   - [ ] Show ad gate if `entryMethod === 'ad_watch'`
   - [ ] Show payment if `entryMethod === 'paid'`
   - [ ] Direct entry if `entryMethod === 'free'`

2. **Entry Method Selection** (2-3 hours)
   - [ ] Add entry method field to tournament schema
   - [ ] Update tournament form
   - [ ] Add dropdown: Free / Paid / Ad Watch
   - [ ] Save entry method

3. **Ad Completion Handler** (2-3 hours)
   - [ ] Create tournament entry after ad completion
   - [ ] Link `adViewId` to entry
   - [ ] Update UI after completion
   - [ ] Redirect to tournament page

#### Deliverables:
- ✅ Tournament entry integrated
- ✅ Ad gate shows when needed
- ✅ Entry created after ad watch

---

### Day 14: User Eligibility & Checks (6-8 hours)

#### Tasks:
1. **Check Existing Views** (3-4 hours)
   - [ ] Check if user already watched ad
   - [ ] Use `hasUserWatchedAd()` function
   - [ ] Skip ad if already watched
   - [ ] Show "Already watched" message

2. **View Limits** (2-3 hours)
   - [ ] Check `maxViewsPerUser` limit
   - [ ] Check `maxViews` total limit
   - [ ] Show appropriate message if limit reached
   - [ ] Fallback to paid entry if needed

3. **Error Handling** (1-2 hours)
   - [ ] Handle no ads available
   - [ ] Handle ad loading errors
   - [ ] Handle completion errors
   - [ ] Show user-friendly messages

#### Deliverables:
- ✅ Eligibility checks working
- ✅ View limits enforced
- ✅ Error handling complete

---

### Day 15: Testing & Refinement (5-6 hours)

#### Tasks:
1. **End-to-End Testing** (3-4 hours)
   - [ ] Test complete flow: Select tournament → Watch ad → Enter
   - [ ] Test already watched scenario
   - [ ] Test no ads scenario
   - [ ] Test error scenarios
   - [ ] Test on mobile

2. **UI/UX Improvements** (2-3 hours)
   - [ ] Improve loading states
   - [ ] Improve error messages
   - [ ] Add success animations
   - [ ] Improve mobile experience

#### Deliverables:
- ✅ Complete flow tested
- ✅ UI polished
- ✅ Ready for Phase 4

---

## Phase 4: Admin Panel
**Duration:** Week 4 (Days 16-20)  
**Hours:** 40-50 hours  
**Priority:** High

### Day 16-17: Ad List & CRUD (12-15 hours)

#### Tasks:
1. **Ad List Page** (5-6 hours)
   - [ ] Create `src/app/admin/ads/page.tsx`
   - [ ] Fetch all advertisements
   - [ ] Display in table/cards
   - [ ] Add filters (status, sponsor)
   - [ ] Add search functionality
   - [ ] Add pagination

2. **Create Ad Form** (4-5 hours)
   - [ ] Create `src/app/admin/ads/new/page.tsx`
   - [ ] Create `src/components/admin/ads/ad-form.tsx`
   - [ ] Form fields: title, description, video URL
   - [ ] Form fields: sponsor, status, dates
   - [ ] Form validation
   - [ ] Submit handler

3. **Edit Ad** (2-3 hours)
   - [ ] Create `src/app/admin/ads/edit/[id]/page.tsx`
   - [ ] Load existing ad data
   - [ ] Pre-fill form
   - [ ] Update handler

4. **Delete Ad** (1 hour)
   - [ ] Add delete button
   - [ ] Confirmation dialog
   - [ ] Delete handler

#### Deliverables:
- ✅ Ad list page working
- ✅ Create ad working
- ✅ Edit ad working
- ✅ Delete ad working

---

### Day 18: Video Upload (8-10 hours)

#### Tasks:
1. **Video Upload Component** (4-5 hours)
   - [ ] Create `src/components/admin/ads/video-upload.tsx`
   - [ ] File input for video
   - [ ] File validation (size, type)
   - [ ] Upload progress indicator
   - [ ] Upload to Cloudinary/S3
   - [ ] Get video URL

2. **Video Preview** (2-3 hours)
   - [ ] Show video preview after upload
   - [ ] Show thumbnail
   - [ ] Show duration
   - [ ] Allow re-upload

3. **Integration** (2-3 hours)
   - [ ] Integrate upload in ad form
   - [ ] Save video URL to ad
   - [ ] Handle upload errors
   - [ ] Show upload status

#### Deliverables:
- ✅ Video upload working
- ✅ Preview functional
- ✅ Integrated with form

---

### Day 19: Sponsor Management (6-8 hours)

#### Tasks:
1. **Sponsor List** (2-3 hours)
   - [ ] Create `src/app/admin/ads/sponsors/page.tsx`
   - [ ] Display sponsors in table
   - [ ] Add create/edit buttons

2. **Sponsor Form** (3-4 hours)
   - [ ] Create sponsor form component
   - [ ] Fields: name, company, logo, contact
   - [ ] Fields: social links
   - [ ] Create/update handlers

3. **Link Ads to Sponsors** (1-2 hours)
   - [ ] Add sponsor dropdown in ad form
   - [ ] Link ad to sponsor
   - [ ] Display sponsor in ad list

#### Deliverables:
- ✅ Sponsor management working
- ✅ Ads linked to sponsors

---

### Day 20: Tournament Ad Assignment (6-8 hours)

#### Tasks:
1. **Update Tournament Form** (3-4 hours)
   - [ ] Add entry method dropdown
   - [ ] Show ad selection if "Ad Watch" selected
   - [ ] Fetch available ads
   - [ ] Allow ad selection
   - [ ] Save to tournament

2. **Display Entry Method** (2-3 hours)
   - [ ] Show entry method on tournament page
   - [ ] Show selected ad (if any)
   - [ ] Update UI based on method

3. **Testing** (1-2 hours)
   - [ ] Test ad assignment
   - [ ] Test tournament creation
   - [ ] Test tournament display

#### Deliverables:
- ✅ Tournament ad assignment working
- ✅ Entry method displayed
- ✅ Ready for Phase 5

---

## Phase 5: Basic Analytics
**Duration:** Week 5 (Days 21-25)  
**Hours:** 25-30 hours  
**Priority:** Medium

### Day 21-22: Analytics Data Aggregation (10-12 hours)

#### Tasks:
1. **Create Analytics Functions** (5-6 hours)
   - [ ] Create `src/lib/utils/ad-analytics.ts`
   - [ ] `getAdViewCount()` - Total views
   - [ ] `getAdCompletionRate()` - Completion %
   - [ ] `getAdClickThroughRate()` - CTR
   - [ ] `getAdViewsByDate()` - Views over time
   - [ ] Aggregate data from ad-views

2. **Real-time Updates** (3-4 hours)
   - [ ] Use Firestore listeners
   - [ ] Update metrics in real-time
   - [ ] Optimize queries
   - [ ] Cache results

3. **Data Formatting** (2-3 hours)
   - [ ] Format dates
   - [ ] Format percentages
   - [ ] Format numbers
   - [ ] Handle null/undefined

#### Deliverables:
- ✅ Analytics functions working
- ✅ Data aggregation complete
- ✅ Real-time updates working

---

### Day 23: Analytics Dashboard UI (8-10 hours)

#### Tasks:
1. **Dashboard Page** (4-5 hours)
   - [ ] Create `src/app/admin/ads/analytics/page.tsx`
   - [ ] Fetch analytics data
   - [ ] Display key metrics
   - [ ] Add date range filter
   - [ ] Add ad selection filter

2. **Metrics Display** (3-4 hours)
   - [ ] Total views card
   - [ ] Completion rate card
   - [ ] Click-through rate card
   - [ ] Revenue card (if applicable)
   - [ ] Format numbers nicely

3. **Basic Charts** (2-3 hours)
   - [ ] Install chart library (recharts/chart.js)
   - [ ] Views over time chart
   - [ ] Completion rate chart
   - [ ] Simple bar/line charts

#### Deliverables:
- ✅ Analytics dashboard created
- ✅ Metrics displayed
- ✅ Basic charts working

---

### Day 24: Ad Performance Comparison (4-5 hours)

#### Tasks:
1. **Compare Ads** (2-3 hours)
   - [ ] Show multiple ads in table
   - [ ] Compare metrics side-by-side
   - [ ] Sort by performance
   - [ ] Highlight top performers

2. **Ad Details View** (2-3 hours)
   - [ ] Click ad to see details
   - [ ] Show detailed metrics
   - [ ] Show view history
   - [ ] Show user demographics (basic)

#### Deliverables:
- ✅ Ad comparison working
- ✅ Ad details view complete

---

### Day 25: Testing & Polish (3-4 hours)

#### Tasks:
1. **Test Analytics** (2-3 hours)
   - [ ] Test with real data
   - [ ] Test date filters
   - [ ] Test ad selection
   - [ ] Verify calculations

2. **UI Polish** (1-2 hours)
   - [ ] Improve layout
   - [ ] Add loading states
   - [ ] Add empty states
   - [ ] Improve mobile view

#### Deliverables:
- ✅ Analytics tested
- ✅ UI polished
- ✅ Ready for Phase 6

---

## Phase 6: Testing & Launch Prep
**Duration:** Week 6 (Days 26-30)  
**Hours:** 20-30 hours  
**Priority:** Critical

### Day 26-27: Comprehensive Testing (10-12 hours)

#### Tasks:
1. **Unit Tests** (4-5 hours)
   - [ ] Test ad selection logic
   - [ ] Test view tracking functions
   - [ ] Test completion verification
   - [ ] Test analytics calculations

2. **Integration Tests** (3-4 hours)
   - [ ] Test ad gate flow
   - [ ] Test tournament entry with ad
   - [ ] Test admin operations
   - [ ] Test analytics data flow

3. **E2E Tests** (3-4 hours)
   - [ ] Complete user journey test
   - [ ] Admin journey test
   - [ ] Error scenario tests
   - [ ] Mobile tests

#### Deliverables:
- ✅ Unit tests written
- ✅ Integration tests complete
- ✅ E2E tests passing

---

### Day 28: Bug Fixes & Edge Cases (6-8 hours)

#### Tasks:
1. **Fix Bugs** (4-5 hours)
   - [ ] Fix issues found in testing
   - [ ] Fix edge cases
   - [ ] Fix performance issues
   - [ ] Fix UI issues

2. **Handle Edge Cases** (2-3 hours)
   - [ ] Handle network failures
   - [ ] Handle video errors
   - [ ] Handle concurrent views
   - [ ] Handle expired ads

#### Deliverables:
- ✅ Bugs fixed
- ✅ Edge cases handled

---

### Day 29: Performance Optimization (4-5 hours)

#### Tasks:
1. **Optimize Queries** (2-3 hours)
   - [ ] Add Firestore indexes
   - [ ] Optimize ad selection query
   - [ ] Optimize analytics queries
   - [ ] Reduce unnecessary reads

2. **Optimize Components** (2-3 hours)
   - [ ] Reduce re-renders
   - [ ] Optimize video loading
   - [ ] Lazy load components
   - [ ] Optimize images

#### Deliverables:
- ✅ Performance optimized
- ✅ Queries optimized

---

### Day 30: Documentation & Launch (4-5 hours)

#### Tasks:
1. **Documentation** (2-3 hours)
   - [ ] Document admin panel usage
   - [ ] Document API functions
   - [ ] Create user guide
   - [ ] Update README

2. **Launch Checklist** (1-2 hours)
   - [ ] Verify all features
   - [ ] Check security rules
   - [ ] Test on production
   - [ ] Prepare launch announcement

3. **Deploy** (1 hour)
   - [ ] Deploy to production
   - [ ] Monitor for errors
   - [ ] Verify functionality

#### Deliverables:
- ✅ Documentation complete
- ✅ System deployed
- ✅ Ready for launch

---

## Daily Schedule Example

### Typical Day (8 hours):
- **Morning (4 hours):** Core development
- **Afternoon (3 hours):** Testing & refinement
- **Evening (1 hour):** Documentation & planning

### Weekly Breakdown:
- **Week 1:** Foundation (30-35 hrs)
- **Week 2:** Video Player (35-40 hrs)
- **Week 3:** Ad Gate (30-35 hrs)
- **Week 4:** Admin Panel (40-50 hrs)
- **Week 5:** Analytics (25-30 hrs)
- **Week 6:** Testing & Launch (20-30 hrs)

**Total:** 180-220 hours over 6 weeks

---

## Milestones & Checkpoints

### Week 1 Milestone:
✅ Database ready, functions working, video hosting configured

### Week 2 Milestone:
✅ Video player working, tracking functional

### Week 3 Milestone:
✅ Ad gate integrated, tournament entry working

### Week 4 Milestone:
✅ Admin panel complete, ads manageable

### Week 5 Milestone:
✅ Analytics dashboard working

### Week 6 Milestone:
✅ System tested, optimized, launched

---

## Risk Mitigation

### Potential Risks:
1. **Video hosting issues** → Use proven service (Cloudinary)
2. **Performance problems** → Optimize early, test with load
3. **Browser compatibility** → Test early, use polyfills
4. **Firestore limits** → Optimize queries, use indexes
5. **Scope creep** → Stick to MVP, defer advanced features

### Contingency:
- Add 10-15% buffer time
- Prioritize critical features
- Defer nice-to-have features

---

## Post-MVP Enhancements (Future Phases)

### Phase 7: Advanced Features (Optional)
- Advanced targeting
- Fraud prevention
- Export reports
- Scheduling
- A/B testing

### Phase 8: Social Follow Integration (Optional)
- Instagram follow verification
- Twitter follow verification
- Combined ad + follow requirements

---

## Success Criteria

### MVP Launch Criteria:
- ✅ Users can watch ads to enter tournaments
- ✅ Admins can create/manage ads
- ✅ Basic analytics available
- ✅ System stable and tested
- ✅ Mobile-friendly

### Post-Launch Metrics:
- Track ad completion rate
- Track user adoption
- Track sponsor satisfaction
- Gather feedback for Phase 7

---

**Document Version:** 1.0  
**Prepared By:** Development Team  
**Status:** Ready for Implementation

