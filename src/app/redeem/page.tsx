'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Ticket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

// Placeholder rewards data
const rewards = [
  {
    id: 'reward-1',
    title: '20% off Swiggy',
    cost: 500,
    icon: Ticket,
  },
  {
    id: 'reward-2',
    title: '₹100 Amazon Voucher',
    cost: 1000,
    icon: Ticket,
  },
  {
    id: 'reward-3',
    title: 'Free Movie Ticket on BookMyShow',
    cost: 1500,
    icon: Ticket,
  },
    {
    id: 'reward-4',
    title: '3 Months of Gaana Plus',
    cost: 2000,
    icon: Ticket,
  },
];

export default function RedemptionPage() {
  const { user, isLoading } = useUser();
  // TODO: Fetch user points from Firestore user profile
  const userPoints = 1250; // Placeholder

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Redemption Center
        </h1>
        <p className="mt-2 text-muted-foreground">
          Use your Intel Points to claim exclusive rewards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="w-48 h-16" />
          ) : (
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 text-amber-400" />
              <div>
                <p className="text-4xl font-bold font-code text-primary">
                  {userPoints}
                </p>
                <p className="text-sm text-muted-foreground">Intel Points</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">
          Available Rewards
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                    <div className='p-3 bg-secondary rounded-lg'>
                        <reward.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-headline">{reward.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-lg font-semibold text-muted-foreground">
                  Cost: <span className="font-code text-primary">{reward.cost} points</span>
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={userPoints < reward.cost}
                >
                  {userPoints < reward.cost ? 'Not Enough Points' : 'Redeem Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
