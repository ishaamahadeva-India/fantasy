'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { uploadImage, generateImagePath } from '@/firebase/storage';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import {
  SUBSCRIPTION_BASE_AMOUNT,
  SUBSCRIPTION_GST_PERCENT,
  SUBSCRIPTION_PLAN_NAME,
  SUBSCRIPTION_TOTAL_AMOUNT,
  SUBSCRIPTION_UPI_ID,
  buildUpiDeepLink,
} from '@/lib/subscription-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock3, AlertCircle, QrCode, CreditCard } from 'lucide-react';

type LatestRequest = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string | null;
  screenshot_url?: string | null;
};

export default function SubscriptionPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const profileRef = user && firestore ? doc(firestore, 'users', user.uid) : null;
  const { data: profileData, isLoading: profileLoading } = useDoc(profileRef);
  const profile = profileData as UserProfile | undefined;

  const [latestRequest, setLatestRequest] = useState<LatestRequest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [contact, setContact] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const upiLink = useMemo(() => buildUpiDeepLink({ note: 'QuizzBuzz Subscription 365 days' }), []);

  useEffect(() => {
    if (!user) return;
    user
      .getIdToken()
      .then((token) =>
        fetch('/api/subscription/submit', {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setLatestRequest(data.request || null);
      })
      .catch(() => {});
  }, [user]);

  const isActive = useMemo(() => {
    if (!profile) return false;
    const endRaw = profile.subscriptionEndDate as unknown as Date | { seconds?: number } | undefined;
    const end =
      endRaw instanceof Date ? endRaw : endRaw && typeof endRaw.seconds === 'number' ? new Date(endRaw.seconds * 1000) : null;
    return profile.subscriptionStatus === 'active' && !!end && end.getTime() > Date.now();
  }, [profile]);

  const statusText = isActive
    ? 'Subscription Active'
    : latestRequest?.status === 'pending'
      ? 'Waiting for approval'
      : latestRequest?.status === 'rejected'
        ? 'Payment rejected, try again'
        : 'Not subscribed';

  async function handleSubmit() {
    if (!user) return;
    if (!utrNumber.trim()) {
      toast({ title: 'UTR required', description: 'Enter your UTR number', variant: 'destructive' });
      return;
    }
    if (!contact.trim()) {
      toast({ title: 'Contact required', description: 'Enter email or phone', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (file) {
        screenshotUrl = await uploadImage(file, generateImagePath(file, `subscriptions/${user.uid}`));
      }
      const token = await user.getIdToken();
      const res = await fetch('/api/subscription/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          utrNumber: utrNumber.trim(),
          screenshotUrl: screenshotUrl || undefined,
          name: profile?.displayName || user.displayName || 'User',
          contact: contact.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setLatestRequest({ id: data.id, status: 'pending' });
      setShowForm(false);
      toast({ title: 'Submitted', description: 'Waiting for admin approval' });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Login required</CardTitle>
            <CardDescription>Please login to subscribe and access fantasy games.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl space-y-4 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{SUBSCRIPTION_PLAN_NAME}</CardTitle>
          <CardDescription>Only active subscribers can play fantasy games.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span>Base</span><span>Rs {SUBSCRIPTION_BASE_AMOUNT}</span></div>
          <div className="flex justify-between"><span>GST ({SUBSCRIPTION_GST_PERCENT}%)</span><span>Rs {SUBSCRIPTION_TOTAL_AMOUNT - SUBSCRIPTION_BASE_AMOUNT}</span></div>
          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>Rs {SUBSCRIPTION_TOTAL_AMOUNT}</span></div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">UPI ID</p>
            <p className="font-mono">{SUBSCRIPTION_UPI_ID}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="mb-2 text-xs text-muted-foreground">Status</p>
            <div className="flex items-center gap-2">
              {isActive ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : latestRequest?.status === 'pending' ? <Clock3 className="h-4 w-4 text-amber-600" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
              <span>{statusText}</span>
            </div>
          </div>
        </CardContent>
        {!isActive && (
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => (window.location.href = upiLink)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              I Have Paid
            </Button>
          </CardFooter>
        )}
      </Card>

      {!isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Scan & pay</CardTitle>
            <CardDescription>Pay via any UPI app using this QR.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <img
              src={`/api/subscription/qr?upiId=${encodeURIComponent(SUBSCRIPTION_UPI_ID)}&amount=${SUBSCRIPTION_TOTAL_AMOUNT}&note=${encodeURIComponent('QuizzBuzz Subscription 365 days')}`}
              alt="UPI QR code"
              className="h-56 w-56 rounded border p-2 bg-white"
            />
          </CardContent>
        </Card>
      )}

      {showForm && !isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Submit payment details</CardTitle>
            <CardDescription>UTR must be unique. Screenshot is optional but recommended.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={profile?.displayName || user.displayName || ''} disabled />
            </div>
            <div className="space-y-1">
              <Label>Email / Phone</Label>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={profile?.email || user.email || profile?.phoneNumber || ''} />
            </div>
            <div className="space-y-1">
              <Label>UTR Number</Label>
              <Input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value.toUpperCase())} placeholder="e.g. 412345678901" />
            </div>
            <div className="space-y-1">
              <Label>Screenshot (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full">Cancel</Button>
            <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for approval'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

