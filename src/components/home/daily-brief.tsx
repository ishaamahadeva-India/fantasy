import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, PlayCircle } from 'lucide-react';

export function DailyBrief() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline">Today in 60 Seconds</CardTitle>
        <CardDescription>
          Your daily audio brief and a 3-question quiz on today's most
          important events.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <Button variant="outline" size="lg" className="w-full">
            <PlayCircle className="w-6 h-6 mr-2" />
            Play Audio Brief
        </Button>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/quiz/daily-news">
            Take the Daily Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
