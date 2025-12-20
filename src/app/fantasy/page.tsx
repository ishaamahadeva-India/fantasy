'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, Film, Shield } from 'lucide-react';
import Link from 'next/link';

export default function FantasyPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold md:text-6xl font-headline text-balance">
          Play Fantasy. Think Smart. Win by Skill 🧠
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Cricket & Movies — fantasy games driven by knowledge, timing, and strategy.
        </p>
      </div>

       <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/fantasy/cricket" className="group">
            <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20">
                 <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Shield className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold font-headline mt-4">Cricket Live Fantasy</h2>
                <ul className="mt-4 space-y-2 text-muted-foreground text-left list-disc list-inside">
                    <li>Live match decisions</li>
                    <li>Roles & predictions</li>
                    <li>Scores every few minutes</li>
                </ul>
                <Button asChild className="mt-8" variant="outline">
                    <div>Choose Game <ArrowRight className="w-4 h-4 ml-2" /></div>
                </Button>
            </Card>
        </Link>
        <Link href="/fantasy/movie" className="group">
            <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out h-full group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/20">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Film className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold font-headline mt-4">Movie Fantasy</h2>
                 <ul className="mt-4 space-y-2 text-muted-foreground text-left list-disc list-inside">
                    <li>Predict box office & star impact</li>
                    <li>Build fantasy lineups</li>
                    <li>Track rankings & buzz</li>
                </ul>
                <Button asChild className="mt-8" variant="outline">
                     <div>Choose Game <ArrowRight className="w-4 h-4 ml-2" /></div>
                </Button>
            </Card>
        </Link>
      </div>

       <Card className="text-center max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Skill Comes First</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>No gambling. No random outcomes. Your performance depends on analysis and smart choices.</p>
            </CardContent>
             <CardFooter className='flex-col gap-2'>
                <p className="text-xs text-muted-foreground/50">
                    This platform hosts skill-based fantasy games for sports and entertainment. No element of chance or gambling involved. 18+ only.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
