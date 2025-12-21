
'use client';
import {
  Home,
  Users,
  FileText,
  BadgePercent,
  Gamepad2,
  Shield,
  Loader2,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/ads', label: 'Advertisements', icon: BadgePercent },
  { href: '/admin/fantasy', label: 'Fantasy Games', icon: Gamepad2 },
  { href: '/admin/fanzone', label: 'Fan Zone', icon: Shield },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex-col hidden w-64 border-r bg-background sm:flex">
      <nav className="flex flex-col h-full gap-4 px-2 py-4">
        <div className="flex items-center h-16 gap-2 px-4 border-b">
          <Avatar>
            {user?.photoURL && <AvatarImage src={user.photoURL} />}
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{user?.displayName}</span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
        <div className="flex-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                pathname === item.href && 'bg-muted text-primary'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">Back to App</Link>
          </Button>
        </div>
      </nav>
    </aside>
  );
}

const SUPER_ADMIN_EMAIL = 'admin@fantasy.com';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const isLoading = userLoading || profileLoading;
  // Check both userProfile.isAdmin and user email (for super admin)
  const isAuthorized = userProfile?.isAdmin === true || user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    // Only redirect if loading is finished
    if (!isLoading) {
      // If user is not logged in, redirect to home
      if (!user) {
        router.replace('/');
        return;
      }
      // If user is logged in but not authorized, redirect to home
      if (!isAuthorized) {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthorized, router, user]);


  // While we are verifying the user's authentication state and admin role,
  // show a loading screen.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-4">Verifying admin access...</span>
      </div>
    );
  }

  // After loading, if the user is still not authorized, show an access denied message.
  // This handles the case where the user is logged in but is not an admin.
  if (!isAuthorized) {
    return (
       <div className="flex items-center justify-center h-screen">
        <div className='text-center'>
            <TriangleAlert className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <Button asChild className="mt-4"><Link href="/">Go to Home</Link></Button>
        </div>
      </div>
    );
  }

  // If all checks pass, render the admin layout with its content.
  return (
    <div className="min-h-screen w-full">
      <AdminSidebar />
      <main className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <div className="p-4 sm:p-0">{children}</div>
      </main>
    </div>
  );
}
