'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Newspaper, BrainCircuit } from 'lucide-react';
import { placeholderQuizzes } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';

export default function PlayPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Test Your Knowledge
        </h1>
        <p className="mt-2 text-muted-foreground">
          Engage with our quizzes to challenge your intellect and learn
          something new.
        </p>
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-card">
        <div className="flex flex-col items-center p-8 text-center md:flex-row md:text-left md:p-12">
          <Newspaper className="w-16 h-16 mb-4 text-primary md:mb-0 md:mr-8" />
          <div className="flex-grow">
            <h2 className="text-2xl font-bold font-headline">
              Daily News Quiz
            </h2>
            <p className="mt-2 text-muted-foreground">
              A fresh quiz on current events, generated daily by our AI. How
              updated are you?
            </p>
          </div>
          <Button asChild className="mt-6 md:mt-0 shrink-0" size="lg">
            <Link href="/quiz/daily-news/start">
              Start Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">
          Featured Quizzes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderQuizzes.map((quiz) => (
            <Link href="#" key={quiz.id} className="group">
              <Card
                key={quiz.title}
                className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20"
              >
                <CardHeader>
                  <div
                    className="flex items-center gap-4"
                  >
                    <div className="rounded-md bg-secondary p-3">
                      <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-lg">
                        {quiz.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardDescription
                  className="px-8 pb-8"
                >
                  {quiz.description}
                </CardDescription>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
