import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, BookOpen, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Greeting } from './greeting';

export function Hero() {
  return (
    <div className="space-y-6">
      <Greeting />
      <Card className="bg-gradient-to-br from-primary/10 to-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge>Today's Featured Quiz</Badge>
              <CardTitle className="mt-2 text-2xl font-headline">
                The AI Revolution
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                <Mic className="w-3 h-3 mr-1" /> Audio
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>3 min</span>
            </div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              <span>Medium</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/quiz/daily-news/start">
              Start Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground/50 w-full">
            Skill-based. No betting. Learn & win rewards.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
