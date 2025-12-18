'use client';
import type { DailyNewsQuizOutput } from '@/ai/flows/daily-news-quiz';
import { useState } from 'react';
import { QuizQuestion } from './quiz-question';
import { QuizCompletion } from './quiz-completion';
import { Progress } from '@/components/ui/progress';

type Quiz = DailyNewsQuizOutput['quiz'];

type QuizClientProps = {
  quiz: Quiz;
};

export function QuizClient({ quiz }: QuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(
    {}
  );
  const [isFinished, setIsFinished] = useState(false);

  const totalQuestions = quiz.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return; // Lock answer

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return <QuizCompletion quiz={quiz} userAnswers={selectedAnswers} />;
  }

  const currentQuestion = quiz[currentQuestionIndex];
  const selectedOption = selectedAnswers[currentQuestionIndex];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <QuizQuestion
        question={currentQuestion.question}
        options={currentQuestion.options}
        correctAnswerIndex={currentQuestion.correctAnswerIndex}
        selectedOption={selectedOption}
        onOptionSelect={handleAnswerSelect}
        onNext={handleNext}
        isLastQuestion={currentQuestionIndex === totalQuestions - 1}
        explanation={currentQuestion.explanation || ''}
      />
    </div>
  );
}
