
'use client';
import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Gamepad2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRatings } from '@/firebase/firestore/ratings';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

type PulseCheckProps = {
  question: string;
  options: string[];
  entityId: string;
  entityType: 'cricketer' | 'team';
};

export function PulseCheck({ question, options, entityId, entityType }: PulseCheckProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const { saveFanRating } = useRatings();
  const { user } = useUser();

  const handleSubmit = () => {
    if(!selectedValue) return;

    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to vote.",
        });
        return;
    }
    
    // Convert selected option to a numerical rating for consistency
    const ratingValue = options.indexOf(selectedValue);
    
    saveFanRating({
        entityId,
        entityType,
        ratings: { [question]: ratingValue },
        review: selectedValue,
    }, user.uid);

    setHasVoted(true);
    setTimeout(() => {
        setIsOpen(false);
        // Reset state for next time
        setTimeout(() => {
            setHasVoted(false);
            setSelectedValue(null);
        }, 500);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Gamepad2 className="mr-2" />
          Pulse Check
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Pulse Check</DialogTitle>
          <DialogDescription>
            Share your instant reaction. How are you feeling right now?
          </DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
        {hasVoted ? (
            <motion.div
                key="thank-you"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
            >
                <h3 className="text-xl font-semibold">Thanks for your vote!</h3>
                <p className="text-muted-foreground">Your response has been recorded.</p>
            </motion.div>
        ) : (
            <motion.div key="vote-form" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <div className="space-y-4 py-4">
                    <p className="font-semibold">{question}</p>
                    <RadioGroup onValueChange={setSelectedValue} value={selectedValue || ''}>
                        {options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option} className="font-normal">{option}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!selectedValue}>
                        Submit Vote
                    </Button>
                </DialogFooter>
            </motion.div>
        )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
