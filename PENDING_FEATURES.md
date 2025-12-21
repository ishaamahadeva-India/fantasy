# Pending Features & Incomplete Items

## Admin Panel - Pending Items

### 1. Fantasy Analytics (`/admin/fantasy/analytics`)
- **Total Participants**: Currently placeholder (0) - needs to query `participations` collection
- **Total Revenue**: Currently placeholder (0) - needs to query `campaign-entries` collection and sum entry fees
- **Action Required**: Implement aggregation queries to calculate real metrics

### 2. Tournament Leaderboard (`/admin/fantasy/tournament/[id]/leaderboard`)
- **Group-wise Leaderboard**: Tab shows "coming soon" - needs implementation
- **Player Prediction Leaderboard**: Tab shows "coming soon" - needs implementation
- **Action Required**: 
  - Filter participations by group for group-wise
  - Filter participations by player prediction events for player predictions

### 3. Campaign Leaderboard (`/admin/fantasy/campaign/[id]/leaderboard`)
- **City/State Leaderboard**: Tab shows "coming soon" - needs implementation
- **Action Required**: Group participations by user's city/state from user profile

### 4. User Management (`/admin/fantasy/users`)
- **Ban Functionality**: TODO comment - needs implementation
  - Should update user profile with `isBanned`, `banReason`, `banExpiresAt`
  - Should prevent banned users from participating
- **Flag Resolution**: TODO comment - needs implementation
  - Should mark fraud flags as resolved
  - Should update flag status in Firestore
- **Action Required**: Implement Firestore update functions for ban and flag resolution

### 5. Result Verification Pages
- All result pages have placeholder inputs - these are functional but could be enhanced with:
  - Better validation
  - Bulk result entry
  - Result templates for common outcomes

---

## User Panel - Pending Items

### 1. Cricket Fan Zone (`/fan-zone/cricket`)
- **Trending Tab**: Shows "Trending content coming soon"
- **Action Required**: 
  - Query cricketers with `trendingRank > 0`
  - Order by trendingRank
  - Display top trending cricketers

### 2. National Team Profile (`/fan-zone/cricket/national-team/[id]`)
- **Era Selector**: Uses placeholder data (hardcoded eras)
- **Action Required**: 
  - Create `team-eras` collection in Firestore
  - Store era data (winRate, iccTrophies, keyPlayers, definingMoment)
  - Fetch and display real era data

### 3. Performances Tab (`/fan-zone/movies/performances`)
- **Component Note**: Uses placeholder data for performances
- **Action Required**: 
  - Create `performances` collection in Firestore
  - Link performances to stars and movies
  - Fetch and display real performance data

### 4. Star Profile Page (`/fan-zone/star/[id]`)
- **Compare Eras Button**: Currently disabled
- **Action Required**: Implement era comparison feature (similar to team eras)

---

## Data Structure Gaps

### Missing Collections:
1. **team-eras**: For storing historical team performance by era
2. **performances**: For storing star performances in movies
3. **fraud-flags**: May exist but needs verification
4. **participations**: Exists but needs aggregation queries
5. **campaign-entries**: Exists but needs revenue calculation

### Missing Fields:
1. **User Profile**: 
   - `favorites` object structure is defined but may need verification
   - City/State data may be missing for some users

---

## Priority Recommendations

### High Priority:
1. ✅ **Fantasy Analytics** - Real participant and revenue data
2. ✅ **User Ban Functionality** - Critical for moderation
3. ✅ **Trending Content** - User engagement feature

### Medium Priority:
4. ✅ **Group-wise Leaderboard** - Tournament feature
5. ✅ **City/State Leaderboard** - Engagement feature
6. ✅ **Player Prediction Leaderboard** - Tournament feature

### Low Priority:
7. ✅ **Team Eras** - Nice-to-have historical data
8. ✅ **Performances** - Nice-to-have feature
9. ✅ **Compare Eras** - Advanced feature

---

## Notes
- All placeholder text in forms is intentional (UI guidance)
- All "coming soon" messages indicate incomplete features
- TODO comments indicate unimplemented functionality
- Placeholder data indicates missing database structure

