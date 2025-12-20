
'use client';
import { useState } from 'react';
import { Search, SlidersHorizontal, User, Star as StarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MoviesTab } from '@/components/fan-zone/movies-tab';
import Link from 'next/link';


export default function FanZoneMoviesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fan Zone - Movies
        </h1>
        <p className="mt-2 text-muted-foreground">
          Movies · Stars · Performances
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex gap-2'>
            <Button variant="outline" asChild>
                <Link href="/fan-zone/movies/stars">
                    <User className="w-4 h-4 mr-2" />
                    Stars
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/fan-zone/movies/performances">
                    <StarIcon className="w-4 h-4 mr-2" />
                    Performances
                </Link>
            </Button>
            <Button variant="outline">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filter
            </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sm:grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Hollywood">Hollywood</TabsTrigger>
          <TabsTrigger value="Bollywood">Bollywood</TabsTrigger>
          <TabsTrigger value="Tollywood">Tollywood</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
            <MoviesTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="Hollywood">
            <MoviesTab searchTerm={searchTerm} industry="Hollywood" />
        </TabsContent>
        <TabsContent value="Bollywood">
            <MoviesTab searchTerm={searchTerm} industry="Bollywood" />
        </TabsContent>
        <TabsContent value="Tollywood">
            <MoviesTab searchTerm={searchTerm} industry="Tollywood" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

    