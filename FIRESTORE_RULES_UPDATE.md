# Firestore Security Rules Update - Tournament Events

## Issue
When updating tournaments, you're getting: `FirebaseError: Missing or insufficient permissions`

This happens because the Firestore security rules don't include rules for the `events` subcollection within tournaments.

## Solution

Update your Firestore security rules in Firebase Console to include rules for tournament events and participations subcollections.

### Updated Rules for Cricket Tournaments

Replace the existing `cricket-tournaments` rule block with this:

```javascript
// Cricket Tournaments - authenticated read, admin write
match /cricket-tournaments/{tournamentId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
  
  // Tournament Events subcollection - authenticated read, admin write
  match /events/{eventId} {
    allow read: if isAuthenticated();
    allow write: if isAdmin();
  }
  
  // Tournament Participations subcollection - authenticated read/write
  match /participations/{participationId} {
    allow read: if isAuthenticated();
    allow create: if isAuthenticated();
    allow update: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
  }
}
```

## How to Update

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Find the `cricket-tournaments` rule block (around line 157)
5. Replace it with the updated version above
6. Click **"Publish"** to save the changes

## Why This Is Needed

Firestore security rules are hierarchical. When you have a subcollection like:
- `cricket-tournaments/{tournamentId}/events/{eventId}`

You need explicit rules for that subcollection path. The parent rule (`cricket-tournaments/{tournamentId}`) doesn't automatically apply to subcollections.

## Verification

After updating the rules:
1. Try updating a tournament again
2. The permission error should be resolved
3. You should be able to add, update, and delete tournament events

## Complete Updated Rule Block

Here's the complete rule block you should have (including the helper functions):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.email == 'your-admin-email@example.com';
    }
    
    // ... other collection rules ...
    
    // Cricket Tournaments - authenticated read, admin write
    match /cricket-tournaments/{tournamentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
      
      // Tournament Events subcollection - authenticated read, admin write
      match /events/{eventId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
      
      // Tournament Participations subcollection - authenticated read/write
      match /participations/{participationId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow update: if isAuthenticated() && 
                        resource.data.userId == request.auth.uid;
      }
    }
    
    // ... rest of your rules ...
  }
}
```

**Important:** Don't forget to replace `'your-admin-email@example.com'` with your actual admin email address!

