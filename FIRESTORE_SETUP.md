# Firestore Database Setup Guide

## Overview
Yes, you **absolutely need to set up Firestore database** for this application to work. The application uses Firebase Firestore as its primary database for storing all data.

## Prerequisites
1. A Firebase account (free tier is sufficient for development)
2. A Firebase project created
3. Firestore Database enabled in your Firebase project

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name
   - Enable/disable Google Analytics (optional)
   - Create project

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set up security rules later)
4. Select a location (choose closest to your users, e.g., `us-central1`, `asia-south1` for India)
5. Click **"Enable"**

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register your app (give it a nickname)
5. Copy the Firebase configuration object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Set Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist):

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Super Admin Email (for admin access)
SUPER_ADMIN_EMAIL=your-admin-email@example.com
```

**Important:** Replace all values with your actual Firebase configuration values.

## Step 5: Update Firebase Config File

The application uses `src/firebase/sdk-config.ts`. Make sure it reads from environment variables:

```typescript
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

## Step 6: Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** tab in Firebase Console and add:

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
    }
    
    // User Predictions - users can read/write their own
    match /user-predictions/{predictionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      resource.data.userId == request.auth.uid;
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
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Important:** Replace `'your-admin-email@example.com'` with your actual admin email address.

## Step 7: Enable Authentication (Required)

1. Go to **Authentication** in Firebase Console
2. Click **"Get started"**
3. Enable **Email/Password** provider
4. Optionally enable **Google** sign-in provider

## Step 8: Required Firestore Collections

The application uses these collections (they will be created automatically when you add data):

### Content Management
- `articles` - News articles
- `gossips` - Gossip items

### Fan Zone
- `cricketers` - Cricketer profiles
- `teams` - Cricket teams (IP and National)
- `movies` - Movie information
- `stars` - Star/actor profiles
- `team-eras` - Team era data
- `performances` - Star performance data
- `star-eras` - Star era data

### Fantasy Games
- `fantasy-campaigns` - Movie fantasy campaigns
- `fantasy_matches` - Live cricket matches
- `cricket-tournaments` - Cricket tournaments
- `user-predictions` - User predictions
- `tournament-entries` - Tournament participation
- `tournament-predictions` - Tournament predictions
- `campaign-entries` - Campaign participation
- `participations` - User participation tracking

### User Data
- `users` - User profiles
- `ratings` - Fan ratings and reviews

### Other
- `advertisements` - Advertisement management

## Step 9: Verify Setup

1. **Check Environment Variables:**
   ```bash
   # In your project root
   cat .env.local
   ```
   Make sure all Firebase config values are set.

2. **Test Firestore Connection:**
   - Start your development server: `npm run dev`
   - Try to access the admin panel
   - Check browser console for any Firebase errors

3. **Test CSV Upload:**
   - Go to Admin Panel → Content Management
   - Try uploading a CSV file
   - Check Firestore Console to see if data appears

## Step 10: Common Issues & Solutions

### Issue: "Permission denied" errors
**Solution:** Check your Firestore security rules. Make sure:
- Your email is set as admin in the rules
- You're signed in with the correct account
- Rules are published (click "Publish" in Firebase Console)

### Issue: "Firestore not initialized"
**Solution:** 
- Check that all environment variables are set correctly
- Make sure `.env.local` file exists in project root
- Restart your development server after adding env variables

### Issue: CSV upload not working
**Solution:**
- Check browser console for errors
- Verify Firestore security rules allow writes
- Make sure you're signed in as admin
- Check network tab for failed requests

### Issue: Collections not appearing
**Solution:** 
- Collections are created automatically when you add the first document
- No need to manually create collections
- Just start using the app and collections will be created

## Production Setup

For production deployment (Vercel):

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all the same environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `SUPER_ADMIN_EMAIL`

4. Redeploy your application

## Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Check Firebase Console → Firestore → Data to see if collections exist
3. Verify your security rules are published
4. Make sure you're authenticated with the correct account

## Quick Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Firebase configuration copied
- [ ] Environment variables set in `.env.local`
- [ ] Security rules configured and published
- [ ] Authentication enabled
- [ ] Tested connection by accessing admin panel
- [ ] Tested CSV upload functionality

