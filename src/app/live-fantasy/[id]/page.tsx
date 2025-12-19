
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LiveFantasyMatchPage({ params }: { params: { id: string }}) {
    // This is a placeholder page that will be built out in the next phases.
    // It will contain the role selection and live prediction UI.
    return (
        <div className="space-y-8">
             <div>
                <Button variant="ghost" asChild className='mb-2 -ml-4'>
                    <Link href="/live-fantasy">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Matches
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    Live Match: IND vs AUS
                </h1>
                <p className="mt-1 text-muted-foreground">
                    T20 World Cup Final
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The live match experience with role selection and micro-predictions is being built. This is Phase 1 of the implementation.</p>
                </CardContent>
            </Card>
        </div>
    )
}
