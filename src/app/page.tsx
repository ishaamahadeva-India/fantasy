
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import {
  Newspaper,
  Mic,
  FileText,
  Video,
  ClipboardCheck,
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
        title: 'Frame Lock',
        description: 'Identify the movie from a single frame.',
        icon: Video,
        href: '/frame-lock/start',
        isLocked: false,
    },
    {
        title: 'Fact or Fiction',
        description: 'Verify statements against a source.',
        icon: ClipboardCheck,
        href: '/fact-or-fiction/ipl-franchise-dynasties/start',
        isLocked: false,
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
             <Carousel
              opts={{
                align: "start",
                slidesToScroll: 'auto',
              }}
              className="w-full"
            >
              <CarouselContent>
                {gameModes.map((mode) => (
                  <CarouselItem key={mode.title} className="sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                       <Link href={mode.isLocked ? '#' : mode.href} className="group h-full block">
                        <Card
                            className={`group relative overflow-hidden transition-all duration-300 ease-in-out h-full
                            ${mode.isLocked 
                                ? 'cursor-not-allowed bg-white/5 border-white/10' 
                                : 'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20'
                            }`}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="rounded-md bg-secondary p-3">
                                        <mode.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="font-headline text-lg">
                                        {mode.title}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardDescription
                            className="px-8 pb-8 pt-0"
                            >
                            {mode.description}
                            </CardDescription>
                        </Card>
                        </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>
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
