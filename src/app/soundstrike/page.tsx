import { generateSoundstrikeQuiz } from '@/ai/flows/soundstrike-quiz';
import { QuizClient } from '@/components/quiz/quiz-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function SoundstrikePage() {
  let quizData;
  let quizError = false;
  try {
    quizData = await generateSoundstrikeQuiz({ numQuestions: 3 });
  } catch (error) {
    console.error('Failed to generate Soundstrike quiz:', error);
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
              We couldn't generate the Soundstrike quiz at this moment. Please try
              again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <QuizClient quiz={quizData.quiz} />;
}
