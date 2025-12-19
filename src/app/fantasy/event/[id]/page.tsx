
'use client';
import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Info, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { usePredictions } from '@/firebase/firestore/predictions';
import { toast } from '@/hooks/use-toast';
import { popularStars } from '@/lib/placeholder-data';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
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
    },
    {
        id: 'event-6',
        title: 'Full Team Draft (Release Week)',
        description: 'Draft your fantasy team for the opening weekend. Your team will score points based on performance mentions, social media buzz, and critics\' ratings.',
        type: 'draft_selection' as const,
        campaignId: 'campaign-devara',
        endsIn: '5 days',
        rules: [
            'You have a budget of 100 credits.',
            'You must select one player for each role.',
            'Select one player as your Captain to earn 2x points.',
        ],
        draftConfig: {
            budget: 100,
            roles: [
                { id: 'hero', title: 'Hero', players: ['s4', 's5'] },
                { id: 'heroine', title: 'Heroine', players: ['s-placeholder-1', 's-placeholder-2'] },
                { id: 'director', title: 'Director', players: ['s-placeholder-3'] },
                { id: 'music_director', title: 'Music Director', players: ['s-placeholder-4'] },
            ],
            playerCredits: {
                's4': 25, 's5': 22, // NTR Jr., Ram Charan
                's-placeholder-1': 18, // Janhvi Kapoor
                's-placeholder-2': 15, // Placeholder Actress
                's-placeholder-3': 20, // Koratala Siva
                's-placeholder-4': 15, // Anirudh
            }
        },
    }
];
// Add placeholder stars for draft
const draftStars = [
    ...popularStars,
    { id: 's-placeholder-1', name: 'Janhvi Kapoor', avatar: 'https://picsum.photos/seed/janhvi/400/400', popularityIndex: 88, genre: ['Drama']},
    { id: 's-placeholder-2', name: 'Saiee Manjrekar', avatar: 'https://picsum.photos/seed/saiee/400/400', popularityIndex: 82, genre: ['Drama']},
    { id: 's-placeholder-3', name: 'Koratala Siva', avatar: 'https://picsum.photos/seed/siva/400/400', popularityIndex: 90, genre: ['Director']},
    { id: 's-placeholder-4', name: 'Anirudh Ravichander', avatar: 'https://picsum.photos/seed/anirudh/400/400', popularityIndex: 95, genre: ['Music']},
]

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

