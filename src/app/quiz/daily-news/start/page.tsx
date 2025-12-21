import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BrainCircuit, Clock, Mic } from 'lucide-react';
import Link from 'next/link';

export default function PreQuizPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center gap-8">
        {/* 1. Hero Content Block */}
        <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance">
                Daily News Quiz
            </h1>
            <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-sm">
                    <Mic className="w-4 h-4 mr-2" />
                    Audio
                </Badge>
                <Badge variant="outline" className="text-sm">
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    Skill-based
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

        {/* 2. Context / Why This Matters */}
        <div className="max-w-xl">
            <h2 className="text-lg font-semibold font-headline">Why this matters</h2>
            <p className="mt-1 text-muted-foreground">
                A quick check on today’s top stories to keep you sharp and informed. How well did you keep up with the world today?
            </p>
        </div>

        {/* 3. What You'll Experience (Placeholder) */}
        <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
             <h3 className="font-semibold">What you'll experience</h3>
             <p className="text-sm text-muted-foreground">A mix of quick recall questions based on current events, including audio snippets from news reports.</p>
        </div>
        
        {/* 4. Skill & Learning Assurance */}
        <p className="text-xs text-muted-foreground/50">
            This is a skill-based knowledge quiz. No betting. No real money involved.
        </p>

        {/* 7. Primary CTA */}
        <div className="flex flex-col items-center w-full gap-2">
             <Button asChild size="lg" className="w-full">
                <Link href="/quiz/daily-news">
                    Start Quiz <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
            <p className="text-xs text-muted-foreground">No interruptions • ~2 minutes</p>
        </div>
      </div>
    </div>
  );
}
