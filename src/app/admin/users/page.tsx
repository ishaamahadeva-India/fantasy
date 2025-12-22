
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Award } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { updateUserAdminStatus } from '@/firebase/firestore/users';

function UserRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className='flex items-center gap-4'>
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className='space-y-1'>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        </TableRow>
    )
}

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const usersQuery = firestore ? collection(firestore, 'users') : null;
  const { data: users, isLoading } = useCollection(usersQuery);

  const handleAdminToggle = async (userId: string, currentStatus: boolean) => {
    if (!firestore || !currentUser) return;

    if (userId === currentUser.uid) {
        toast({
            variant: 'destructive',
            title: 'Action Forbidden',
            description: "You cannot change your own admin status.",
        });
        return;
    }

    try {
        await updateUserAdminStatus(firestore, userId, !currentStatus);
        toast({
            title: 'User Updated',
            description: `The user has been ${!currentStatus ? 'granted' : 'revoked'} admin privileges.`,
        });
    } catch (error) {
        console.error('Error updating user admin status:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update the user\'s admin status.',
        });
    }
  };


  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            User Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all users in your application.
          </p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all registered users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>quizzbuzz Points</TableHead>
                <TableHead>Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                    <UserRowSkeleton />
                    <UserRowSkeleton />
                    <UserRowSkeleton />
                </>
              )}
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                        <AvatarFallback>
                          {user.displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                        <Award className='w-4 h-4 text-amber-400' />
                        {user.points || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`admin-switch-${user.id}`}
                            checked={!!user.isAdmin}
                            onCheckedChange={() => handleAdminToggle(user.id, !!user.isAdmin)}
                            disabled={user.id === currentUser?.uid}
                        />
                        <Label htmlFor={`admin-switch-${user.id}`}>
                            {user.isAdmin ? 'Yes' : 'No'}
                        </Label>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && users?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No users found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