function DraftSelection({ config, prediction, setPrediction, isLocked }: { config: any, prediction: any, setPrediction: (val: any) => void, isLocked: boolean }) {
    
    const team = prediction.team || {};
    const captain = prediction.captain || null;
    const creditsUsed = Object.values(team).reduce((acc: number, playerId: any) => {
        return acc + (config.playerCredits[playerId] || 0);
    }, 0);
    const creditsRemaining = config.budget - creditsUsed;

    const handleSelectPlayer = (roleId: string, playerId: string) => {
        const currentSelection = team[roleId];
        let newTeam = { ...team };

        if (currentSelection === playerId) {
            // Deselect player
            delete newTeam[roleId];
        } else {
            // Check budget before adding
            const currentCredits = Object.values(newTeam).reduce((acc: number, pId: any) => acc + (config.playerCredits[pId] || 0), 0);
            const newPlayerCredits = config.playerCredits[playerId];
            if (currentCredits + newPlayerCredits <= config.budget) {
                newTeam[roleId] = playerId;
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Budget Exceeded',
                    description: `You don't have enough credits to select this player.`,
                });
                return;
            }
        }

        // If deselecting the captain, also remove captaincy
        if (captain === playerId && currentSelection === playerId) {
            setPrediction({ team: newTeam, captain: null });
        } else {
            setPrediction({ team: newTeam, captain });
        }
    };

    const handleSetCaptain = (playerId: string) => {
        if(Object.values(team).includes(playerId)) {
            setPrediction({ team, captain: playerId === captain ? null : playerId });
        }
    }
    
    const getPlayerById = (id: string) => draftStars.find(p => p.id === id);
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Your Budget</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Credits Remaining</p>
                        <p className="text-3xl font-bold font-code text-primary">{creditsRemaining}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Total Credits</p>
                        <p className="text-3xl font-bold font-code">{config.budget}</p>
                    </div>
                </CardContent>
            </Card>

            {config.roles.map((role: any) => (
                <div key={role.id}>
                    <h3 className="text-xl font-bold font-headline mb-4">{role.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {role.players.map((playerId: string) => {
                            const player = getPlayerById(playerId);
                            if (!player) return null;
                            const isSelected = team[role.id] === playerId;
                            const isCaptain = captain === playerId;
                            const isDisabled = !isSelected && creditsRemaining < config.playerCredits[playerId];

                            return (
                                <Card key={playerId}
                                    onClick={() => !isDisabled && !isLocked && handleSelectPlayer(role.id, playerId)}
                                    className={cn("p-3 text-center transition-all cursor-pointer",
                                        isSelected && "border-primary ring-2 ring-primary",
                                        isDisabled && "opacity-50 cursor-not-allowed bg-white/5",
                                        isLocked && !isSelected && "opacity-60 cursor-not-allowed"
                                    )}>
                                    <div className="relative">
                                        <Image src={player.avatar} alt={player.name} width={80} height={80} className="rounded-full mx-auto" />
                                         {isCaptain && <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">2x</div>}
                                    </div>
                                    <p className="font-semibold mt-2 text-sm">{player.name}</p>
                                    <p className="text-xs text-muted-foreground">Credits: {config.playerCredits[playerId]}</p>
                                    
                                     {isSelected && !isLocked && (
                                        <Button
                                            size="sm"
                                            variant={isCaptain ? "default" : "outline"}
                                            onClick={(e) => { e.stopPropagation(); handleSetCaptain(playerId); }}
                                            className="mt-2 w-full text-xs"
                                        >
                                            {isCaptain ? <ShieldCheck className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                                            {isCaptain ? "Captain" : "Set Captain"}
                                        </Button>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}


export default function PredictionEventPage({ params }: { params: { id: string } }) {
    const { id } = use(params);
    const eventDetails = allEvents.find(e => e.id === id);
    const [prediction, setPrediction] = useState<any>(
        eventDetails?.type === 'draft_selection' ? { team: {}, captain: null } : ''
    );
    const [isLocked, setIsLocked] = useState(false);
    
    const { user } = useUser();
    const { saveUserPrediction } = usePredictions();

    if (!eventDetails) {
        return notFound();
    }

    const handleLockPrediction = () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'You must be logged in to make a prediction.',
            });
            return;
        }

        let predictionData;
        let isValid = false;

        switch(eventDetails.type) {
            case 'numeric_prediction':
                isValid = prediction && Number(prediction) > 0;
                if (isValid) predictionData = { predictedValue: Number(prediction) };
                else toast({ variant: 'destructive', title: 'Invalid Prediction', description: 'Please enter a valid number.' });
                break;
            case 'choice_selection':
                isValid = !!prediction;
                 if (isValid) predictionData = { selectedChoice: prediction };
                 else toast({ variant: 'destructive', title: 'Invalid Prediction', description: 'Please select an option.' });
                break;
            case 'draft_selection':
                const team = prediction.team || {};
                const captain = prediction.captain || null;
                const rolesFilled = Object.keys(team).length === eventDetails.draftConfig.roles.length;
                
                if (!rolesFilled) {
                    toast({ variant: 'destructive', title: 'Incomplete Team', description: 'You must select a player for each role.' });
                    isValid = false;
                } else if (!captain) {
                    toast({ variant: 'destructive', title: 'No Captain Selected', description: 'You must select a captain for your team.' });
                    isValid = false;
                } else {
                    isValid = true;
                    predictionData = prediction;
                }
                break;
            default:
                isValid = false;
                toast({ variant: 'destructive', title: 'Invalid Event', description: 'This event type is not supported.' });
        }
            
        if (!isValid) return;

        saveUserPrediction({
            eventId: eventDetails.id,
            campaignId: eventDetails.campaignId,
            predictionData: predictionData,
        }, user.uid);
        
        setIsLocked(true);

        toast({
            title: 'Prediction Locked!',
            description: 'Your prediction has been successfully submitted.',
        });
    };
    
    const renderPredictionInput = () => {
        switch (eventDetails.type) {
            case 'numeric_prediction':
                return <NumericPrediction prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            case 'choice_selection':
                return <ChoiceSelection options={eventDetails.options!} prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            case 'draft_selection':
                return <DraftSelection config={eventDetails.draftConfig} prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            default:
                return <p className='text-muted-foreground'>This event type is not available yet.</p>
        }
    }
    
    const getLockedInDisplayValue = () => {
        if (!prediction) return "N/A";
        if (eventDetails.type === 'numeric_prediction') {
            return Number(prediction).toLocaleString();
        }
        if (eventDetails.type === 'draft_selection') {
             const teamSize = Object.keys(prediction.team || {}).length;
             return `${teamSize}-player team drafted`;
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
                            : eventDetails.type === 'choice_selection'
                            ? 'Select one of the options below.'
                            : 'Build your team within the credit budget.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {renderPredictionInput()}
                    <Button onClick={handleLockPrediction} disabled={isLocked} size="lg" className='w-full'>
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

    