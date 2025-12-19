'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StarsTab } from '@/components/fan-zone/stars-tab';
import { MoviesTab } from '@/components/fan-zone/movies-tab';

export default function FanZonePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fan Zone
        </h1>
        <p className="mt-2 text-muted-foreground">
          Movies · Stars · Performances
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search movies, stars..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="movies" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sm:grid-cols-5">
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="stars">Stars</TabsTrigger>
          <TabsTrigger value="performances">Performances</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        <TabsContent value="movies">
          <MoviesTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="stars">
          <StarsTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="performances">
          <div className="py-12 text-center text-muted-foreground">
            Performances coming soon.
          </div>
        </TabsContent>
        <TabsContent value="top-rated">
          <div className="py-12 text-center text-muted-foreground">
            Top Rated coming soon.
          </div>
        </TabsContent>
        <TabsContent value="trending">
          <div className="py-12 text-center text-muted-foreground">
            Trending coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
