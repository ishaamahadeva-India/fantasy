# Firestore Rules Update: Event Predictions

## Issue
Users were getting "Missing or insufficient permissions" error when trying to submit predictions for fantasy campaign events.

## Solution
Added Firestore security rules for the `predictions` subcollection under `events` in `fantasy-campaigns`.

## Path Structure
```
fantasy-campaigns/{campaignId}/events/{eventId}/predictions/{predictionId}
```

## Rules Added
```javascript
match /events/{eventId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
  
  // Event Predictions subcollection
  match /predictions/{predictionId} {
    allow read: if isAuthenticated();
    allow create: if isAuthenticated() && 
                   request.resource.data.userId == request.auth.uid;
    allow update: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.userId == request.auth.uid;
    allow delete: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid;
  }
}
```

## Permissions
- **Read**: Any authenticated user can read predictions
- **Create**: Authenticated users can create predictions, but must set `userId` to their own UID
- **Update**: Users can only update their own predictions
- **Delete**: Users can only delete their own predictions

## Deployment
1. Copy the updated rules from `FIRESTORE_RULES_FINAL.txt`
2. Go to Firebase Console → Firestore Database → Rules
3. Paste the updated rules
4. Click "Publish"

## Testing
After deploying, users should be able to:
- Submit predictions for comparison events
- Update their existing predictions
- View their predictions

