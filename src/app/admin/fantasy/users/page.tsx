'use client';

import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Ban, CheckCircle, AlertTriangle, Shield, UserX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { banUser, unbanUser, resolveFraudFlag } from '@/firebase/firestore/users';
import type { UserProfile, FraudFlag } from '@/lib/types';

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [permanentBan, setPermanentBan] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const usersRef = firestore ? collection(firestore, 'users') : null;
  const { data: users, isLoading: usersLoading } = useCollection(usersRef);
  
  const fraudFlagsRef = firestore ? collection(firestore, 'fraud-flags') : null;
  const { data: fraudFlags, isLoading: flagsLoading } = useCollection(fraudFlagsRef);
  
  const usersList = users as (UserProfile & { id: string })[] | undefined;
  const flagsList = fraudFlags as (FraudFlag & { id: string })[] | undefined;

  const handleBanUser = async () => {
    if (!firestore || !selectedUserId || !banReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a ban reason.',
      });
      return;
    }
    try {
      await banUser(firestore, selectedUserId, banReason, permanentBan);
      toast({
        title: permanentBan ? 'User Permanently Banned' : 'User Temporarily Banned',
        description: 'The user has been banned successfully.',
      });
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUserId(null);
      setPermanentBan(false);
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not ban the user. Please try again.',
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!firestore) return;
    try {
      await unbanUser(firestore, userId);
      toast({
        title: 'User Unbanned',
        description: 'The user has been unbanned successfully.',
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not unban the user. Please try again.',
      });
    }
  };

  const handleResolveFlag = async () => {
    if (!firestore || !selectedFlagId || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unable to resolve flag.',
      });
      return;
    }
    try {
      await resolveFraudFlag(firestore, selectedFlagId, user.uid, resolutionNotes);
      toast({
        title: 'Flag Resolved',
        description: 'The fraud flag has been resolved successfully.',
      });
      setResolveDialogOpen(false);
      setResolutionNotes('');
      setSelectedFlagId(null);
    } catch (error) {
      console.error('Error resolving flag:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not resolve the flag. Please try again.',
      });
    }
  };

  const filteredUsers = usersList?.filter((user) =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suspiciousUsers = usersList?.filter((user) =>
    flagsList?.some((flag) => flag.userId === user.id && !flag.resolved)
  );

  if (usersLoading || flagsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          User Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage users, view participation history, and handle fraud detection.
        </p>
      </div>

      <Tabs defaultValue="all-users" className="w-full">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Users</TabsTrigger>
          <TabsTrigger value="fraud-flags">Fraud Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage all platform users and their accounts.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredUsers?.map((user) => {
                  const userFlags = flagsList?.filter((f) => f.userId === user.id && !f.resolved) || [];
                  const isSuspicious = userFlags.length > 0;
                  
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        isSuspicious ? 'border-destructive/50 bg-destructive/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold">{user.displayName || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{user.points || 0} points</Badge>
                            {isSuspicious && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {userFlags.length} flag{userFlags.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {user.isAdmin && (
                              <Badge variant="default">Admin</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/fantasy/users/${user.id}`}>View Details</a>
                        </Button>
                        {user.isBanned ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Unban
                          </Button>
                        ) : (
                          <Dialog open={banDialogOpen && selectedUserId === user.id} onOpenChange={(open) => {
                            setBanDialogOpen(open);
                            if (!open) {
                              setSelectedUserId(null);
                              setBanReason('');
                              setPermanentBan(false);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setBanDialogOpen(true);
                                }}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Ban
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ban User</DialogTitle>
                                <DialogDescription>
                                  Ban {user.displayName || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label htmlFor="banReason">Ban Reason *</Label>
                                  <Textarea
                                    id="banReason"
                                    placeholder="Enter the reason for banning this user..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <Label htmlFor="permanent">Permanent Ban</Label>
                                    <p className="text-sm text-muted-foreground">
                                      User will be banned indefinitely
                                    </p>
                                  </div>
                                  <Switch
                                    id="permanent"
                                    checked={permanentBan}
                                    onCheckedChange={setPermanentBan}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleBanUser}>
                                  {permanentBan ? 'Permanently Ban' : 'Temporarily Ban'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!filteredUsers || filteredUsers.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Suspicious Users
              </CardTitle>
              <CardDescription>
                Users flagged for suspicious activity or potential fraud.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suspiciousUsers?.map((user) => {
                  const userFlags = flagsList?.filter((f) => f.userId === user.id && !f.resolved) || [];
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5"
                    >
                      <div>
                        <p className="font-semibold">{user.displayName || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userFlags.map((flag) => (
                            <Badge
                              key={flag.id}
                              variant={
                                flag.severity === 'high'
                                  ? 'destructive'
                                  : flag.severity === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {flag.reason.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/fantasy/users/${user.id}`}>View Details</a>
                        </Button>
                        {user.isBanned ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Unban
                          </Button>
                        ) : (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setBanDialogOpen(true);
                            }}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Ban User
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!suspiciousUsers || suspiciousUsers.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No suspicious users found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud-flags" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Flags</CardTitle>
              <CardDescription>
                All fraud detection flags and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {flagsList?.map((flag) => (
                  <div
                    key={flag.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      flag.resolved ? 'opacity-60' : ''
                    }`}
                  >
                    <div>
                      <p className="font-semibold">User: {flag.userId.slice(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        Reason: {flag.reason.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            flag.severity === 'high'
                              ? 'destructive'
                              : flag.severity === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {flag.severity} severity
                        </Badge>
                        {flag.resolved && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      {flag.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{flag.notes}</p>
                      )}
                    </div>
                    {!flag.resolved && (
                      <Dialog open={resolveDialogOpen && selectedFlagId === flag.id} onOpenChange={(open) => {
                        setResolveDialogOpen(open);
                        if (!open) {
                          setSelectedFlagId(null);
                          setResolutionNotes('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedFlagId(flag.id);
                              setResolveDialogOpen(true);
                            }}
                          >
                            Resolve Flag
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Fraud Flag</DialogTitle>
                            <DialogDescription>
                              Mark this fraud flag as resolved.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="resolutionNotes">Resolution Notes (Optional)</Label>
                              <Textarea
                                id="resolutionNotes"
                                placeholder="Add any notes about how this flag was resolved..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleResolveFlag}>
                              Resolve Flag
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ))}
                {(!flagsList || flagsList.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No fraud flags found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

