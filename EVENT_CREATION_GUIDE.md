# Event Creation Guide for Movie Campaigns

## Required Fields for Events to Appear in User Panel

When creating events for a multiple movie campaign, ensure these fields are filled:

### ✅ Required Fields (Must Have):
1. **Title** - Event title (e.g., "First Look Views (24h)")
2. **Description** - Event description
3. **Event Type** - Select from dropdown (e.g., "Choice Selection", "Numeric Prediction")
4. **Status** - Must be one of: `upcoming`, `live`, `completed`, or `locked`
5. **Start Date** - When the event starts
6. **End Date** - When the event ends
7. **Points** - Points value (must be at least 1)

### ⚠️ Important Notes:

1. **Status Field**: 
   - Events with status `upcoming` will show in "Upcoming Events" section
   - Events with status `live` will show in "Live Events" section
   - Events with status `completed` will show in "Completed Events" section
   - Events with status `locked` won't be displayed (locked events)

2. **Date Fields**:
   - Both `startDate` and `endDate` are REQUIRED
   - Make sure dates are set correctly
   - Events are categorized by comparing current date with startDate/endDate

3. **Points Field**:
   - Must be a number (at least 1)
   - This is displayed to users

4. **For Multiple Movie Campaigns**:
   - `movieId` field is OPTIONAL
   - Leave blank for campaign-wide events
   - Select a specific movie for movie-specific events

### 🔍 Troubleshooting:

If events are not appearing:

1. **Check Firestore Rules**: 
   - Deploy the updated rules from `FIRESTORE_RULES_FINAL.txt`
   - Make sure `fantasy-campaigns/{campaignId}/events` subcollection has read permissions

2. **Check Browser Console**:
   - Look for "Fetched events:" log
   - Check for any errors
   - Verify event count matches what you created

3. **Verify Event Data**:
   - Check Firestore Console → `fantasy-campaigns` → `{campaignId}` → `events`
   - Verify all required fields are present
   - Check that `status` is not `locked`

4. **Check Dates**:
   - If `startDate` is in the future, event shows as "Upcoming"
   - If `endDate` is in the past, event shows as "Completed"
   - Current date between startDate and endDate = "Live"

5. **Required Fields Checklist**:
   - ✅ title (string, not empty)
   - ✅ description (string, not empty)
   - ✅ eventType (valid enum value)
   - ✅ status (upcoming/live/completed/locked)
   - ✅ startDate (Date object)
   - ✅ endDate (Date object)
   - ✅ points (number >= 1)

### Example Event Data:

```javascript
{
  title: "First Look Views (24h)",
  description: "Predict the total views for the first look",
  eventType: "numeric_prediction",
  status: "upcoming",  // or "live" or "completed"
  startDate: new Date("2024-01-15"),
  endDate: new Date("2024-01-20"),
  points: 50,
  movieId: "",  // Optional - leave blank for campaign-wide
  difficultyLevel: "medium",  // Optional
  options: [],  // Optional - for choice_selection events
  rules: []  // Optional
}
```

