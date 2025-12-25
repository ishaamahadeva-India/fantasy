# Firestore Rules Update - Campaign Events Subcollection

## Problem
Events created in multiple movie campaigns are not appearing in the user panel because Firestore security rules don't allow reading from the `events` subcollection.

## Solution
Added rules for the `events` subcollection under `fantasy-campaigns`.

## Updated Rules

Add these rules to your Firestore security rules:

```javascript
// Fantasy Campaigns - authenticated read, admin write
match /fantasy-campaigns/{campaignId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
  
  // Campaign Events subcollection - authenticated read, admin write
  match /events/{eventId} {
    allow read: if isAuthenticated();
    allow write: if isAdmin();
  }
  
  // Campaign Participations subcollection - authenticated read/write
  match /participations/{participationId} {
    allow read: if isAuthenticated();
    allow create: if isAuthenticated();
    allow update: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
  }
}
```

## Deployment Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Find the `fantasy-campaigns` section
5. Add the subcollection rules as shown above
6. Click **Publish**

## What This Fixes

- ✅ Users can now read events from campaign subcollections
- ✅ Events will appear in the user-facing campaign detail page
- ✅ Works for both single and multiple movie campaigns
- ✅ Also added rules for participations subcollection (for future use)

## Verification

After deploying the rules:
1. Create a new multiple movie campaign with events
2. Go to the campaign detail page (`/fantasy/campaign/{campaignId}`)
3. Events should now be visible in the user panel

