# Debugging 500 Internal Server Error

## Is this a Vercel issue?

**It could be either local or Vercel.** The 500 error means the server is crashing. Here's how to debug:

## For Local Development (localhost:3000):

### Step 1: Check Terminal Output
Look at the terminal where `npm run dev` is running. You should see the exact error message there.

### Step 2: Common Local Issues:

1. **Firebase Not Initialized**
   - Check if Firestore is enabled in Firebase Console
   - Verify `.env.local` has all Firebase variables

2. **Port Conflict**
   - Try: `npm run dev -- -p 3001`
   - Access: `http://localhost:3001`

3. **Cache Issues**
   ```bash
   rm -rf .next
   npm run dev
   ```

## For Vercel Deployment:

### Step 1: Check Vercel Logs
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Click "View Function Logs" or check the "Runtime Logs"

### Step 2: Check Environment Variables
1. Go to Vercel Project Settings
2. Click "Environment Variables"
3. Verify all these are set:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_SUPER_ADMIN_EMAIL`

### Step 3: Common Vercel Issues:

1. **Missing Environment Variables**
   - All `NEXT_PUBLIC_*` variables must be set in Vercel
   - Redeploy after adding variables

2. **Build Errors**
   - Check the build logs in Vercel
   - Look for TypeScript or build errors

3. **Runtime Errors**
   - Check function logs for runtime errors
   - Look for Firebase initialization errors

4. **Firestore Not Enabled**
   - Make sure Firestore is enabled in Firebase Console
   - Check Firestore security rules

## Quick Fixes to Try:

### 1. Clear Cache and Rebuild
```bash
rm -rf .next
npm run build
```

### 2. Check for Server Component Errors
The async server components (quiz pages) might be failing. Check:
- `src/app/quiz/daily-news/page.tsx`
- `src/app/soundstrike/page.tsx`

### 3. Verify Firebase Setup
- Firestore must be enabled
- Authorized domains must include your Vercel domain
- Security rules must allow reads

### 4. Check Browser Console
- Open DevTools (F12)
- Check Console for client-side errors
- Check Network tab for failed requests

## What to Share:

Please share:
1. **The exact error message** from terminal (local) or Vercel logs (deployment)
2. **The full stack trace** if available
3. **Which URL** triggers the error (home page, specific route, etc.)
4. **Whether it's local or Vercel**

This will help identify the exact cause.

