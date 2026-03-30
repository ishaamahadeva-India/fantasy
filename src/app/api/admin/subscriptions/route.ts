import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/server/request-auth';
import { getAdminDb } from '@/lib/server/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const db = getAdminDb();
    const status = req.nextUrl.searchParams.get('status');

    let query = db.collection('subscriptions').orderBy('created_at', 'desc').limit(200);
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = db
        .collection('subscriptions')
        .where('status', '==', status)
        .orderBy('created_at', 'desc')
        .limit(200);
    }
    const snap = await query.get();
    const subscriptions = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created_at:
          data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : null,
        approved_at:
          data.approved_at instanceof Timestamp ? data.approved_at.toDate().toISOString() : null,
        rejected_at:
          data.rejected_at instanceof Timestamp ? data.rejected_at.toDate().toISOString() : null,
      };
    });
    return NextResponse.json({ subscriptions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
    const status = message.startsWith('Forbidden') ? 403 : message.startsWith('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
