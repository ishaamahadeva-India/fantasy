export const SUBSCRIPTION_BASE_AMOUNT = 199;
export const SUBSCRIPTION_GST_PERCENT = 18;
export const SUBSCRIPTION_TOTAL_AMOUNT = 235;
export const SUBSCRIPTION_CURRENCY = 'INR';
export const SUBSCRIPTION_UPI_ID =
  process.env.NEXT_PUBLIC_SUBSCRIPTION_UPI_ID || 'example@upi';
export const SUBSCRIPTION_PLAN_NAME = 'QuizzBuzz Fantasy Access (365 days)';
export const SUBSCRIPTION_DURATION_DAYS = 365;

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionAccessState = 'NOT_SUBSCRIBED' | 'PENDING' | 'ACTIVE' | 'REJECTED';

export function buildUpiDeepLink(params?: { note?: string }) {
  const note = params?.note || 'QuizzBuzz Subscription';
  const query = new URLSearchParams({
    pa: SUBSCRIPTION_UPI_ID,
    pn: 'QuizzBuzz',
    am: String(SUBSCRIPTION_TOTAL_AMOUNT),
    cu: SUBSCRIPTION_CURRENCY,
    tn: note,
  });
  return `upi://pay?${query.toString()}`;
}
