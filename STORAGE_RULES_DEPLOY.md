# Firebase Storage Rules Deployment Guide

## Problem
You're getting a 403 Forbidden error when uploading images to the `advertisements/` path:
```
Firebase Storage: User does not have permission to access 'advertisements/1766649549149-cf65eosvjbe.png'. (storage/unauthorized)
```

## Solution
I've created `storage.rules` file with proper permissions. You need to deploy it to Firebase.

## Deployment Steps

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init storage
   ```
   - Select your Firebase project
   - Use the existing `storage.rules` file

4. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

### Option 2: Using Firebase Console (Web UI)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-4972782117-39fa2`
3. Navigate to **Storage** → **Rules** tab
4. Copy the contents of `storage.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Rules Explanation

The rules allow:
- ✅ **Public read access** to all files (anyone can view images)
- ✅ **Authenticated users** can upload to:
  - `advertisements/` - For ad images
  - `articles/` - For article images
  - `gossips/` - For gossip images
  - `movies/` - For movie posters
  - `stars/` - For star photos
  - `teams/` - For team logos
  - `cricketers/` - For cricketer photos
  - `sponsors/` - For sponsor logos
  - `campaigns/` - For campaign images
- ✅ **Admin-only** access to other paths

## Verification

After deploying, try uploading an image again. The error should be resolved.

## Troubleshooting

If you still get errors:
1. Make sure you're logged in (authenticated)
2. Check that the rules were deployed successfully
3. Clear browser cache and try again
4. Check Firebase Console → Storage → Rules to verify rules are active

