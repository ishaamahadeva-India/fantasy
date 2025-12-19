
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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
          Engage with your favorite movies, stars, and sports.
        </p>
      </div>

       <div className="grid md:grid-cols-2 gap-6">
        <Link href="/fan-zone/movies" className="group">
            <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20">
                <Star className="w-12 h-12 text-primary" />
                <h2 className="text-2xl font-bold font-headline mt-4">Movie Zone</h2>
                <p className="mt-2 text-muted-foreground">Rate movies, follow stars, and analyze top performances.</p>
                <Button asChild className="mt-6" variant="outline">
                    <div>Enter Movie Zone</div>
                </Button>
            </Card>
        </Link>
        <Link href="/fan-zone/cricket" className="group">
            <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20">
                <Shield className="w-12 h-12 text-primary" />
                <h2 className="text-2xl font-bold font-headline mt-4">Cricket Zone</h2>
                <p className="mt-2 text-muted-foreground">Rate players, analyze teams, and compare cricketing eras.</p>
                <Button asChild className="mt-6" variant="outline">
                    <div>Enter Cricket Zone</div>
                </Button>
            </Card>
        </Link>
      </div>

    </div>
  );
}
