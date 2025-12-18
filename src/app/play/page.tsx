import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
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
          <Button asChild className="mt-6 md:mt-0 shrink-0">
            <Link href="/quiz/daily-news">
              Start Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">
          Featured Quizzes
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderQuizzes.map((quiz) => (
            <Link href="#" key={quiz.id} className="group">
              <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-md bg-secondary">
                      <BrainCircuit className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <Badge variant="secondary">{quiz.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardTitle className="text-lg font-headline">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {quiz.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    {quiz.questions} Questions
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
