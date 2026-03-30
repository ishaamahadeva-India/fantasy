import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { requireUser } from '@/lib/server/request-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { SUBSCRIPTION_DURATION_DAYS } from '@/lib/subscription-config';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const utrNumber = String(body?.utrNumber || '').trim().toUpperCase();
    const screenshotUrl =
      typeof body?.screenshotUrl === 'string' && body.screenshotUrl.length > 0
        ? body.screenshotUrl
        : null;
    const name = String(body?.name || '').trim();
    const contact = String(body?.contact || '').trim();

    if (!utrNumber) {
      return NextResponse.json({ error: 'UTR number is required' }, { status: 400 });
    }
    if (!name || !contact) {
      return NextResponse.json({ error: 'Name and email/phone are required' }, { status: 400 });
    }

    const db = getAdminDb();

    const existingByUtr = await db
      .collection('subscriptions')
      .where('utr_number', '==', utrNumber)
      .limit(1)
      .get();
    if (!existingByUtr.empty) {
      return NextResponse.json({ error: 'This UTR is already submitted' }, { status: 409 });
    }

    const existingPending = await db
      .collection('subscriptions')
      .where('user_id', '==', user.uid)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    if (!existingPending.empty) {
      return NextResponse.json(
        { error: 'You already have a pending request. Wait for admin action.' },
        { status: 409 }
      );
    }

    const createdAt = FieldValue.serverTimestamp();
    const docRef = await db.collection('subscriptions').add({
      user_id: user.uid,
      utr_number: utrNumber,
      screenshot_url: screenshotUrl,
      status: 'pending',
      created_at: createdAt,
      approved_at: null,
      rejected_at: null,
      admin_notes: null,
      plan_days: SUBSCRIPTION_DURATION_DAYS,
      submitted_name: name,
      submitted_contact: contact,
      updated_at: createdAt,
    });

    await db.collection('users').doc(user.uid).set(
      {
        subscriptionAccessState: 'PENDING',
        subscriptionStatus: 'pending',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit subscription';
    const status = message.startsWith('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const db = getAdminDb();
    const snap = await db
      .collection('subscriptions')
      .where('user_id', '==', user.uid)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();
    if (snap.empty) {
      return NextResponse.json({ request: null });
    }
    const d = snap.docs[0];
    const data = d.data();
    return NextResponse.json({
      request: {
        id: d.id,
        ...data,
        created_at:
          data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : null,
        approved_at:
          data.approved_at instanceof Timestamp ? data.approved_at.toDate().toISOString() : null,
        rejected_at:
          data.rejected_at instanceof Timestamp ? data.rejected_at.toDate().toISOString() : null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription request';
    const status = message.startsWith('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
