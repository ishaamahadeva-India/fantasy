
'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ClipboardCheck, Clock, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Article } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function PreFactOrFictionPage({ params: { slug } }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const [article, setArticle] = useState<Article & { id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!firestore) return;
      setIsLoading(true);
      const articlesRef = collection(firestore, 'articles');
      const q = query(articlesRef, where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setArticle(null);
      } else {
        const doc = querySnapshot.docs[0];
        setArticle({ id: doc.id, ...doc.data() } as Article & { id: string });
      }
      setIsLoading(false);
    }
    fetchArticle();
  }, [firestore, slug]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center gap-8">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance">
                Fact or Fiction: {article.title}
            </h1>
            <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Reading
                </Badge>
                <Badge variant="outline" className="text-sm">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Verification
                </Badge>
            </div>
            <div className="flex justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~3 Minutes</span>
                </div>
            </div>
        </div>

        <div className="relative w-full p-6 overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-video">
             <Image 
                src={`https://picsum.photos/seed/${article.id}/800/450`}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="news article"
             />
             <div className="absolute inset-0 bg-black/50" />
             <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <h3 className="font-semibold text-xl">What you'll experience</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">You will be presented with a series of statements based on an article. Your task is to determine if each statement is a fact or fiction.</p>
             </div>
        </div>
        
        <p className="text-xs text-muted-foreground/50">
            This is a skill-based knowledge challenge. No betting. No real money involved.
        </p>

        <div className="flex flex-col items-center w-full gap-2">
             <Button asChild size="lg" className="w-full">
                <Link href={`/fact-or-fiction/${article.slug}`}>
                    Start Challenge <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
                <Link href="/play">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Game Lobby
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
