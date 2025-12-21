
'use client';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Newspaper,
  Mic,
  FileText,
  Video,
  ClipboardCheck,
  BrainCircuit,
  Lock,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Article } from '@/lib/types';


export default function PlayPage() {
  const firestore = useFirestore();
  const articlesQuery = firestore ? query(collection(firestore, 'articles'), limit(1)) : null;
  const { data: articles, isLoading } = useCollection<Article & {id: string}>(articlesQuery);
  const firstArticleSlug = articles?.[0]?.slug;

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
          href: firstArticleSlug ? `/briefing/${firstArticleSlug}/start` : '#',
          isLocked: isLoading || !firstArticleSlug,
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
          href: firstArticleSlug ? `/fact-or-fiction/${firstArticleSlug}/start` : '#',
          isLocked: isLoading || !firstArticleSlug,
      },
      {
          title: 'Decision Room',
          description: 'Make critical decisions in complex scenarios.',
          icon: BrainCircuit,
          href: '#',
          isLocked: true,
      },
      {
          title: 'Precision Run',
          description: 'Answer as many questions as you can in 60 seconds.',
          icon: Target,
          href: '#',
          isLocked: true,
      },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-12">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">
                Challenge Lobby
            </h1>
            <p className="mt-2 text-muted-foreground">
                Engage with our skill-based games to challenge your intellect and learn something new.
            </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gameModes.map((mode) => (
            <Link href={mode.isLocked ? '#' : mode.href} key={mode.title} className="group">
            <Card
                className={`group relative overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col
                ${mode.isLocked 
                    ? 'cursor-not-allowed bg-white/5 border-white/10' 
                    : 'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20'
                }`}
            >
                <CardHeader className='flex-grow'>
                  <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                          <div className="rounded-md bg-secondary p-3">
                              <mode.icon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle className="font-headline text-lg">
                              {mode.title}
                          </CardTitle>
                      </div>
                      {mode.isLocked && (mode.title === 'Fact or Fiction' || mode.title === 'Intel Briefing') && isLoading ? 
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" /> : 
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      }
                  </div>
                   <CardDescription className="pt-4">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardHeader>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        Play Now <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                </CardHeader>
            </Card>
            </Link>
        ))}
        </div>
    </div>
  );
}
