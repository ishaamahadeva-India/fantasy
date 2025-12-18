'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type QuizQuestionProps = {
  question: string;
  options: string[];
  selectedOption: number | undefined;
  onOptionSelect: (optionIndex: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
};

export function QuizQuestion({
  question,
  options,
  selectedOption,
  onOptionSelect,
  onNext,
  isLastQuestion,
}: QuizQuestionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl leading-relaxed font-serif">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => onOptionSelect(parseInt(value))}
          className="space-y-4"
        >
          {options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`option-${index}`}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOption === index
                  ? 'border-primary bg-primary/10'
                  : 'border-border'
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <span className="ml-4 text-base">{option}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onNext} disabled={selectedOption === undefined}>
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
