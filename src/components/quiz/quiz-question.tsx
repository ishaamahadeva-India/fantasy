'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type QuizQuestionProps = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  selectedOption: number | undefined;
  onOptionSelect: (optionIndex: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
  explanation: string;
};

export function QuizQuestion({
  question,
  options,
  correctAnswerIndex,
  selectedOption,
  onOptionSelect,
  onNext,
  isLastQuestion,
  explanation,
}: QuizQuestionProps) {
  const hasAnswered = selectedOption !== undefined;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl leading-relaxed text-center font-serif">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = correctAnswerIndex === index;
            let state = 'default';
            if (hasAnswered) {
              if (isCorrect) state = 'correct';
              else if (isSelected && !isCorrect) state = 'incorrect';
            }

            return (
              <button
                key={index}
                onClick={() => onOptionSelect(index)}
                disabled={hasAnswered}
                className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 min-h-[80px] text-left
                  ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-white/10 hover:border-primary/50'
                  }
                  ${state === 'correct' && 'border-green-500 bg-green-500/10'}
                  ${
                    state === 'incorrect' && 'border-red-500 bg-red-500/10'
                  }
                  ${hasAnswered && 'cursor-not-allowed'}
                `}
              >
                <span className="text-lg font-medium flex-1">{option}</span>
                {state === 'correct' && (
                  <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {state === 'incorrect' && (
                  <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
                    <X className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 p-6 bg-white/5">
        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full text-center"
            >
              <p className="font-serif text-lg text-muted-foreground mb-4">
                {explanation}
              </p>
              <Button onClick={onNext} size="lg">
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardFooter>
    </Card>
  );
}
