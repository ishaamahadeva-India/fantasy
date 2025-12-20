'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Film, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type OnboardingStep = 'intro' | 'choice' | 'skill' | 'pwa';

export function FantasyOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<OnboardingStep>('intro');
  const [choice, setChoice] = useState<'cricket' | 'movie' | null>(null);

  const handleNext = () => {
    switch (step) {
      case 'intro':
        setStep('choice');
        break;
      case 'choice':
        setStep('skill');
        break;
      case 'skill':
        setStep('pwa');
        break;
      case 'pwa':
        onComplete();
        break;
    }
  };
  
  const handleChoice = (selection: 'cricket' | 'movie') => {
      setChoice(selection);
      localStorage.setItem('fantasyPreference', selection);
      setStep('skill');
  }

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div key="intro" className="text-center">
            <h1 className="text-4xl font-bold md:text-6xl font-headline text-balance">
              Play Fantasy. Think Smart. Win by Skill 🧠
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Cricket & Movies — fantasy games driven by knowledge, timing, and strategy.
            </p>
            <Button onClick={handleNext} size="lg" className="mt-8">
              Start Playing <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );
      case 'choice':
        return (
          <div key="choice" className="text-center">
            <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance mb-8">
              Two Worlds. One Skill.
            </h1>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card
                className={cn(
                  'flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out cursor-pointer',
                  'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20',
                  choice === 'cricket' && 'ring-2 ring-primary'
                )}
                onClick={() => handleChoice('cricket')}
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Shield className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold font-headline mt-4">Cricket Live Fantasy</h2>
                <ul className="mt-4 space-y-2 text-muted-foreground text-left list-disc list-inside">
                    <li>Live match decisions</li>
                    <li>Roles & predictions</li>
                    <li>Scores every few minutes</li>
                </ul>
              </Card>
              <Card
                className={cn(
                  'flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-in-out cursor-pointer',
                  'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20',
                  choice === 'movie' && 'ring-2 ring-primary'
                )}
                onClick={() => handleChoice('movie')}
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Film className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold font-headline mt-4">Movie Fantasy</h2>
                 <ul className="mt-4 space-y-2 text-muted-foreground text-left list-disc list-inside">
                    <li>Predict box office & star impact</li>
                    <li>Build fantasy lineups</li>
                    <li>Track rankings & buzz</li>
                </ul>
              </Card>
            </div>
          </div>
        );
      case 'skill':
        return (
            <div key="skill" className="text-center">
                <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance mb-4">
                    Skill Comes First
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    No gambling.
                    <br/>
                    No random outcomes.
                    <br/>
                    Your performance depends on analysis and smart choices.
                </p>
                <Button onClick={handleNext} size="lg" className="mt-8">
                    Enter Fantasy Arena <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        );
      case 'pwa':
        return (
            <div key="pwa" className="text-center">
                <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance mb-4">
                    Install Once. Play Anywhere.
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Add this app to your home screen for live updates, faster play, and instant alerts.
                </p>
                <Button onClick={handleNext} size="lg" className="mt-8">
                     ＋ Add to Home Screen
                </Button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AnimatePresence mode="wait">
            <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
            >
                {renderStep()}
            </motion.div>
        </AnimatePresence>
    </div>
  );
}
