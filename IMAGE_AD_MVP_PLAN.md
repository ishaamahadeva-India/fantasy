# Image Ad System - MVP Development Plan

## Quick Summary
**Duration:** 3 weeks (15 working days)  
**Hours:** 85-105 hours  
**Approach:** Image ads with timer (simpler than video)

---

## Week 1: Foundation & Components (30-35 hours)

### Day 1-2: Database Setup (10-12 hours)
- [ ] Create simplified Advertisement type (imageUrl instead of videoUrl)
- [ ] Create AdView type (simplified)
- [ ] Set up Firestore collections
- [ ] Write security rules
- [ ] Create basic CRUD functions

### Day 3: Image Upload Setup (6-8 hours)
- [ ] Set up image hosting (Cloudinary/ImgBB)
- [ ] Create image upload utility
- [ ] Test upload/display
- [ ] Configure image optimization

### Day 4-5: Image Ad Component (12-15 hours)
- [ ] Create ImageAdDisplay component
- [ ] Add timer countdown (5 seconds)
- [ ] Add continue button
- [ ] Add click-through on image
- [ ] Mobile optimization
- [ ] Testing

---

## Week 2: Integration & Admin (30-35 hours)

### Day 6-7: Ad Gate Integration (10-12 hours)
- [ ] Create ImageAdGate component
- [ ] Ad selection logic
- [ ] Integrate with tournament entry
- [ ] Handle completion
- [ ] Error handling

### Day 8-9: Admin Panel (12-15 hours)
- [ ] Ad list page
- [ ] Create/edit ad form
- [ ] Image upload in form
- [ ] Sponsor management
- [ ] Tournament ad assignment

### Day 10: Testing (6-8 hours)
- [ ] Test complete flow
- [ ] Fix bugs
- [ ] UI polish

---

## Week 3: Analytics & Launch (25-30 hours)

### Day 11-12: Basic Analytics (10-12 hours)
- [ ] View count tracking
- [ ] Completion rate
- [ ] Click-through rate
- [ ] Simple dashboard

### Day 13-14: Testing & Optimization (10-12 hours)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Mobile testing

### Day 15: Launch (4-6 hours)
- [ ] Documentation
- [ ] Final testing
- [ ] Deploy

---

## Key Differences from Video System

### Simpler Implementation:
1. ✅ No video player needed
2. ✅ No progress tracking (just timer)
3. ✅ No video encoding/processing
4. ✅ Faster loading
5. ✅ Less code

### Faster Timeline:
- **Image Ads:** 3 weeks (85-105 hours)
- **Video Ads:** 5-6 weeks (180-220 hours)
- **Savings:** 2-3 weeks, 95-115 hours

---

## Component Example

### Image Ad Display (Simplified)

```typescript
// Simple timer-based image ad
// Show image for 5 seconds
// Then show continue button
// Track view on continue
```

**Key Features:**
- Full-screen or modal display
- Timer countdown
- Click image to visit sponsor
- Continue button after timer
- Mobile-responsive

---

## Success Criteria

- ✅ Users can view image ads to enter tournaments
- ✅ Timer works correctly (5 seconds)
- ✅ Continue button appears after timer
- ✅ Views tracked accurately
- ✅ Admin can create/manage ads
- ✅ Mobile-friendly
- ✅ Fast loading (<1 second)

---

**Ready to start?** This is much faster and simpler than video ads!

