
'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal, Cricket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StarsTab } from '@/components/fan-zone/stars-tab';
import { MoviesTab } from '@/components/fan-zone/movies-tab';
import { TopRatedTab } from '@/components/fan-zone/top-rated-tab';
import { TrendingTab } from '@/components/fan-zone/trending-tab';
import { PerformancesTab } from '@/components/fan-zone/performances-tab';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function FanZonePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fan Zone
        </h1>
        <p className="mt-2 text-muted-foreground">
          Movies · Stars · Performances · Cricket
        </p>
      </div>

       <div className="grid md:grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
            <h2 className="text-2xl font-bold font-headline">Movie Zone</h2>
             <p className="mt-2 text-muted-foreground">Movies, Stars, and Performances</p>
             <Button asChild className="mt-4" variant="outline">
                <Link href="/fan-zone/movies">
                    Enter Movie Zone
                </Link>
            </Button>
        </Card>
        <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
            <Cricket className="w-12 h-12 text-primary" />
            <h2 className="text-2xl font-bold font-headline mt-2">Cricket Zone</h2>
            <p className="mt-2 text-muted-foreground">Teams, Players, and Leagues</p>
            <Button asChild className="mt-4">
                <Link href="/fan-zone/cricket">
                    Enter Cricket Zone
                </Link>
            </Button>
        </Card>
      </div>

    </div>
  );
}
