'use client';
import { summarizeArticle, type SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Article } from '@/lib/types';

export default function BriefingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const firestore = useFirestore();
  const [article, setArticle] = useState<(Article & {id: string}) | null>(null);
  const [summary, setSummary] = useState<SummarizeArticleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSummary, setUserSummary] = useState('');

  useEffect(() => {
    async function fetchArticleAndSummary() {
      if (!firestore) return;
      
      setIsLoading(true);
      const articlesRef = collection(firestore, 'articles');
      const q = query(articlesRef, where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setArticle(null);
        setIsLoading(false);
        return;
      }
      
      const doc = querySnapshot.docs[0];
      const articleData = { id: doc.id, ...doc.data() } as Article & {id: string};
      setArticle(articleData);

      try {
        const result = await summarizeArticle({ articleText: articleData.content });
        setSummary(result);
      } catch (error) {
        console.error("Failed to get summary", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticleAndSummary();
  }, [firestore, slug]);

  const handleSubmit = () => {
    if (!userSummary || !summary || !article) return;

    // Store data in sessionStorage to pass to the results page
    sessionStorage.setItem('briefingData', JSON.stringify({
        articleText: article.content,
        aiSummary: summary.summary,
        userSummary: userSummary
    }));

    router.push(`/briefing/${slug}/results`);
  }

  if (isLoading && !article) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (!article) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 w-full">
        <div className='mb-4'>
             <Button variant="ghost" asChild>
                <Link href={`/briefing/${slug}/start`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Link>
            </Button>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-center mb-2">Intel Briefing</h1>
        <p className="text-center text-muted-foreground mb-8">Test your comprehension and summarization skills.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Source Article</CardTitle>
                    <CardDescription>Read the original article text below.</CardDescription>
                </CardHeader>
                <CardContent className='prose prose-invert max-w-none prose-sm h-96 overflow-y-auto'>
                     <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </CardContent>
            </Card>
            
            <div className="space-y-4">
                <Card>
                     <CardHeader>
                        <CardTitle>AI Summary</CardTitle>
                        <CardDescription>The AI's summary of the article is below.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-40 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <p className="text-muted-foreground">{summary?.summary}</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Turn</CardTitle>
                        <CardDescription>Now, write your own summary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            placeholder="Start writing your summary here..." 
                            className="h-32"
                            value={userSummary}
                            onChange={(e) => setUserSummary(e.target.value)}
                        />
                         <Button className="w-full mt-4" disabled={!userSummary || isLoading} onClick={handleSubmit}>
                            Submit & Compare
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="text-center mt-8">
            <Button variant="ghost" asChild>
                <Link href="/play">Back to Game Modes</Link>
            </Button>
        </div>
    </div>
  );
}
