import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebase-admin';

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function requireUser(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error('Unauthorized: missing token');
  }
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded;
}

export async function requireAdmin(req: NextRequest) {
  const decoded = await requireUser(req);
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@fantasy.com';
  if (decoded.email && decoded.email === superAdminEmail) return decoded;
  const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get();
  if (userDoc.exists && userDoc.data()?.isAdmin === true) return decoded;
  throw new Error('Forbidden: admin access required');
}
