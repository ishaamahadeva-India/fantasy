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
    <Card className="grid md:grid-cols-2 items-center">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Today in 60 Seconds
        </CardTitle>
        <CardDescription>
          Your daily audio brief and a 3-question quiz on today's most
          important events.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-4 p-8 pt-0 md:pt-8">
        <Button variant="outline" size="lg">
          <PlayCircle className="w-6 h-6 mr-2" />
          Play Audio Brief
        </Button>
        <Button asChild size="lg">
          <Link href="/quiz/daily-news/start">
            Take the Daily Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
