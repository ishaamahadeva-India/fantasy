'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AudioPlayer } from '@/components/article/audio-player';

type QuizQuestionProps = {
  question: string;
  audioDataUri?: string;
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
  audioDataUri,
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
    <div className="relative w-full">
      <div className="text-center space-y-8">
        {audioDataUri && !hasAnswered && (
          <div className="max-w-md mx-auto">
            <AudioPlayer audioSrc={audioDataUri} autoPlay />
          </div>
        )}

        <h1 
          className="text-3xl md:text-4xl font-serif text-balance"
        >
            {question}
        </h1>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = correctAnswerIndex === index;
            let state: 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled' = 'default';

            if (hasAnswered) {
                if(isCorrect) state = 'correct';
                else if (isSelected && !isCorrect) state = 'incorrect';
                else state = 'disabled';
            }

            return (
              <motion.button
                key={index}
                onClick={() => onOptionSelect(index)}
                disabled={hasAnswered}
                initial={false}
                animate={
                  state === 'incorrect' ? {
                    x: [-1, 1.5, -1.5, 1.5, -1.5, 1, -1, 0].map(v => v * 5)
                  } : {}
                }
                transition={ state === 'incorrect' ? { duration: 0.4, ease: "easeInOut" } : {}}
                className={`relative flex items-center justify-start p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 min-h-[72px] text-left text-lg w-full
                  ${
                    state === 'default' && 'border-white/20 bg-white/5 hover:border-primary/50 hover:bg-white/10'
                  }
                  ${
                    state === 'correct' && 'border-green-400 bg-green-500/10 ring-2 ring-green-400 text-white'
                  }
                  ${
                    state === 'incorrect' && 'border-red-400 bg-red-500/10 text-white'
                  }
                  ${
                    state === 'disabled' && 'border-white/10 bg-white/5 opacity-50'
                  }
                `}
              >
                <span className="font-medium flex-1">{option}</span>
                {state === 'correct' && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-green-400 text-black"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                {state === 'incorrect' && (
                   <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-red-400 text-white"
                   >
                    <X className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            className="fixed bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background via-background to-transparent"
          >
            <div className='max-w-2xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg'>
                <p className="font-serif text-lg text-center text-muted-foreground mb-4">
                    {explanation}
                </p>
                <Button onClick={onNext} size="lg" className="w-full">
                    {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
