# Debugging Internal Server Error

## Common Causes:

1. **Firebase Configuration Issues**
   - Check if `.env.local` has all required Firebase variables
   - Verify Firebase project is set up correctly

2. **Server-Side Rendering Errors**
   - Check terminal output for specific error messages
   - Look for stack traces in the dev server logs

3. **Port Conflicts**
   - Make sure port 3000 is not already in use
   - Try a different port: `npm run dev -- -p 3001`

## Steps to Debug:

1. **Check Terminal Output**
   - Look at the terminal where `npm run dev` is running
   - Copy the full error message and stack trace

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Console tab for client-side errors
   - Check Network tab for failed requests

3. **Clear Cache and Restart**
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Check Environment Variables**
   ```bash
   cat .env.local
   ```
   Make sure all Firebase variables are set

5. **Try Different Port**
   ```bash
   npm run dev -- -p 3001
   ```
   Then access http://localhost:3001

## What to Share:

Please share:
- The exact error message from the terminal
- Any stack trace shown
- Browser console errors (if any)
- The URL you're accessing (should be http://localhost:3000, not https)

