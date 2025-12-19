
'use client';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Clock, ThumbsUp, Star, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { AudioPlayer } from '@/components/article/audio-player';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, type Query } from 'firebase/firestore';
import type { Article } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

type ArticleWithId = Article & { id: string };

function ArticleSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 md:py-12">
            <div className='mb-6'>
                <Skeleton className="h-8 w-48" />
            </div>
            <article className="prose prose-invert prose-lg max-w-none">
                <div className="space-y-4 not-prose">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-5 w-24" />
                    </div>
                     <Separator className="my-6" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                <Skeleton className="relative my-8 aspect-video not-prose" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </div>
            </article>
        </div>
    )
}


export default function ArticlePage({ params: { slug } }: { params: { slug: string } }) {
  const firestore = useFirestore();

  const articleQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'articles'), where('slug', '==', slug));
  }, [firestore, slug]);

  const { data: articles, isLoading } = useCollection<ArticleWithId>(articleQuery as Query<ArticleWithId>);
  const article = articles?.[0];
  
  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (!article) {
    notFound();
  }
  
  // Note: hasNarration and article length are not in the DB model. Defaulting for now.
  const hasNarration = false;
  const readLength = "Medium";

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12">
        <div className='mb-6'>
            <Button variant="ghost" asChild>
                <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Intel Hub
                </Link>
            </Button>
        </div>
      <article className="prose prose-invert prose-lg max-w-none">
        <div className="space-y-4 not-prose">
            <Badge variant="secondary">{article.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
                {article.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readLength} Read</span>
                </div>
            </div>
             <Separator className="my-6" />
             <div className="flex items-center gap-4">
                <Button variant="outline">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Like
                </Button>
                 <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Rate
                </Button>
                 <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </div>
        </div>
        
        <div className="relative my-8 aspect-video not-prose">
            <Image 
                src={`https://picsum.photos/seed/${article.id}/1200/600`}
                alt={article.title}
                fill 
                className="object-cover rounded-2xl"
                data-ai-hint="news article"
            />
        </div>

        {hasNarration && (
            <div className='not-prose my-8'>
                <AudioPlayer />
            </div>
        )}

        <p className="font-body text-xl text-foreground/80">{article.excerpt}</p>
        <div className="font-body" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
}
