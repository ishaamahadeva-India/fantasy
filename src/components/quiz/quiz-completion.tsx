'use client';
import type { DailyNewsQuizOutput } from '@/ai/flows/daily-news-quiz';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Home, RefreshCw, XCircle } from 'lucide-react';

type Quiz = DailyNewsQuizOutput['quiz'];

type QuizCompletionProps = {
  quiz: Quiz;
  userAnswers: Record<number, number>;
};

export function QuizCompletion({ quiz, userAnswers }: QuizCompletionProps) {
  const score = quiz.reduce((acc, question, index) => {
    if (userAnswers[index] === question.correctAnswerIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);
  const totalQuestions = quiz.length;
  const knowledgeIndex = Math.round((score / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-8 text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Quiz Complete!</CardTitle>
          <CardDescription>Your Knowledge Index for this quiz is:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold font-code text-primary">
            {knowledgeIndex}
          </div>
          <p className="mt-2 text-muted-foreground">
            You answered {score} out of {totalQuestions} questions correctly.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/play">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Another Quiz
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <h2 className="mb-4 text-xl font-bold text-center font-headline">
        Review Your Answers
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {quiz.map((question, index) => {
          const userAnswerIndex = userAnswers[index];
          const isCorrect = userAnswerIndex === question.correctAnswerIndex;
          return (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex items-center gap-4">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className="flex-1 text-left">{question.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="font-serif text-base">{question.explanation}</p>
                <div className="p-4 rounded-md bg-secondary">
                  <p className="text-sm">
                    Your answer:{' '}
                    <span
                      className={`font-semibold ${
                        isCorrect ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {question.options[userAnswerIndex]}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">
                      Correct answer:{' '}
                      <span className="font-semibold text-success">
                        {question.options[question.correctAnswerIndex]}
                      </span>
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
