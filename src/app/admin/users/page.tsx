
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
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Award } from 'lucide-react';

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
            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
        </TableRow>
    )
}

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const usersQuery = firestore ? collection(firestore, 'users') : null;
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            A list of all users in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Intel Points</TableHead>
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
              {users && users.map((user, index) => (
                <TableRow key={index}>
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
                    {user.isAdmin ? 'Yes' : 'No'}
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
