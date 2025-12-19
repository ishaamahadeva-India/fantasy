'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';

export function ScoreRating() {
  const [score, setScore] = useState(5);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg">
          <Star className="mr-2" /> Score Movie
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Your Score</h4>
            <p className="text-sm text-muted-foreground">
              Drag the slider to set your score from 0 to 10.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Slider
                    defaultValue={[score]}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setScore(value[0])}
                />
                <span className="font-bold text-lg w-16 text-center font-code">
                    {score.toFixed(1)}
                </span>
            </div>
            <Button onClick={() => setIsOpen(false)}>Submit Score</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
