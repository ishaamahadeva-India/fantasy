'use client';

import { compareSummaries, type CompareSummariesOutput } from '@/ai/flows/compare-summaries';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { useParams } from 'next/navigation';

function ScoreDisplay({ score, label }: { score: number, label: string }) {
    return (
        <div className="text-center">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-4xl font-bold font-code text-primary">{score}</p>
        </div>
    )
}

export default function BriefingResultsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [results, setResults] = useState<CompareSummariesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaries, setSummaries] = useState<{aiSummary: string, userSummary: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('briefingData');
    if (!storedData) {
      setError("Briefing data not found. Please start the challenge again.");
      setIsLoading(false);
      return;
    }

    const data = JSON.parse(storedData);
    setSummaries({ aiSummary: data.aiSummary, userSummary: data.userSummary });

    const getComparison = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const comparisonResult = await compareSummaries(data);
        setResults(comparisonResult);
      } catch (e: any) {
        console.error("Failed to get comparison", e);
        setError(e.message || "An unknown error occurred while analyzing your summary.");
      } finally {
        setIsLoading(false);
      }
    };

    getComparison();
  }, []);

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-2xl font-headline">Analyzing Your Summary...</h2>
            <p className="text-muted-foreground">The AI is comparing your work against the source article.</p>
        </div>
    );
  }

  if (error) {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
             <Button asChild className="mt-4">
                <Link href={`/briefing/${slug}/start`}>Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!results) {
    return <div className="text-center">No results to display.</div>;
  }

  const pointsEarned = Math.round(results.overallScore);

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 w-full space-y-8">
       <div>
            <Button variant="ghost" asChild>
                <Link href={`/briefing/${slug}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Challenge
                </Link>
            </Button>
        </div>
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Briefing Results</CardTitle>
          <CardDescription>Here's the breakdown of your summary performance.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className='text-center'>
                    <p className="text-muted-foreground">Overall Score</p>
                    <p className="text-7xl font-bold font-code text-primary mb-2">{results.overallScore}</p>
                </div>
                 <div className='text-center'>
                    <p className="text-muted-foreground">Intel Points Earned</p>
                    <p className="text-7xl font-bold font-code text-primary flex items-center justify-center gap-2">
                        <Award className="w-16 h-16 text-amber-400" />
                        {pointsEarned}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
                <ScoreDisplay score={results.accuracyScore} label="Accuracy" />
                <ScoreDisplay score={results.coverageScore} label="Coverage" />
                <ScoreDisplay score={results.concisenessScore} label="Conciseness" />
            </div>
             <Card className="text-left bg-white/5">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">AI Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{results.feedback}</p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Your Summary</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none prose-sm">
                <p>{summaries?.userSummary}</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>AI Summary</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none prose-sm">
                <p>{summaries?.aiSummary}</p>
            </CardContent>
        </Card>
      </div>

       <div className="text-center mt-8">
            <Button variant="ghost" asChild>
                <Link href="/play">Back to Game Modes</Link>
            </Button>
        </div>
    </div>
  );
}
