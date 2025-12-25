
'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Home,
  Newspaper,
  Play,
  BarChart2,
  User,
  Settings,
  Star,
  Shield,
  Gift,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/play', label: 'Play', icon: Play },
  { href: '/fantasy', label: 'Fantasy', icon: Trophy },
  { href: '/fan-zone', label: 'Fan Zone', icon: Users },
  { href: '/insights', label: 'Insights', icon: BarChart2 },
  { href: '/redeem', label: 'Redemption Center', icon: Gift },
  { href: '/profile', label: 'Profile', icon: User },
];

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'adminW@fantasy.com';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
  const { data: userProfile } = useDoc(userProfileRef);

  // Only super admin can see admin link
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  return (
    <div className="flex flex-col justify-between h-full p-2">
      <SidebarMenu>
        {navItems.map((item) => {
           let isActive = pathname === item.href;
           if (item.href === '/fan-zone') {
                isActive = pathname.startsWith('/fan-zone');
           } else if (item.href === '/fantasy') {
                isActive = pathname.startsWith('/fantasy') || pathname.startsWith('/live-fantasy');
           }
            else if (item.href !== '/') {
                isActive = pathname.startsWith(item.href);
           }

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
        {isSuperAdmin && (
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    tooltip="Admin"
                >
                    <Link href="/admin">
                        <Shield />
                        <span>Admin</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )}
      </SidebarMenu>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Settings" asChild>
            <Link href="#">
              <Settings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
