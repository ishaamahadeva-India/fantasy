
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
import { useRatings } from '@/firebase/firestore/ratings';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export function ScoreRating({ entityId, entityType }: { entityId: string, entityType: 'movie' | 'star' }) {
  const [score, setScore] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  const { saveFanRating } = useRatings();
  const { user } = useUser();

  const handleSubmit = () => {
     if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit a rating.",
        });
        return;
    }
    
    saveFanRating({
        entityId,
        entityType,
        ratings: { overallScore: score },
    }, user.uid);

    toast({
        title: "Rating Submitted!",
        description: `You gave a score of ${score.toFixed(1)}. You've earned 10 quizzbuzz Points!`,
    });

    setIsOpen(false);
  }

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
            <Button onClick={handleSubmit}>Submit Score</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
