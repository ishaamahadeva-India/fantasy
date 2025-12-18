'use client';
import type { DailyNewsQuizOutput } from '@/ai/flows/daily-news-quiz';
import { useState } from 'react';
import { QuizQuestion } from './quiz-question';
import { QuizCompletion } from './quiz-completion';
import { AnimatePresence, motion } from 'framer-motion';

type Quiz = DailyNewsQuizOutput['quiz'];

type QuizClientProps = {
  quiz: Quiz;
};

function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-colors duration-300 ${
            index <= current ? 'bg-primary' : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}

export function QuizClient({ quiz }: QuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(
    {}
  );
  const [isFinished, setIsFinished] = useState(false);

  const totalQuestions = quiz.length;

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
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col justify-between">
      <div className="py-4">
        <ProgressDots total={totalQuestions} current={currentQuestionIndex} />
        <p className="text-center text-sm text-muted-foreground mt-2">
           Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
      </div>
      <div className="flex-grow flex items-center">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
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
            </motion.div>
        </AnimatePresence>
      </div>
      <div className='h-20' />
    </div>
  );
}
