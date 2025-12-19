'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// --- MOCK DATA ---
// In a real app, you would fetch the event details based on the `params.id`
const allEvents = [
    {
        id: 'event-3', 
        title: 'Trailer Views (24h)', 
        description: 'Predict the total number of views the official "Devara: Part 1" trailer will receive across all official channels within the first 24 hours of its release.',
        type: 'numeric_prediction' as const,
        campaignId: 'campaign-devara',
        endsIn: '1 hour 45 minutes',
        rules: [
            'Views from official YouTube channels only.',
            'The 24-hour window starts from the exact time of the trailer release.',
            'Prediction must be a whole number.'
        ],
        options: [],
    },
    {
        id: 'event-4',
        title: 'First Song Streaming Milestone',
        description: 'Which of the first two released songs will be the first to cross 50 Million streams across all platforms?',
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        endsIn: '3 days',
        rules: [
            'Includes streams from Spotify, Gaana, JioSaavn, and Apple Music.',
            'The winner is the first song to reach the milestone, regardless of release date.',
        ],
        options: ['Fear Song', 'Anaganaganaga'],
    }
];


function NumericPrediction({ prediction, setPrediction, isLocked }: { prediction: string, setPrediction: (val: string) => void, isLocked: boolean }) {
    return (
        <Input
            type="number"
            placeholder="e.g., 25000000"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            disabled={isLocked}
            className="text-lg h-12"
        />
    )
}

function ChoiceSelection({ options, prediction, setPrediction, isLocked }: { options: string[], prediction: string, setPrediction: (val: string) => void, isLocked: boolean }) {
    return (
        <RadioGroup value={prediction} onValueChange={setPrediction} disabled={isLocked} className="space-y-3">
            {options.map(option => (
                 <Label key={option} htmlFor={option} className={`flex items-center gap-4 p-4 rounded-lg border-2 ${prediction === option ? 'border-primary' : 'border-input'} cursor-pointer`}>
                    <RadioGroupItem value={option} id={option} />
                    <span className='font-semibold text-lg'>{option}</span>
                </Label>
            ))}
        </RadioGroup>
    )
}


export default function PredictionEventPage({ params }: { params: { id: string } }) {
    
    const eventDetails = allEvents.find(e => e.id === params.id);
    const [prediction, setPrediction] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    if (!eventDetails) {
        return notFound();
    }

    const handleLockPrediction = () => {
        // In a real app, this would save the prediction to Firestore
        console.log(`Prediction locked: ${prediction}`);
        setIsLocked(true);
    };
    
    const renderPredictionInput = () => {
        switch (eventDetails.type) {
            case 'numeric_prediction':
                return <NumericPrediction prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            case 'choice_selection':
                return <ChoiceSelection options={eventDetails.options} prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            default:
                return <p className='text-muted-foreground'>This event type is not available yet.</p>
        }
    }
    
    const getLockedInDisplayValue = () => {
        if (eventDetails.type === 'numeric_prediction') {
            return Number(prediction).toLocaleString();
        }
        return prediction;
    }


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
                     <CardDescription>
                        {eventDetails.type === 'numeric_prediction' 
                            ? 'Enter your predicted value below.'
                            : 'Select one of the options below.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {renderPredictionInput()}
                    <Button onClick={handleLockPrediction} disabled={!prediction || isLocked} size="lg" className='w-full'>
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
                        <p className="text-muted-foreground">Your prediction of <strong className='text-primary font-code'>{getLockedInDisplayValue()}</strong> has been submitted. You can now return to the campaign hub. Good luck!</p>
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
