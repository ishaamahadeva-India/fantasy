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
import { Award, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

function Greeting() {
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

  return (
    <div>
        <h1 className="text-xl font-bold md:text-2xl font-headline">
            {greeting}, Kaarthu
        </h1>
    </div>
  );
}


export function Header() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Greeting />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Link href="/redeem">
          <Button variant="outline" size="sm">
            <Award className="w-4 h-4 mr-2 text-amber-400" />
            {isLoading ? (
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
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
