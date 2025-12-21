
'use client';
import { useState } from 'react';
import { StarsTab } from '@/components/fan-zone/stars-tab';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function StarsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Movie Stars
        </h1>
        <p className="mt-2 text-muted-foreground">
          Follow your favorite movie stars.
        </p>
      </div>
       <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search stars..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      <StarsTab searchTerm={searchTerm} />
    </div>
  );
}

    