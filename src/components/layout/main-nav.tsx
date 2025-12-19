
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

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Intel Hub', icon: Newspaper },
  { href: '/play', label: 'Play', icon: Play },
  { href: '/fantasy', label: 'Fantasy', icon: Trophy },
  { href: '/live-fantasy', label: 'Live Fantasy', icon: Zap },
  { href: '/fan-zone', label: 'Fan Zone', icon: Users },
  { href: '/insights', label: 'Insights', icon: BarChart2 },
  { href: '/redeem', label: 'Redemption Center', icon: Gift },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  const isFanZoneActive = pathname.startsWith('/fan-zone/cricket') || pathname.startsWith('/fan-zone/movies');

  return (
    <div className="flex flex-col justify-between h-full p-2">
      <SidebarMenu>
        {navItems.map((item) => {
           let isActive = pathname === item.href;
           if (item.href === '/fan-zone') {
                isActive = pathname.startsWith('/fan-zone');
           } else if (item.href !== '/') {
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
