'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { getUserPointTransactions } from '@/firebase/firestore/point-transactions';
import type { PointTransaction } from '@/firebase/firestore/point-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, Coins, History } from 'lucide-react';
import { format } from 'date-fns';

const transactionTypeLabels: Record<string, string> = {
  campaign_earned: 'Campaign Points',
  quiz_completed: 'Quiz Completed',
  rating_submitted: 'Rating Submitted',
  redemption: 'Reward Redeemed',
  admin_adjustment: 'Admin Adjustment',
  refund: 'Refund',
  bonus: 'Bonus Points',
};

const transactionTypeColors: Record<string, string> = {
  campaign_earned: 'bg-blue-100 text-blue-800',
  quiz_completed: 'bg-green-100 text-green-800',
  rating_submitted: 'bg-purple-100 text-purple-800',
  redemption: 'bg-orange-100 text-orange-800',
  admin_adjustment: 'bg-gray-100 text-gray-800',
  refund: 'bg-yellow-100 text-yellow-800',
  bonus: 'bg-pink-100 text-pink-800',
};

export function PointHistory({ limit: limitCount = 20 }: { limit?: number }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user) {
      setIsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await getUserPointTransactions(firestore, user.uid, limitCount);
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch point transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [firestore, user, limitCount]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Point History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Point History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No point transactions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Point History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => {
          const isPositive = transaction.amount > 0;
          const date = transaction.createdAt instanceof Date 
            ? transaction.createdAt 
            : new Date(transaction.createdAt as any);

          return (
            <div
              key={transaction.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {isPositive ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${transactionTypeColors[transaction.type] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {transactionTypeLabels[transaction.type] || transaction.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(date, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p
                  className={`font-semibold font-code ${
                    isPositive ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {transaction.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Balance: {transaction.balanceAfter}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

