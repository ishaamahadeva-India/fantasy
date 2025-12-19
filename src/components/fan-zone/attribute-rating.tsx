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

type AttributeRatingProps = {
  triggerButtonText: string;
  attributes: string[];
  icon?: ElementType;
};

export function AttributeRating({
  triggerButtonText,
  attributes,
  icon: Icon,
}: AttributeRatingProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    attributes.reduce((acc, attr) => ({ ...acc, [attr]: 5 }), {})
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSliderChange = (attr: string, value: number[]) => {
    setScores((prev) => ({ ...prev, [attr]: value[0] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          {Icon && <Icon className="mr-2" />}
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Attributes</DialogTitle>
          <DialogDescription>
            Provide a detailed rating for each attribute from 0 to 10.
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
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Submit Ratings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
