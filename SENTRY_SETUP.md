# Sentry Setup Guide

## Sentry DSN Format

The Sentry DSN (Data Source Name) follows this format:

```
https://<key>@<organization>.ingest.sentry.io/<project-id>
```

### Example:
```
https://abc123def456789@o1234567.ingest.sentry.io/1234567
```

### Breakdown:
- **`https://`** - Protocol
- **`abc123def456789`** - Your public key (32+ character alphanumeric string)
- **`@`** - Separator
- **`o1234567`** - Your organization ID (starts with 'o')
- **`.ingest.sentry.io`** - Sentry ingestion endpoint
- **`/1234567`** - Your project ID

## How to Get Your Sentry DSN

1. **Sign up/Login to Sentry:**
   - Go to https://sentry.io
   - Create an account or log in

2. **Create a Project:**
   - Click "Create Project"
   - Select "Next.js" as the platform
   - Give it a name (e.g., "Fantasy App")

3. **Get Your DSN:**
   - After creating the project, you'll see the DSN
   - Or go to: **Settings → Projects → [Your Project] → Client Keys (DSN)**
   - Copy the DSN value

4. **Add to Environment Variables:**
   ```bash
   # In your .env file
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
   ```

## Optional Sentry Configuration

If you want to use Sentry's build-time features, also add:

```bash
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
```

You can find these in:
- **Settings → Organization Settings** (for org slug)
- **Settings → Projects → [Your Project]** (for project slug)

## Testing Sentry

After setting up, you can test if Sentry is working by intentionally throwing an error:

```typescript
// In any component
throw new Error('Test Sentry error');
```

Check your Sentry dashboard to see if the error appears.

## Notes

- The DSN is safe to expose in client-side code (it's public by design)
- Sentry will only send errors if `NEXT_PUBLIC_SENTRY_DSN` is set
- If DSN is not set, Sentry will be disabled and won't affect your app

