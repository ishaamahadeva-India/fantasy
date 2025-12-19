
'use client';
import { popularStars } from '@/lib/placeholder-data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function StarsTab({ searchTerm }: { searchTerm: string }) {
  const filteredStars = popularStars.filter((star) =>
    star.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredStars.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No stars found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredStars.map((star) => (
        <Link href={`/fan-zone/star/${star.id}`} key={star.id} className="group">
          <Card className="text-center h-full">
            <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
              <Avatar className="w-24 h-24">
                <AvatarImage src={star.avatar} alt={star.name} />
                <AvatarFallback>{star.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold font-headline text-sm group-hover:text-primary">
                {star.name}
              </h3>
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Plus className="w-4 h-4 mr-2" />
                Follow
              </Button>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

    