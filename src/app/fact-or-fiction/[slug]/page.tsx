'use client';
import { generateFactOrFiction, type FactOrFictionOutput } from '@/ai/flows/fact-or-fiction';
import { placeholderArticles } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, ArrowRight, Check, X, Award } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';


export default function FactOrFictionPage({ params: { slug } }: { params: { slug: string } }) {
  const article = placeholderArticles.find((a) => a.slug === slug);
  const [gameData, setGameData] = useState<FactOrFictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!article) return;

    const getGameData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateFactOrFiction({ articleText: article.content, numStatements: 5 });
        if (!result.statements || result.statements.length === 0) {
            throw new Error("The AI failed to generate any statements.");
        }
        setGameData(result);
      } catch (e: any) {
        console.error("Failed to get game data", e);
        setError(e.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    getGameData();
  }, [article]);

  const handleAnswer = (answer: boolean) => {
    if (userAnswer !== null) return; // Lock answer
    setUserAnswer(answer);

    const isCorrect = answer === gameData!.statements[currentIndex].isFact;
    if (isCorrect) {
        setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < gameData!.statements.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserAnswer(null);
    } else {
        setIsFinished(true);
    }
  };


  if (!article) {
    return notFound();
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-2xl font-headline">Generating Challenge...</h2>
            <p className="text-muted-foreground">The AI is analyzing the article to create your Fact or Fiction questions.</p>
        </div>
    );
  }

  if (error) {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="text-destructive" />
              Error Generating Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
             <Button asChild className="mt-4">
                <Link href="/play">Back to Games</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isFinished) {
    const totalQuestions = gameData?.statements.length || 0;
    const percentage = totalQuestions > 0 ? Math.round((score/totalQuestions) * 100) : 0;
    const pointsEarned = percentage;
    return (
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle className='font-headline text-3xl'>Challenge Complete!</CardTitle>
                <CardDescription>You scored {score} out of {totalQuestions}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-muted-foreground">Accuracy</p>
                        <p className="text-6xl font-bold font-code text-primary">
                            {percentage}%
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Intel Points Earned</p>
                        <p className="text-6xl font-bold font-code text-primary flex items-center justify-center gap-2">
                            <Award className="w-12 h-12 text-amber-400" />
                            {pointsEarned}
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/play">Play another game</Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  const currentStatement = gameData!.statements[currentIndex];
  const hasAnswered = userAnswer !== null;

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col justify-between">
        <div className="py-4">
            <Progress value={((currentIndex + 1) / gameData!.statements.length) * 100} />
            <p className="text-center text-sm text-muted-foreground mt-2">
                Statement {currentIndex + 1} of {gameData!.statements.length}
            </p>
        </div>
        <div className="flex-grow flex items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full text-center space-y-8"
                >
                    <h2 className="text-3xl md:text-4xl font-serif text-balance">"{currentStatement.statement}"</h2>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <Button 
                            onClick={() => handleAnswer(true)} 
                            disabled={hasAnswered}
                            className={`h-24 text-2xl font-bold ${hasAnswered && (currentStatement.isFact ? 'bg-green-500' : 'bg-white/10 opacity-50')}`}
                        >
                            <Check className='w-8 h-8 mr-2'/> Fact
                        </Button>
                        <Button 
                            onClick={() => handleAnswer(false)} 
                            disabled={hasAnswered}
                            className={`h-24 text-2xl font-bold ${hasAnswered && (!currentStatement.isFact ? 'bg-green-500' : 'bg-white/10 opacity-50')}`}
                        >
                            <X className='w-8 h-8 mr-2'/> Fiction
                        </Button>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>
        
        <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            className="fixed bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background via-background to-transparent"
          >
            <div className='max-w-2xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg'>
                <div className='text-center mb-4'>
                    {userAnswer === currentStatement.isFact ? (
                        <h3 className="text-xl font-bold text-green-400">Correct!</h3>
                    ) : (
                        <h3 className="text-xl font-bold text-red-400">Incorrect.</h3>
                    )}
                </div>
                <p className="font-serif text-lg text-center text-muted-foreground mb-4">
                    {currentStatement.explanation}
                </p>
                <Button onClick={handleNext} size="lg" className="w-full">
                     {currentIndex === gameData!.statements.length - 1 ? 'Finish Challenge' : 'Next Statement'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className='h-20' />
    </div>
  );
}
