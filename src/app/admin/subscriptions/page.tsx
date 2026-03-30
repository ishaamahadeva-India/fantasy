'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type AdminSubscription = {
  id: string;
  user_id: string;
  utr_number: string;
  screenshot_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string | null;
  submitted_name?: string;
  submitted_contact?: string;
  admin_notes?: string | null;
};

export default function AdminSubscriptionsPage() {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rows, setRows] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const url =
        statusFilter === 'all'
          ? '/api/admin/subscriptions'
          : `/api/admin/subscriptions?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRows(data.subscriptions || []);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: error instanceof Error ? error.message : 'Could not fetch requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user, statusFilter]);

  async function takeAction(id: string, action: 'approve' | 'reject') {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, notes: notesById[id] || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      toast({ title: 'Updated', description: `Request ${action}d.` });
      await load();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Subscription Requests</h1>
        <p className="text-sm text-muted-foreground">Approve or reject manual UPI subscriptions.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Status based filtering</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests found.</p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="rounded-md border p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{r.submitted_name || 'Unknown User'}</p>
                  <p className="text-xs uppercase tracking-wide">{r.status}</p>
                </div>
                <p className="text-sm">User: <span className="font-mono">{r.user_id}</span></p>
                <p className="text-sm">UTR: <span className="font-mono">{r.utr_number}</span></p>
                <p className="text-sm">Contact: {r.submitted_contact || '-'}</p>
                <p className="text-sm">Created: {r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</p>
                {r.screenshot_url && (
                  <a className="text-sm text-primary underline" href={r.screenshot_url} target="_blank" rel="noreferrer">
                    View screenshot
                  </a>
                )}
                <Input
                  placeholder="Admin notes (optional)"
                  value={notesById[r.id] ?? ''}
                  onChange={(e) => setNotesById((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button onClick={() => takeAction(r.id, 'approve')} className="w-full">Approve</Button>
                    <Button variant="destructive" onClick={() => takeAction(r.id, 'reject')} className="w-full">Reject</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
