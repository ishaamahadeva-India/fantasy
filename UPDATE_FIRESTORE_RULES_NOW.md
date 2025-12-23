# ⚠️ URGENT: Update Firestore Security Rules

## You're Getting Permission Errors Because Rules Haven't Been Updated

The error `FirebaseError: Missing or insufficient permissions` means your Firestore security rules don't include rules for tournament events subcollection.

## Quick Fix (5 minutes)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project

### Step 2: Navigate to Firestore Rules
1. Click **"Firestore Database"** in the left sidebar
2. Click the **"Rules"** tab at the top

### Step 3: Copy the Complete Rules
Copy **ALL** the content from `FIRESTORE_RULES_COMPLETE.txt` file in your project root, OR copy from below:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    // IMPORTANT: Replace 'your-admin-email@example.com' with your actual admin email
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.email == 'your-admin-email@example.com';
    }
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated();
    }
    
    // Articles - public read, admin write
    match /articles/{articleId} {
      allow read: if true; // Public read
      allow write: if isAdmin();
    }
    
    // Gossips - public read, admin write
    match /gossips/{gossipId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Cricketers - public read, admin write
    match /cricketers/{cricketerId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Teams - public read, admin write
    match /teams/{teamId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Movies - public read, admin write
    match /movies/{movieId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Stars - public read, admin write
    match /stars/{starId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Fantasy Campaigns - authenticated read, admin write
    match /fantasy-campaigns/{campaignId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Fantasy Matches - authenticated read, admin write
    match /fantasy_matches/{matchId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
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
    
    // User Predictions - users can read/write their own
    match /user-predictions/{predictionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
    }
    
    // Tournament Entries - authenticated users can create, read own
    match /tournament-entries/{entryId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
    }
    
    // Tournament Predictions - authenticated users can create, read own
    match /tournament-predictions/{predictionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
    }
    
    // Campaign Entries - authenticated users can create, read own
    match /campaign-entries/{entryId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
    }
    
    // Participations - authenticated users can create, read own
    match /participations/{participationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
    }
    
    // Team Eras - public read, admin write
    match /team-eras/{eraId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Performances - public read, admin write
    match /performances/{performanceId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Star Eras - public read, admin write
    match /star-eras/{eraId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Ratings - authenticated users can read/write
    match /ratings/{ratingId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Advertisements - public read, admin write
    match /advertisements/{adId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Coupons collection
    match /coupons/{couponId} {
      allow read: if request.auth != null;
      allow create, update, delete: if isAdmin();
    }

    // Coupon redemptions collection
    match /coupon-redemptions/{redemptionId} {
      allow read: if isAdmin();
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Replace Your Current Rules
1. **DELETE** all existing rules in the Firebase Console editor
2. **PASTE** the complete rules above
3. **IMPORTANT**: Find line 13 that says `'your-admin-email@example.com'` and replace it with your actual admin email address (the email you use to sign in)

### Step 5: Publish
1. Click the **"Publish"** button at the top
2. Wait for confirmation that rules were published

### Step 6: Test
1. Go back to your application
2. Try updating a tournament again
3. The permission error should be gone!

## What Changed?

The key addition is the **events subcollection** rules inside `cricket-tournaments`:

```javascript
match /cricket-tournaments/{tournamentId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
  
  // ⬇️ THIS IS THE NEW PART YOU NEED ⬇️
  match /events/{eventId} {
    allow read: if isAuthenticated();
    allow write: if isAdmin();
  }
  // ⬆️ END OF NEW PART ⬆️
}
```

Without this, Firestore doesn't know how to handle requests to `cricket-tournaments/{tournamentId}/events/{eventId}`.

## Still Getting Errors?

1. **Check your admin email**: Make sure the email in the `isAdmin()` function matches exactly (case-sensitive)
2. **Sign out and sign back in**: Sometimes you need to refresh your auth token
3. **Check browser console**: Look for more specific error messages
4. **Verify rules were published**: Go back to Rules tab and make sure they're saved

## Need Help?

If you're still having issues:
1. Check that you're signed in with the correct email
2. Verify the rules were published (you should see a timestamp)
3. Try clearing browser cache and signing in again

