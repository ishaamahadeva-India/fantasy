# Vercel Environment Variables Setup Guide

This document lists **all environment variables** that need to be set in your Vercel project for production deployment.

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable below with its value
4. Select the appropriate **Environment** (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

---

## Required Environment Variables

### 🔥 Firebase Configuration (REQUIRED)

These are **essential** for your application to work. Get these from [Firebase Console](https://console.firebase.google.com/).

```
NEXT_PUBLIC_FIREBASE_API_KEY
```
**Value:** Your Firebase API Key  
**Example:** `AIzaSyCjMSpm8FbBxUZ9ZRjt_7nDbAHlnw8g0QI`  
**Where to find:** Firebase Console → Project Settings → General → Your apps → Web app config

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
**Value:** Your Firebase Auth Domain  
**Example:** `studio-4972782117-39fa2.firebaseapp.com`  
**Where to find:** Firebase Console → Project Settings → General → Your apps → Web app config

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
**Value:** Your Firebase Project ID  
**Example:** `studio-4972782117-39fa2`  
**Where to find:** Firebase Console → Project Settings → General → Your apps → Web app config

```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
**Value:** Your Firebase Storage Bucket  
**Example:** `studio-4972782117-39fa2.firebasestorage.app`  
**Where to find:** Firebase Console → Project Settings → General → Your apps → Web app config

```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
**Value:** Your Firebase Messaging Sender ID  
**Example:** `601096056382`  
**Where to find:** Firebase Console → Project Settings → General → Your apps → Web app config

```
NEXT_PUBLIC_FIREBASE_APP_ID
```
**Value:** Your Firebase App ID  
**Example:** `1:601096056382:web:05389fdcbcf3ab2e7deb6f`  
**Where to find:** Firebase Console → Project Settings → General → Your apps → Web app config

---

### 👤 Admin Configuration (REQUIRED)

```
NEXT_PUBLIC_SUPER_ADMIN_EMAIL
```
**Value:** Email address of the super admin user  
**Example:** `admin@yourdomain.com`  
**Description:** This email will have full admin access to the application. Must match the email used to sign in.

---

## Optional Environment Variables

### 🐛 Sentry Error Monitoring (OPTIONAL)

```
NEXT_PUBLIC_SENTRY_DSN
```
**Value:** Your Sentry DSN URL  
**Example:** `https://abc123@o123456.ingest.sentry.io/789012`  
**Where to find:** [Sentry Dashboard](https://sentry.io/settings/) → Your Project → Client Keys (DSN)  
**Description:** Leave empty if you don't want error monitoring. See `SENTRY_SETUP.md` for details.

---

### 🤖 AI/Genkit Configuration (OPTIONAL)

```
GEMINI_API_KEY
```
**Value:** Your Google Gemini API Key  
**Example:** `AIzaSy...`  
**Where to find:** [Google AI Studio](https://makersuite.google.com/app/apikey)  
**Description:** Required only if you're using AI features (quizzes, article summaries, etc.). Leave empty if not using AI features.

---

## Complete List for Copy-Paste

Here's the complete list of all environment variables. Copy this and fill in your values:

```bash
# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Configuration (REQUIRED)
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=your-admin-email@example.com

# Sentry (OPTIONAL - leave empty if not using)
NEXT_PUBLIC_SENTRY_DSN=

# AI/Genkit (OPTIONAL - leave empty if not using)
GEMINI_API_KEY=
```

---

## Step-by-Step Vercel Setup

### Step 1: Access Environment Variables
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Variables
For each variable above:
1. Click **Add New**
2. Enter the **Key** (variable name)
3. Enter the **Value** (your actual value)
4. Select **Environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### Step 3: Verify
After adding all variables:
1. Scroll down to see all your variables listed
2. Make sure all required variables are present
3. Check that values are correct (they'll be masked for security)

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

---

## Environment-Specific Variables

You can set different values for different environments:

- **Production:** Used for your live site (yourdomain.com)
- **Preview:** Used for preview deployments (pull requests, branches)
- **Development:** Used for local development (when running `vercel dev`)

**Recommendation:** Set all variables for all three environments unless you have a specific reason not to.

---

## Security Best Practices

1. ✅ **Never commit** `.env.local` to Git (it's already in `.gitignore`)
2. ✅ **Never share** your API keys publicly
3. ✅ **Rotate keys** if they're accidentally exposed
4. ✅ **Use different keys** for development and production if possible
5. ✅ **Review access** regularly in Firebase Console

---

## Troubleshooting

### Issue: "Firebase not initialized"
**Solution:** 
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Verify values are correct (no extra spaces)
- Redeploy after adding variables

### Issue: "Permission denied" errors
**Solution:**
- Check that `NEXT_PUBLIC_SUPER_ADMIN_EMAIL` matches your sign-in email
- Verify Firestore security rules are set correctly
- Make sure you're authenticated

### Issue: Variables not updating
**Solution:**
- Variables are only loaded at build time
- You must **redeploy** after adding/changing variables
- Clear Vercel cache if needed

### Issue: Can't find Firebase config
**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll to **"Your apps"** section
5. If no web app exists, click **"Add app"** → Web icon `</>`
6. Copy the config values

---

## Quick Checklist

Before deploying to production, ensure:

- [ ] All 6 Firebase variables are set
- [ ] `NEXT_PUBLIC_SUPER_ADMIN_EMAIL` is set to your admin email
- [ ] All variables are set for Production environment
- [ ] Values are correct (no typos, no extra spaces)
- [ ] Application has been redeployed after adding variables
- [ ] Tested the application after deployment

---

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs for errors
2. Verify all required variables are set
3. Check Firebase Console to ensure project is active
4. Review browser console for client-side errors

