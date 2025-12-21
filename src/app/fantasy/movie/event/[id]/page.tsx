
'use client';
import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Info, ShieldCheck, Star, Trophy, CheckCircle2, Building } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
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
        id: 'event-1', 
        title: 'First Look Views (24h)', 
        description: 'Predict the range of total views for the "Devara" first look across all official channels in its first 24 hours.',
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        status: 'Completed' as const,
        points: 50,
        rules: ['Views from official YouTube, X, and Instagram channels only.'],
        options: ['0 - 10 Million', '10 - 20 Million', '20 - 30 Million', '30 Million+'],
        result: {
            outcome: '20 - 30 Million', // The winning range
            userPrediction: '20 - 30 Million', // User's selected range
            score: 50 // Predetermined points for correct prediction
        }
    },
    {
        id: 'event-2', 
        title: 'Pre-Release Event Location', 
        status: 'Completed' as const, 
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        description: 'Predict the primary location of the main pre-release event.',
        points: 25,
        options: ['Hyderabad', 'Vizag', 'Dubai', 'Mumbai'],
        rules: ['The location of the main stage event will be considered final.'],
        result: {
            outcome: 'Hyderabad',
            userPrediction: 'Vizag',
            score: 0
        }
    },
    {
        id: 'event-3', 
        title: 'Trailer Views (24h)', 
        description: 'Predict the range of total views for the official "Devara: Part 1" trailer across all official channels within the first 24 hours.',
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        status: 'Live' as const,
        endsIn: '1 hour 45 minutes',
        points: 75,
        options: ['0 - 25 Million', '25 - 50 Million', '50 - 75 Million', '75 Million+'],
        rules: [
            'Views from official YouTube channels only.',
            'The 24-hour window starts from the exact time of the trailer release.',
        ],
    },
    {
        id: 'event-4',
        title: 'First Song: Streaming Platform Milestone',
        description: 'Which streaming platform will be the first to report 10 million streams for the first single?',
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        status: 'Upcoming' as const,
        endsIn: '3 days',
        points: 40,
        rules: [
            'Official reports from platform holders or the production house will be considered final.',
        ],
        options: ['Spotify', 'Gaana', 'JioSaavn', 'Apple Music'],
    },
    {
        id: 'event-6',
        title: 'Full Team Draft (Release Week)',
        description: 'Draft your fantasy team for the opening weekend. Your team will score points based on performance mentions, social media buzz, and critics\' ratings.',
        type: 'draft_selection' as const,
        campaignId: 'campaign-devara',
        status: 'Upcoming' as const,
        endsIn: '5 days',
        points: 200, // Max potential points
        rules: [
            'You have a budget of 100 credits.',
            'You must select one player for each role.',
            'Select one player as your Captain to earn 1.5x points.',
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
    },
    {
        id: 'event-7',
        title: 'First Look Views (1hr)',
        description: 'Predict the range of total views for the "Devara" first look in its first hour.',
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        status: 'Upcoming' as const,
        endsIn: 'Soon',
        points: 20,
        options: ['0 - 1 Million', '1 - 2 Million', '2 Million+'],
        rules: ['Views from official YouTube, X, and Instagram channels only.'],
    },
    {
        id: 'event-8',
        title: 'First Look Views (7 Days)',
        description: 'Predict the range of total views for the "Devara" first look after 7 days.',
        type: 'choice_selection' as const,
        campaignId: 'campaign-devara',
        status: 'Upcoming' as const,
        endsIn: 'Soon',
        points: 100,
        options: ['0 - 50 Million', '50 - 100 Million', '100 Million+'],
        rules: ['Views from official YouTube, X, and Instagram channels only.'],
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
                                         {isCaptain && <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">1.5x</div>}
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

function EventHeader({ eventDetails }: { eventDetails: any }) {
    return (
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
            <div className="mt-2 flex items-center gap-6">
                {eventDetails.status === 'Live' && eventDetails.endsIn && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                        <Clock className="w-4 h-4" />
                        <span>Closes in {eventDetails.endsIn}</span>
                    </div>
                )}
                 {eventDetails.status === 'Completed' && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Event Completed</span>
                    </div>
                )}
                {eventDetails.points && (
                     <div className="flex items-center gap-2 text-sm text-amber-400">
                        <Trophy className="w-4 h-4" />
                        <span>{eventDetails.points} Points</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function LiveEventView({ eventDetails }: { eventDetails: any }) {
    const [prediction, setPrediction] = useState<any>(
        eventDetails?.type === 'draft_selection' ? { team: {}, captain: null } : ''
    );
    const [isLocked, setIsLocked] = useState(false);
    const { user } = useUser();
    const { saveUserPrediction } = usePredictions();

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
        } as any, user.uid);
        
        setIsLocked(true);

        toast({
            title: 'Prediction Locked!',
            description: 'Your prediction has been successfully submitted.',
        });
    };
    
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
    
    const renderPredictionInput = () => {
        switch(eventDetails.type) {
            case 'numeric_prediction':
                return <NumericPrediction prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            case 'choice_selection':
                return <ChoiceSelection options={eventDetails.options} prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            case 'draft_selection':
                return <DraftSelection config={eventDetails.draftConfig} prediction={prediction} setPrediction={setPrediction} isLocked={isLocked} />;
            default:
                return <p>This event type is not supported.</p>;
        }
    }

    return (
        <>
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
        </>
    );
}

function CompletedEventView({ eventDetails }: { eventDetails: any }) {
    const isCorrect = eventDetails.result.score > 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Event Results</CardTitle>
                <CardDescription>See how your prediction fared against the final outcome.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-muted-foreground">Winning Range</p>
                        <p className="text-2xl font-bold font-code text-primary">{eventDetails.result.outcome}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <p className="text-sm text-muted-foreground">Your Prediction</p>
                        <p className="text-2xl font-bold font-code">{eventDetails.result.userPrediction}</p>
                    </div>
                </div>
                 <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Points Awarded</p>
                    <p className="text-5xl font-bold font-code text-primary flex items-center justify-center gap-2">
                        <Trophy className="w-10 h-10 text-amber-400" />
                        {eventDetails.result.score}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PredictionEventPage() {
    const params = useParams();
    const id = params.id as string;
    const eventDetails = allEvents.find(e => e.id === id);

    if (!eventDetails) {
        return notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <EventHeader eventDetails={eventDetails} />

            {eventDetails.status === 'Live' && <LiveEventView eventDetails={eventDetails} />}
            {eventDetails.status === 'Completed' && <CompletedEventView eventDetails={eventDetails} />}
            
            {eventDetails.status === 'Upcoming' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Prediction Opens Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This event is not yet live. Check back later to make your prediction.</p>
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
                <CardContent className="border-t pt-4">
                     <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Powered by Kingfisher
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
