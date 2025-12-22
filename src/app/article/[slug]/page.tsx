
'use client';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Clock, ThumbsUp, Star, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { AudioPlayer } from '@/components/article/audio-player';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { SocialShare } from '@/components/social-share';
import { useEffect } from 'react';
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


export default function ArticlePage() {
  const firestore = useFirestore();
  const params = useParams();
  const slug = params.slug as string;

  const articleQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'articles'), where('slug', '==', slug));
  }, [firestore, slug]);

  const { data: articles, isLoading } = useCollection<ArticleWithId>(articleQuery as Query<ArticleWithId>);
  const article = articles?.[0];
  
  // Note: hasNarration and article length are not in the DB model. Defaulting for now.
  const hasNarration = false;
  const readLength = "Medium";
  
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const articleImage = article?.imageUrl || (article?.id ? `https://picsum.photos/seed/${article.id}/1200/600` : '');

  // Set Open Graph meta tags for social sharing - MUST be called before any early returns
  useEffect(() => {
    if (typeof document !== 'undefined' && article) {
      // Remove existing meta tags
      const existingTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      existingTags.forEach(tag => tag.remove());

      // Add Open Graph tags
      const ogTags = [
        { property: 'og:title', content: article.title },
        { property: 'og:description', content: article.excerpt },
        { property: 'og:image', content: articleImage },
        { property: 'og:url', content: articleUrl },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: article.title },
        { name: 'twitter:description', content: article.excerpt },
        { name: 'twitter:image', content: articleImage },
      ];

      ogTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.property) {
          meta.setAttribute('property', tag.property);
        } else {
          meta.setAttribute('name', tag.name!);
        }
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });
    }
  }, [article, articleUrl, articleImage]);

  // Early returns AFTER all hooks are called
  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12">
        <div className='mb-6'>
            <Button variant="ghost" asChild className="-ml-2 md:-ml-0">
                <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Back to quizzbuzz</span>
                    <span className="sm:hidden">Back</span>
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
                 <SocialShare
                    url={articleUrl}
                    title={article.title}
                    description={article.excerpt}
                    imageUrl={articleImage}
                    variant="outline"
                />
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
