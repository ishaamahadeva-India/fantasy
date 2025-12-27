'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, TrendingUp, Users, Award, History, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getCampaignPointTransactions } from '@/firebase/firestore/point-transactions';
import type { PointTransaction } from '@/firebase/firestore/point-transactions';
import { format } from 'date-fns';

export default function PointsManagementPage() {
  const firestore = useFirestore();
  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPointsDistributed: 0,
    totalUsers: 0,
    totalTransactions: 0,
  });

  const campaignsRef = firestore ? collection(firestore, 'fantasy-campaigns') : null;
  const { data: campaigns } = useCollection(campaignsRef);

  useEffect(() => {
    if (!firestore) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recent transactions
        const transactionsRef = collection(firestore, 'point_transactions');
        const transactionsQuery = query(
          transactionsRef,
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const transactionsSnap = await getDocs(transactionsQuery);
        const transactions: PointTransaction[] = [];
        transactionsSnap.forEach(doc => {
          const data = doc.data();
          let createdAt: Date;
          if (data.createdAt?.toDate) {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else {
            createdAt = new Date();
          }
          transactions.push({
            id: doc.id,
            ...data,
            createdAt,
          } as PointTransaction);
        });
        setRecentTransactions(transactions);

        // Calculate stats
        const totalPointsDistributed = transactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
        const uniqueUsers = new Set(transactions.map(t => t.userId)).size;
        
        setStats({
          totalPointsDistributed,
          totalUsers: uniqueUsers,
          totalTransactions: transactions.length,
        });
      } catch (error) {
        console.error('Failed to fetch points data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [firestore]);

  const campaignsWithDistributions = campaigns?.filter(
    (campaign: any) => campaign.pointsDistributed === true
  ) || [];

  const transactionTypeLabels: Record<string, string> = {
    campaign_earned: 'Campaign',
    quiz_completed: 'Quiz',
    rating_submitted: 'Rating',
    redemption: 'Redemption',
    admin_adjustment: 'Admin',
    refund: 'Refund',
    bonus: 'Bonus',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Points Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage and track QuizzBuzz points distribution across the platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Distributed</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold font-code">
                  {stats.totalPointsDistributed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users with Points</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold font-code">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Unique users</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold font-code">{stats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common points management tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/users">
              <Users className="w-4 h-4 mr-2" />
              Manage User Points
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/fantasy">
              <Award className="w-4 h-4 mr-2" />
              Campaign Results
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="distributions">Campaign Distributions</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Point Transactions</CardTitle>
              <CardDescription>Latest point transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.slice(0, 20).map((transaction) => {
                    const isPositive = transaction.amount > 0;
                    const date = transaction.createdAt instanceof Date 
                      ? transaction.createdAt 
                      : new Date(transaction.createdAt as any);

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-orange-100'}`}>
                            {isPositive ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-orange-600 rotate-180" />
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
                              User: {transaction.userId.slice(0, 8)}... • {format(date, 'MMM d, yyyy h:mm a')}
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Point Distributions</CardTitle>
              <CardDescription>Campaigns where points have been distributed</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : campaignsWithDistributions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No campaign distributions yet. Points are distributed from the campaign results page.
                </p>
              ) : (
                <div className="space-y-3">
                  {campaignsWithDistributions.map((campaign: any) => {
                    const distributionStats = campaign.pointsDistributionStats || {};
                    const distributedAt = campaign.pointsDistributedAt?.toDate 
                      ? campaign.pointsDistributedAt.toDate() 
                      : campaign.pointsDistributedAt instanceof Date
                      ? campaign.pointsDistributedAt
                      : null;

                    return (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{campaign.title || campaign.name || 'Untitled Campaign'}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>
                              <Users className="w-4 h-4 inline mr-1" />
                              {distributionStats.totalUsers || 0} users
                            </span>
                            <span>
                              <Coins className="w-4 h-4 inline mr-1" />
                              {distributionStats.totalPointsDistributed?.toLocaleString() || 0} points
                            </span>
                            {distributedAt && (
                              <span>{format(distributedAt, 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/fantasy/campaign/${campaign.id}/results`}>
                            View Results
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

