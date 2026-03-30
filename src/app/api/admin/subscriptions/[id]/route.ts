import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/server/request-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { SUBSCRIPTION_DURATION_DAYS } from '@/lib/subscription-config';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { id } = await ctx.params;
    const body = await req.json();
    const action = body?.action as 'approve' | 'reject';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const db = getAdminDb();
    const subRef = db.collection('subscriptions').doc(id);
    const snap = await subRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Subscription request not found' }, { status: 404 });
    }
    const data = snap.data() as Record<string, unknown>;
    const userId = String(data.user_id || '');
    if (!userId) {
      return NextResponse.json({ error: 'Invalid subscription record' }, { status: 400 });
    }

    if (action === 'approve') {
      const now = new Date();
      const end = new Date(now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);
      await subRef.update({
        status: 'approved',
        approved_at: FieldValue.serverTimestamp(),
        rejected_at: null,
        admin_notes: notes || null,
        reviewed_by: admin.uid,
        updated_at: FieldValue.serverTimestamp(),
      });
      await db.collection('users').doc(userId).set(
        {
          isSubscribed: true,
          subscriptionStartDate: now,
          subscriptionEndDate: end,
          subscriptionPlan: 'manual_upi_365d',
          paymentId: String(data.utr_number || ''),
          subscriptionStatus: 'active',
          subscriptionAccessState: 'ACTIVE',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      await subRef.update({
        status: 'rejected',
        rejected_at: FieldValue.serverTimestamp(),
        admin_notes: notes || null,
        reviewed_by: admin.uid,
        updated_at: FieldValue.serverTimestamp(),
      });
      await db.collection('users').doc(userId).set(
        {
          isSubscribed: false,
          subscriptionStatus: 'rejected',
          subscriptionAccessState: 'REJECTED',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update subscription';
    const status = message.startsWith('Forbidden') ? 403 : message.startsWith('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
