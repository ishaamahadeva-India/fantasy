
'use client';
import { ForYouSection } from '@/components/home/for-you-section';
import { TrendingTopics } from '@/components/home/trending-topics';
import { DailyBrief } from '@/components/home/daily-brief';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  BrainCircuit,
  Newspaper,
  BookCopy,
  Lock,
  Target,
  FileText,
  Lightbulb,
  Mic,
  Video,
  ClipboardCheck,
  Calendar,
  Compass,
  Trophy,
  BarChart2,
  Quote,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const gameModes = [
    {
        title: 'Daily Quiz',
        description: 'A fresh quiz on current events, generated daily.',
        icon: Newspaper,
        href: '/quiz/daily-news/start',
        isLocked: false,
    },
    {
        title: 'Soundstrike',
        description: 'Listen to audio clips and answer questions.',
        icon: Mic,
        href: '/soundstrike/start',
        isLocked: false,
    },
    {
        title: 'Intel Briefing',
        description: 'Read an article and summarize the key points.',
        icon: FileText,
        href: '/briefing/ipl-franchise-dynasties/start',
        isLocked: false,
    },
    {
        title: 'Precision Run',
        description: 'Answer as many questions as you can in 60 seconds.',
        icon: Target,
        href: '#',
        isLocked: true,
    },
    {
        title: 'Frame Lock',
        description: 'Identify the movie from a single frame.',
        icon: Video,
        href: '/frame-lock/start',
        isLocked: false,
    },
    {
        title: 'Decision Room',
        description: 'Make critical decisions in complex scenarios.',
        icon: BrainCircuit,
        href: '#',
        isLocked: true,
    },
    {
        title: 'Fact or Fiction',
        description: 'Verify statements against a source.',
        icon: ClipboardCheck,
        href: '/fact-or-fiction/ipl-franchise-dynasties/start',
        isLocked: false,
    },
    {
        title: 'Topic Deep Dive',
        description: 'An in-depth quiz on a specific subject.',
        icon: BookCopy,
        href: '#',
        isLocked: true,
    },
    {
        title: 'Prediction Challenge',
        description: 'Forecast outcomes of upcoming events.',
        icon: Lightbulb,
        href: '#',
        isLocked: true,
    },
    {
        title: 'Historical Hot-seat',
        description: 'Place historical events in chronological order.',
        icon: Calendar,
        href: '#',
        isLocked: true,
    },
    {
        title: 'GeoGuesser',
        description: 'Identify locations from satellite images.',
        icon: Compass,
        href: '#',
        isLocked: true,
    },
    {
        title: 'Head-to-Head',
        description: 'Challenge another user in a live quiz.',
        icon: Trophy,
        href: '#',
        isLocked: true,
    },
    {
        title: 'The Analyst',
        description: 'Interpret data and charts to draw conclusions.',
        icon: BarChart2,
        href: '#',
        isLocked: true,
    },
    {
        title: 'Quote Quest',
        description: 'Attribute famous quotes to the right person.',
        icon: Quote,
        href: '#',
        isLocked: true,
    },
    {
        title: 'The Negotiator',
        description: 'Navigate a negotiation scenario to a successful outcome.',
        icon: Users,
        href: '#',
        isLocked: true,
    },
];


export default function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <div className="space-y-12">
        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Today in 60 seconds
          </h2>
          <DailyBrief />
        </div>
        
        <div>
            <h2 className="mb-4 text-2xl font-bold font-headline">
                Challenge Lobby
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gameModes.map((mode) => (
                <Link href={mode.isLocked ? '#' : mode.href} key={mode.title} className="group">
                <Card
                    className={`group relative overflow-hidden transition-all duration-300 ease-in-out h-full
                    ${mode.isLocked 
                        ? 'cursor-not-allowed bg-white/5 border-white/10' 
                        : 'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20'
                    }`}
                >
                    <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="rounded-md bg-secondary p-3">
                                <mode.icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-lg">
                                {mode.title}
                            </CardTitle>
                        </div>
                        {mode.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    </CardHeader>
                    <CardDescription
                    className="px-8 pb-8"
                    >
                    {mode.description}
                    </CardDescription>
                </Card>
                </Link>
            ))}
            </div>
        </div>


        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            For You
          </h2>
          <ForYouSection />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Trending Topics
          </h2>
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
}
