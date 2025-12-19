
'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Star } from 'lucide-react';
import Link from 'next/link';

export default function FanZonePage() {

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
            <Star className="w-12 h-12 text-primary" />
            <h2 className="text-2xl font-bold font-headline mt-2">Movie Zone</h2>
             <p className="mt-2 text-muted-foreground">Movies, Stars, and Performances</p>
             <Button asChild className="mt-4" variant="outline">
                <Link href="/fan-zone/movies">
                    Enter Movie Zone
                </Link>
            </Button>
        </Card>
        <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
            <Shield className="w-12 h-12 text-primary" />
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
