
"use client";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Award, LogIn, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { handleGoogleSignIn, handleLogout } from '@/firebase/auth/auth-service';

function Greeting() {
  const { user, isLoading } = useUser();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
  
  if (isLoading) {
    return <Skeleton className="h-8 w-48" />;
  }

  return (
    <div>
        <h1 className="text-xl font-bold md:text-2xl font-headline">
            {greeting}{user ? `, ${user.displayName?.split(' ')[0]}`: ''}
        </h1>
    </div>
  );
}


export function Header() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Greeting />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Link href="/redeem">
          <Button variant="outline" size="sm" disabled={!user}>
            <Award className="w-4 h-4 mr-2 text-amber-400" />
            {isProfileLoading || isUserLoading ? (
                <Skeleton className="h-4 w-12" />
            ) : (
                <span className='font-code'>{userProfile?.points || 0}</span>
            )}
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative w-8 h-8 rounded-full">
              <Avatar className="w-8 h-8">
                 {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'}/>}
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {user ? (
                <>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <Link href="/profile">
                        <DropdownMenuItem>
                            <User className='mr-2'/> Profile
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className='mr-2'/> Log out
                    </DropdownMenuItem>
                </>
            ): (
                 <DropdownMenuItem onClick={handleGoogleSignIn}>
                    <LogIn className='mr-2' />
                    Login with Google
                 </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
