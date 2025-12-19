
import { generateMovieQuiz } from '@/ai/flows/movie-quiz';
import { QuizClient } from '@/components/quiz/quiz-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { popularMovies } from '@/lib/placeholder-data';
import { AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function MovieQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const movie = popularMovies.find((m) => m.id === params.id);
  if (!movie) {
    notFound();
  }

  let quizData;
  let quizError = false;
  try {
    quizData = await generateMovieQuiz({ movieTitle: movie.title, numQuestions: 5 });
  } catch (error) {
    console.error('Failed to generate movie quiz:', error);
    quizError = true;
  }

  if (quizError || !quizData || !quizData.quiz || quizData.quiz.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="text-destructive" />
              Error Generating Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We couldn't generate a quiz for this movie right now. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <QuizClient quiz={quizData.quiz} />;
}
