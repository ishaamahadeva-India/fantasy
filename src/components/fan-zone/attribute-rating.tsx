
'use client';
import { useState, type ElementType } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRatings } from '@/firebase/firestore/ratings';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

type AttributeRatingProps = {
  triggerButtonText: string;
  attributes: string[];
  icon?: ElementType;
  entityId: string;
  entityType: 'cricketer' | 'team' | 'movie' | 'star';
};

const MAX_REVIEW_LENGTH = 140;

export function AttributeRating({
  triggerButtonText,
  attributes,
  icon: Icon,
  entityId,
  entityType,
}: AttributeRatingProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    attributes.reduce((acc, attr) => ({ ...acc, [attr]: 5 }), {})
  );
  const [review, setReview] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { saveFanRating } = useRatings();
  const { user } = useUser();

  const handleSliderChange = (attr: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [attr]: value[0] }));
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_REVIEW_LENGTH) {
      setReview(e.target.value);
    }
  };
  
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
        ratings: scores,
        ...(review && { review }),
    }, user.uid);

    toast({
        title: "Rating Submitted!",
        description: "Thanks for sharing your opinion. You've earned 25 Intel Points!",
    });

    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          {Icon && <Icon className="mr-2" />}
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Attributes</DialogTitle>
          <DialogDescription>
            Provide a detailed rating and an optional one-line insight.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {attributes.map((attr) => (
            <div key={attr} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={attr} className="text-right col-span-1">
                {attr}
              </Label>
              <Slider
                id={attr}
                defaultValue={[scores[attr]]}
                max={10}
                step={0.1}
                onValueChange={(value) => handleSliderChange(attr, value)}
                className="col-span-2"
              />
              <span className="font-bold text-center font-code w-12 col-span-1">
                {scores[attr].toFixed(1)}
              </span>
            </div>
          ))}
           <div className="space-y-2">
            <Label htmlFor="micro-review">One Line Insight (Optional)</Label>
            <Textarea
              id="micro-review"
              placeholder="Share your one-line insight..."
              value={review}
              onChange={handleReviewChange}
              className="resize-none"
            />
            <p className="text-xs text-right text-muted-foreground">
              {review.length} / {MAX_REVIEW_LENGTH}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Submit Ratings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
