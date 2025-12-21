
'use client';
import { generateFrameLockQuiz, type FrameLockQuizOutput } from '@/ai/flows/frame-lock-quiz';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

export default function FrameLockPage() {
  const [gameData, setGameData] = useState<FrameLockQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userAnswer, setUserAnswer] = useState<number | null>(null);

  useEffect(() => {
    const getGameData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateFrameLockQuiz();
        setGameData(result);
      } catch (e: any) {
        console.error("Failed to get game data", e);
        setError(e.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    getGameData();
  }, []);

  const handleAnswer = (answerIndex: number) => {
    if (userAnswer !== null) return; // Lock answer
    setUserAnswer(answerIndex);
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-2xl font-headline">Generating Your Challenge...</h2>
            <p className="text-muted-foreground">The AI is creating a unique movie frame for you to identify.</p>
        </div>
    );
  }

  if (error || !gameData) {
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
            <p className="text-muted-foreground">{error || "Could not load game data."}</p>
             <Button asChild className="mt-4">
                <Link href="/play">Back to Games</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAnswered = userAnswer !== null;
  const currentStatement = gameData;

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between">
        <div className="flex-grow flex items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key="frame-lock-question"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full text-center space-y-8"
                >
                    <h2 className="text-3xl md:text-4xl font-serif text-balance">{currentStatement.question}</h2>
                    
                    <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
                        <Image 
                            src={currentStatement.imageDataUri}
                            alt="Movie frame to identify"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {currentStatement.options.map((option, index) => {
                            const isSelected = userAnswer === index;
                            const isCorrect = currentStatement.correctAnswerIndex === index;
                            let state: 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled' = 'default';

                            if (hasAnswered) {
                                if(isCorrect) state = 'correct';
                                else if (isSelected && !isCorrect) state = 'incorrect';
                                else state = 'disabled';
                            }
                            
                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={hasAnswered}
                                    initial={false}
                                    animate={
                                    state === 'incorrect' ? {
                                        x: [-1, 1.5, -1.5, 1.5, -1.5, 1, -1, 0].map(v => v * 5)
                                    } : {}
                                    }
                                    transition={ state === 'incorrect' ? { duration: 0.4, ease: "easeInOut" } : {}}
                                    className={`relative flex items-center justify-start p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 min-h-[60px] text-left text-lg w-full
                                    ${
                                        state === 'default' && 'border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/10'
                                    }
                                    ${
                                        state === 'correct' && 'border-green-400 bg-green-500/10 ring-2 ring-green-400 text-white'
                                    }
                                    ${
                                        state === 'incorrect' && 'border-red-400 bg-red-500/10 text-white'
                                    }
                                    ${
                                        state === 'disabled' && 'border-white/10 bg-white/5 opacity-50'
                                    }
                                    `}
                                >
                                    <span className="font-medium flex-1">{option}</span>
                                     {state === 'correct' && (
                                    <motion.div 
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-green-400 text-black"
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                    )}
                                    {state === 'incorrect' && (
                                    <motion.div 
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-red-400 text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
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
                    {userAnswer === currentStatement.correctAnswerIndex ? (
                        <h3 className="text-xl font-bold text-green-400">Correct!</h3>
                    ) : (
                        <h3 className="text-xl font-bold text-red-400">Incorrect.</h3>
                    )}
                </div>
                <p className="font-serif text-lg text-center text-muted-foreground mb-4">
                    {currentStatement.explanation}
                </p>
                <Button asChild size="lg" className="w-full">
                     <Link href="/frame-lock/start">
                        Play Again <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className='h-20' />
    </div>
  );
}
