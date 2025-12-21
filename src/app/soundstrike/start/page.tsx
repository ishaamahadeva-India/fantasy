import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Film, Clock, Mic, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PreSoundstrikePage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center gap-8">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance">
                Soundstrike
            </h1>
            <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-sm">
                    <Mic className="w-4 h-4 mr-2" />
                    Audio Challenge
                </Badge>
                <Badge variant="outline" className="text-sm">
                    <Film className="w-4 h-4 mr-2" />
                    Movie Trivia
                </Badge>
            </div>
            <div className="flex justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~2 Minutes</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🎯 3 Questions</span>
                </div>
            </div>
        </div>

        <div className="max-w-xl">
            <h2 className="text-lg font-semibold font-headline">Can you hear the cinema?</h2>
            <p className="mt-1 text-muted-foreground">
                Listen to iconic movie quotes and identify the film. A true test for the audiophile cinephile.
            </p>
        </div>

        <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
             <h3 className="font-semibold">What you'll experience</h3>
             <p className="text-sm text-muted-foreground">You will be played a series of audio clips, each containing a famous movie quote. Your task is to select the correct movie from a list of options.</p>
        </div>
        
        <p className="text-xs text-muted-foreground/50">
            This is a skill-based knowledge quiz. No betting. No real money involved.
        </p>

        <div className="flex flex-col items-center w-full gap-2">
             <Button asChild size="lg" className="w-full">
                <Link href="/soundstrike">
                    Start Challenge <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
                <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Game Lobby
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
