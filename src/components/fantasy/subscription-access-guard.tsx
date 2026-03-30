'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SUBSCRIPTION_TOTAL_AMOUNT } from '@/lib/subscription-config';

export function SubscriptionAccessGuard({ children }: { children: ReactNode }) {
  const { user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();

  const profileRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: profileData, isLoading: profileLoading } = useDoc(profileRef);
  const profile = profileData as UserProfile | undefined;

  const requestQuery =
    firestore && user
      ? query(
          collection(firestore, 'subscriptions'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(1)
        )
      : null;
  const { data: requests, isLoading: requestLoading } = useCollection(requestQuery);
  const latestRequest = requests?.[0] as ({ status?: 'pending' | 'approved' | 'rejected' } & {
    id: string;
  }) | null;

  const isActive = useMemo(() => {
    if (!profile) return false;
    const raw = (profile as { subscriptionEndDate?: unknown }).subscriptionEndDate as
      | Date
      | { seconds?: number }
      | undefined;
    const endDate =
      raw instanceof Date ? raw : raw && typeof raw.seconds === 'number' ? new Date(raw.seconds * 1000) : null;
    return profile.subscriptionStatus === 'active' && !!endDate && endDate.getTime() > Date.now();
  }, [profile]);

  const [cookieSynced, setCookieSynced] = useState(false);
  useEffect(() => {
    if (cookieSynced) return;
    const value = isActive ? 'active' : 'inactive';
    document.cookie = `qb_sub_access=${value}; Path=/; Max-Age=86400; SameSite=Lax`;
    setCookieSynced(true);
  }, [isActive, cookieSynced]);

  if (userLoading || profileLoading || requestLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login required</CardTitle>
          <CardDescription>Log in and subscribe to play fantasy games.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isActive) return <>{children}</>;

  const requestStatus = latestRequest?.status ?? profile?.subscriptionAccessState?.toLowerCase();
  let message = `Subscribe for Rs ${SUBSCRIPTION_TOTAL_AMOUNT} to play fantasy games.`;
  if (requestStatus === 'pending') {
    message = 'Waiting for approval. Your payment submission is under review.';
  } else if (requestStatus === 'rejected') {
    message = 'Payment rejected. Please resubmit with a valid UTR.';
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Subscription required</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/subscription">Go to Subscription</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
