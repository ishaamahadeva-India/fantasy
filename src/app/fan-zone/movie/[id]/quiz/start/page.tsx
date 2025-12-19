
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BrainCircuit, Clock, Video } from 'lucide-react';
import Link from 'next/link';
import { popularMovies } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';

export default function PreMovieQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const movie = popularMovies.find((m) => m.id === params.id);
  if (!movie) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance">
            Movie Quiz: {movie.title}
          </h1>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Video className="w-4 h-4 mr-2" />
              Frame Lock
            </Badge>
            <Badge variant="outline" className="text-sm">
              <BrainCircuit className="w-4 h-4 mr-2" />
              Trivia
            </Badge>
          </div>
          <div className="flex justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>~3 Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯 5 Questions</span>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <h2 className="text-lg font-semibold font-headline">
            Are you a true fan?
          </h2>
          <p className="mt-1 text-muted-foreground">
            Test your knowledge on {movie.title}. Prove you know every scene,
            character, and line.
          </p>
        </div>

        <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <h3 className="font-semibold">What you'll experience</h3>
          <p className="text-sm text-muted-foreground">
            A mix of questions about the plot, characters, and memorable
            moments from the film.
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50">
          This is a skill-based knowledge quiz. No betting. No real money
          involved.
        </p>

        <div className="flex flex-col items-center w-full gap-2">
          <Button asChild size="lg" className="w-full">
            <Link href={`/fan-zone/movie/${movie.id}/quiz`}>
              Start Quiz <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            No interruptions • ~3 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
