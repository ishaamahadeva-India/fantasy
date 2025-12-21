

import { generateMovieQuiz } from '@/ai/flows/movie-quiz';
import { QuizClient } from '@/components/quiz/quiz-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

import type { Movie } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';


// We need to get a firestore instance on the server.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);


async function getMovie(id: string): Promise<Movie | null> {
    const movieRef = doc(firestore, 'movies', id);
    const movieSnap = await getDoc(movieRef);
    if (!movieSnap.exists()) {
        return null;
    }
    return movieSnap.data() as Movie;
}


export default async function MovieQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const movie = await getMovie(params.id);
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
