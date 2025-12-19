'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Info } from 'lucide-react';
import Link from 'next/link';

// Placeholder Data - In a real app, this would be fetched based on the event ID
const eventDetails = {
    id: 'event-3', 
    title: 'Trailer Views (24h)', 
    description: 'Predict the total number of views the official "Devara: Part 1" trailer will receive across all official channels within the first 24 hours of its release.',
    type: 'numeric_prediction',
    campaignId: 'campaign-devara',
    endsIn: '1 hour 45 minutes',
    rules: [
        'Views from official YouTube channels only.',
        'The 24-hour window starts from the exact time of the trailer release.',
        'Prediction must be a whole number.'
    ]
};

export default function PredictionEventPage({ params }: { params: { id: string } }) {
    const [prediction, setPrediction] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    const handleLockPrediction = () => {
        // In a real app, this would save the prediction to Firestore
        console.log(`Prediction locked: ${prediction}`);
        setIsLocked(true);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Button variant="ghost" asChild className='mb-4 -ml-4'>
                    <Link href={`/fantasy/campaign/${eventDetails.campaignId}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Campaign
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">
                    {eventDetails.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
                    <Clock className="w-4 h-4" />
                    <span>Prediction window closes in {eventDetails.endsIn}</span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className='font-headline'>Event Objective</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{eventDetails.description}</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className='font-headline'>Make Your Prediction</CardTitle>
                     <CardDescription>Enter your predicted number of views below.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Input
                        type="number"
                        placeholder="e.g., 25000000"
                        value={prediction}
                        onChange={(e) => setPrediction(e.target.value)}
                        disabled={isLocked}
                        className="text-lg h-12"
                    />
                    <Button onClick={handleLockPrediction} disabled={!prediction || isLocked} size="lg">
                        {isLocked ? 'Locked In' : 'Lock Prediction'}
                    </Button>
                </CardContent>
            </Card>
            
            {isLocked && (
                 <Card className="border-green-500/50">
                    <CardHeader>
                        <CardTitle className="font-headline text-green-400">Prediction Locked!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your prediction of <strong className='text-primary font-code'>{Number(prediction).toLocaleString()}</strong> views has been submitted. You can now return to the campaign hub. Good luck!</p>
                    </CardContent>
                </Card>
            )}

             <Card className="bg-white/5">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Info className='w-5 h-5'/>Rules & Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        {eventDetails.rules.map((rule, index) => (
                            <li key={index}>{rule}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

        </div>
    );
}
