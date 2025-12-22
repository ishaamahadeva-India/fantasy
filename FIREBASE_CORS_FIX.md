# Firebase CORS Error Fix Guide

## Problem
You're seeing CORS errors when trying to connect to Firestore:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
```

## Solution Steps

### Step 1: Verify Firestore is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-4972782117-39fa2`
3. Click on **"Firestore Database"** in the left sidebar
4. If you see "Create database" button, click it and:
   - Choose **"Start in production mode"**
   - Select a location (e.g., `us-central1` or `asia-south1`)
   - Click **"Enable"**

### Step 2: Add Authorized Domains

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Authorized domains"** section
3. Click **"Add domain"** and add:
   - `localhost` (for local development)
   - Your production domain (e.g., `yourdomain.com`, `yourdomain.vercel.app`)
   - Any other domains you're using

### Step 3: Check Firestore Rules

1. Go to **Firestore Database** → **Rules** tab
2. For development, you can temporarily use:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Click **"Publish"**

### Step 4: Verify Network Connection

- Check if you're behind a corporate firewall or proxy
- Try accessing from a different network
- Check browser console for any network errors

### Step 5: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

### Step 6: Verify Environment Variables

Make sure your `.env.local` file has the correct Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-4972782117-39fa2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-4972782117-39fa2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-4972782117-39fa2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=601096056382
NEXT_PUBLIC_FIREBASE_APP_ID=1:601096056382:web:05389fdcbcf3ab2e7deb6f
```

### Step 7: Restart Development Server

After making changes:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Common Issues

### Issue: "Database not found"
- **Solution**: Make sure Firestore is enabled (Step 1)

### Issue: Still getting CORS errors after adding domains
- **Solution**: Wait a few minutes for changes to propagate, then clear cache and restart

### Issue: Works in one browser but not another
- **Solution**: Check browser extensions that might block requests (ad blockers, privacy extensions)

### Issue: Works locally but not in production
- **Solution**: Make sure your production domain is added to authorized domains

## Still Having Issues?

1. Check Firebase Console → Project Settings → General → Your apps
2. Verify the web app configuration matches your `.env.local`
3. Check browser Network tab to see the exact error
4. Try using Firebase Emulator Suite for local development

