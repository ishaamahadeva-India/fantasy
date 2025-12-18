'use client';
import { Hero } from '@/components/home/hero';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  BrainCircuit,
  CalendarClock,
  CheckCheck,
  Crosshair,
  Eye,
  Film,
  Flame,
  Gauge,
  Heart,
  Lock,
  Newspaper,
  Radio,
  Scale,
  Shield,
  Zap,
} from 'lucide-react';

const gameModes = [
  {
    name: 'Precision Run',
    description: 'Accuracy-based MCQ challenge.',
    icon: Crosshair,
    premium: false,
  },
  {
    name: 'Soundstrike',
    description: 'One-listen audio combat.',
    icon: Radio,
    premium: true,
  },
  {
    name: 'Frame Lock',
    description: 'Identify moments under pressure.',
    icon: Film,
    premium: true,
  },
  {
    name: 'Visual Decode',
    description: 'Sharp visual memory test.',
    icon: Eye,
    premium: false,
  },
  {
    name: 'Chrono Shift',
    description: 'Arrange events correctly.',
    icon: CalendarClock,
    premium: false,
  },
  {
    name: 'Last Stand',
    description: 'One mistake = game over.',
    icon: Shield,
    premium: true,
  },
  {
    name: 'Blitz Mode',
    description: '60-second high-intensity run.',
    icon: Zap,
    premium: false,
  },
  {
    name: 'Mind Vault',
    description: 'Memorize, then recall.',
    icon: BrainCircuit,
    premium: true,
  },
  {
    name: 'Intel Briefing',
    description: 'Read a news snippet, then respond.',
    icon: Newspaper,
    premium: false,
  },
  {
    name: 'Error Replay',
    description: 'Fix your past mistakes.',
    icon: CheckCheck,
    premium: false,
  },
  {
    name: 'Pulse Check',
    description: 'Community sentiment poll.',
    icon: Heart,
    premium: false,
  },
  {
    name: 'Forecast Run',
    description: 'Prediction accuracy tracking.',
    icon: ArrowLeftRight,
    premium: true,
  },
  {
    name: 'Stance Meter',
    description: 'Weigh your opinion & confidence.',
    icon: Gauge,
    premium: false,
  },
  {
    name: 'Priority Grid',
    description: 'Strategic ranking challenge.',
    icon: Scale,
    premium: false,
  },
  {
    name: 'Decision Room',
    description: 'Choose your move in a scenario.',
    icon: Flame,
    premium: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <Hero />

      <div className="space-y-12">
        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Today in 60 seconds
          </h2>
          {/* Placeholder for horizontal swipe cards */}
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5 p-4 text-center text-muted-foreground">
            <p>Horizontal swipe cards for daily challenges coming soon.</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">Game Modes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gameModes.map((mode) => (
              <Card
                key={mode.name}
                className={cn(
                  'group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20',
                  mode.premium && 'bg-white/2 border-white/5'
                )}
              >
                {mode.premium && (
                  <div className="absolute right-4 top-4 rounded-full bg-primary/20 p-2 text-primary">
                    <Lock className="h-4 w-4" />
                  </div>
                )}
                <CardHeader>
                  <div
                    className={cn(
                      'flex items-center gap-4',
                      mode.premium && 'opacity-50'
                    )}
                  >
                    <div className="rounded-md bg-secondary p-3">
                      <mode.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-lg">
                        {mode.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardDescription
                  className={cn('px-8 pb-8', mode.premium && 'opacity-50')}
                >
                  {mode.description}
                </CardDescription>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Featured Categories
          </h2>
          {/* Placeholder for visual category tiles */}
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5 p-4 text-center text-muted-foreground">
            <p>Large visual category tiles coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
