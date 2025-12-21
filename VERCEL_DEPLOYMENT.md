# Vercel Deployment Guide

This guide will help you deploy your Fantasy application to Vercel.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub (✅ Already done)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Firebase Project**: Your Firebase project should be set up and configured

---

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `ishaamahadeva-India/fantasy`
4. Vercel will automatically detect it's a Next.js project

---

## Step 2: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (root of the repo)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

---

## Step 3: Add Environment Variables

In the Vercel project settings, add these environment variables:

### Required Firebase Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Where to find these:**
- Go to Firebase Console → Project Settings → General
- Scroll to "Your apps" section
- Click on your web app or create one
- Copy the config values

### Required Application Variables

```
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=your-admin@email.com
```

**Note:** This is the email address that will have super admin access.

### Optional AI/Genkit Variables

```
GEMINI_API_KEY=your-gemini-api-key
```

**Note:** Only needed if you're using AI features (quiz generation, etc.)

### Optional Sentry Variables (for error monitoring)

```
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
```

**Note:** Only needed if you want error monitoring. See `SENTRY_SETUP.md` for details.

---

## Step 4: Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies
   - Run the build
   - Deploy to a preview URL
3. Wait for the build to complete (usually 2-5 minutes)

---

## Step 5: Verify Deployment

1. Once deployed, you'll get a URL like: `https://fantasy-xyz.vercel.app`
2. Test the application:
   - ✅ Homepage loads
   - ✅ Login/Signup works
   - ✅ Firebase connection works
   - ✅ Admin panel accessible (if logged in as super admin)

---

## Step 6: Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

---

## Step 7: Set Up Production Environment

### Production vs Preview Environments

Vercel automatically creates:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from other branches and PRs

### Environment Variables per Environment

You can set different environment variables for:
- **Production**: Production deployments
- **Preview**: Preview deployments
- **Development**: Local development (use `.env.local`)

---

## Troubleshooting

### Build Fails

1. **Check Build Logs**: Click on the failed deployment to see error logs
2. **Common Issues**:
   - Missing environment variables
   - TypeScript errors (should be fixed now)
   - Missing dependencies

### Firebase Connection Issues

1. **Check Firebase Rules**: Ensure Firestore security rules allow your Vercel domain
2. **CORS Issues**: Add your Vercel domain to Firebase authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `your-app.vercel.app`

### PWA Not Working

- PWA is disabled in development mode
- Should work automatically in production
- Service worker files are auto-generated during build

---

## Continuous Deployment

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Every push to other branches → Preview
- ✅ Every Pull Request → Preview with comments

---

## Monitoring

### Vercel Analytics (Optional)

1. Go to **Analytics** tab in Vercel dashboard
2. Enable Vercel Analytics (free tier available)
3. View performance metrics, page views, etc.

### Sentry Integration

If you've set up Sentry:
- Errors will automatically be sent to Sentry
- View errors in your Sentry dashboard
- Get alerts for critical errors

---

## Quick Reference

### Vercel Dashboard
- **URL**: https://vercel.com/dashboard
- **Project Settings**: Settings → General
- **Environment Variables**: Settings → Environment Variables
- **Deployments**: Deployments tab

### Useful Commands

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from local (alternative to GitHub)
vercel

# Deploy to production
vercel --prod
```

---

## Next Steps After Deployment

1. ✅ Test all critical features
2. ✅ Set up monitoring (Sentry)
3. ✅ Configure custom domain (if needed)
4. ✅ Set up Firebase security rules for production
5. ✅ Review and optimize performance
6. ✅ Set up backups (Firestore)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Firebase + Vercel**: https://vercel.com/guides/deploying-nextjs-with-firebase

---

**Your app is now ready for production! 🚀**

