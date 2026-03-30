# QuizzBuzz Subscription Access (Manual UPI)

## Plan
- Base: Rs 199
- GST: 18%
- Total: Rs 235
- Payment mode: manual UPI

## Data model (`subscriptions` collection)
- `id` (doc id)
- `user_id` (string)
- `utr_number` (string, unique)
- `screenshot_url` (string|null)
- `status` (`pending` | `approved` | `rejected`)
- `created_at` (timestamp)
- `approved_at` (timestamp|null)
- `rejected_at` (timestamp|null)
- `admin_notes` (string|null)
- `submitted_name` (string)
- `submitted_contact` (string)
- `plan_days` (number)

## User states
- `NOT_SUBSCRIBED`
- `PENDING`
- `ACTIVE`
- `REJECTED`

User profile (`users/{uid}`) fields used:
- `subscriptionAccessState`
- `subscriptionStatus`
- `subscriptionStartDate`
- `subscriptionEndDate`
- `subscriptionPlan`
- `isSubscribed`

## APIs (REST)

### User APIs
1. `GET /api/subscription/submit`
   - Auth: Bearer Firebase ID token
   - Returns latest request for current user

2. `POST /api/subscription/submit`
   - Auth: Bearer Firebase ID token
   - Body:
     - `utrNumber` (required)
     - `screenshotUrl` (optional)
     - `name` (required)
     - `contact` (required)
   - Validations:
     - UTR unique
     - user cannot have another pending request

### Admin APIs
3. `GET /api/admin/subscriptions?status=pending|approved|rejected`
   - Auth: Bearer Firebase ID token (admin only)
   - Returns request list

4. `PATCH /api/admin/subscriptions/:id`
   - Auth: Bearer Firebase ID token (admin only)
   - Body:
     - `action`: `approve` | `reject`
     - `notes` (optional)
  - Approve:
    - request status => approved
    - user access => ACTIVE
    - expiry => now + 365 days
   - Reject:
     - request status => rejected
     - user access => REJECTED

## Route protection
- `middleware.ts` checks cookie `qb_sub_access=active` for `/fantasy/*`
- If inactive, redirects to `/subscription`
- `SubscriptionAccessGuard` in fantasy layout enforces access in-app and shows:
  - pending: `Waiting for approval`
  - rejected: `Payment rejected, try again`
  - default: `Subscribe for Rs 235 to play fantasy games`

## Admin UI
- Page: `/admin/subscriptions`
- Features:
  - status filter
  - UTR/details/screenshot view
  - approve/reject + admin notes

## Deploy checklist
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Deploy indexes: `firebase deploy --only firestore:indexes`
3. Deploy storage rules: `firebase deploy --only storage`
4. Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set for server APIs
5. Set `NEXT_PUBLIC_SUBSCRIPTION_UPI_ID` for production UPI ID
