import { generateDailyNewsQuiz } from '@/ai/flows/daily-news-quiz';
import { QuizClient } from '@/components/quiz/quiz-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function DailyNewsQuizPage() {
  let quizData;
  try {
    quizData = await generateDailyNewsQuiz({ numQuestions: 3 });
  } catch (error) {
    console.error('Failed to generate daily news quiz:', error);
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Error Generating Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We couldn't generate the daily quiz at this moment. Please try
              again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData || !quizData.quiz || quizData.quiz.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The daily quiz could not be loaded. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Daily News Quiz
        </h1>
        <p className="mt-2 text-muted-foreground">
          Test your knowledge of today's headlines.
        </p>
      </div>
      <QuizClient quiz={quizData.quiz} />
    </div>
  );
}
