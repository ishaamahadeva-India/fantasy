
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Film, Shield } from 'lucide-react';

const fantasyNavItems = [
  { href: '/fantasy/cricket', label: 'Cricket', icon: Shield },
  { href: '/fantasy/movie', label: 'Movies', icon: Film },
  // { href: '#', label: 'Leaderboard' },
  // { href: '#', label: 'My Performance' },
];

export function FantasyHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 -mx-4 -mt-4 sm:-mx-8 sm:-mt-8 md:-mx-12 md:-mt-12 mb-8">
        <div className="bg-background/80 backdrop-blur-lg border-b border-border p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/fantasy">
                    <h1 className="text-xl font-bold font-headline text-primary">Fantasy Arena</h1>
                </Link>
                <nav className="hidden md:flex items-center gap-4">
                    {fantasyNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                                pathname === item.href && 'text-primary'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                 <Button asChild>
                    <Link href="/profile">My Profile</Link>
                </Button>
            </div>
        </div>
    </header>
  );
}
