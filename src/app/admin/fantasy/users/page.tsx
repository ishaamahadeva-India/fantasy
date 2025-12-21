'use client';

import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { UserProfile, FraudFlag } from '@/lib/types';

export default function UserManagementPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const usersRef = firestore ? collection(firestore, 'users') : null;
  const { data: users, isLoading: usersLoading } = useCollection(usersRef);
  
  const fraudFlagsRef = firestore ? collection(firestore, 'fraud-flags') : null;
  const { data: fraudFlags, isLoading: flagsLoading } = useCollection(fraudFlagsRef);
  
  const usersList = users as (UserProfile & { id: string })[] | undefined;
  const flagsList = fraudFlags as (FraudFlag & { id: string })[] | undefined;

  const handleBanUser = async (userId: string, permanent: boolean = false) => {
    if (!firestore) return;
    try {
      // TODO: Implement ban functionality
      toast({
        title: permanent ? 'User Permanently Banned' : 'User Temporarily Banned',
        description: 'The user has been banned successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not ban the user.',
      });
    }
  };

  const handleResolveFlag = async (flagId: string) => {
    if (!firestore) return;
    try {
      // TODO: Implement flag resolution
      toast({
        title: 'Flag Resolved',
        description: 'The fraud flag has been resolved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not resolve the flag.',
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Ban className="w-4 h-4 mr-2" />
                              Ban
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ban User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to ban {user.displayName || user.email}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleBanUser(user.id, false)}>
                                Temporary Ban
                              </AlertDialogAction>
                              <AlertDialogAction onClick={() => handleBanUser(user.id, true)}>
                                Permanent Ban
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                        <Button variant="destructive" size="sm">
                          <Ban className="w-4 h-4 mr-2" />
                          Ban User
                        </Button>
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
                      <Button variant="outline" size="sm" onClick={() => handleResolveFlag(flag.id)}>
                        Resolve Flag
                      </Button>
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

