'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  TrendingUp,
  Clock,
  Target,
  Award,
  Ticket,
  BarChart3,
  Activity,
  Zap,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import {
  calculateDAU,
  calculateMAU,
  calculateQuizCompletionRate,
  calculateAverageSessionTime,
  calculateBrandEngagementRate,
  calculateCouponRedemptionRate,
  calculateCostPerEngagedUser,
} from '@/lib/metrics';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import type { QuizAttempt, BrandEvent, CouponRedemption, UserEngagement } from '@/lib/analytics-types';
import { format } from 'date-fns';

export default function AnalyticsDashboardPage() {
  const firestore = useFirestore();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');
  
  // Core metrics
  const [dau, setDau] = useState<number>(0);
  const [mau, setMau] = useState<number>(0);
  const [quizCompletionRate, setQuizCompletionRate] = useState<number>(0);
  const [avgSessionTime, setAvgSessionTime] = useState<number>(0);
  
  // Brand metrics
  const [brandEngagementRate, setBrandEngagementRate] = useState<number>(0);
  const [couponRedemptionRate, setCouponRedemptionRate] = useState<number>(0);
  
  // Detailed stats
  const [totalQuizAttempts, setTotalQuizAttempts] = useState<number>(0);
  const [totalQuizCompletions, setTotalQuizCompletions] = useState<number>(0);
  const [totalBrandEvents, setTotalBrandEvents] = useState<number>(0);
  const [totalCouponRedemptions, setTotalCouponRedemptions] = useState<number>(0);
  const [totalEngagedUsers, setTotalEngagedUsers] = useState<number>(0);
  const [topBrands, setTopBrands] = useState<Array<{ brand: string; events: number }>>([]);
  const [recentRedemptions, setRecentRedemptions] = useState<CouponRedemption[]>([]);

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
      case 'week':
        start.setDate(now.getDate() - 7);
        return { start, end: now };
      case 'month':
        start.setMonth(now.getMonth() - 1);
        return { start, end: now };
      default:
        start.setMonth(now.getMonth() - 1);
        return { start, end: now };
    }
  };

  useEffect(() => {
    if (!firestore) return;
    
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const range = getDateRange();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Core metrics
        const [dauValue, mauValue, completionRate, sessionTime] = await Promise.all([
          calculateDAU(firestore, today),
          calculateMAU(firestore, today),
          calculateQuizCompletionRate(firestore, undefined, range),
          calculateAverageSessionTime(firestore, range),
        ]);
        
        setDau(dauValue);
        setMau(mauValue);
        setQuizCompletionRate(completionRate);
        setAvgSessionTime(sessionTime);
        
        // Quiz stats
        const attemptsQuery = query(
          collection(firestore, 'quiz_attempts'),
          where('startedAt', '>=', Timestamp.fromDate(range.start)),
          where('startedAt', '<=', Timestamp.fromDate(range.end))
        );
        const attemptsSnap = await getDocs(attemptsQuery);
        let attempts = 0;
        let completions = 0;
        attemptsSnap.forEach(doc => {
          const data = doc.data() as QuizAttempt;
          attempts++;
          if (data.completed) completions++;
        });
        setTotalQuizAttempts(attempts);
        setTotalQuizCompletions(completions);
        
        // Brand events
        const brandEventsQuery = query(
          collection(firestore, 'brand_events'),
          where('timestamp', '>=', Timestamp.fromDate(range.start)),
          where('timestamp', '<=', Timestamp.fromDate(range.end))
        );
        const brandEventsSnap = await getDocs(brandEventsQuery);
        const brandCounts: Record<string, number> = {};
        let totalEvents = 0;
        brandEventsSnap.forEach(doc => {
          const data = doc.data() as BrandEvent;
          totalEvents++;
          if (data.brand) {
            brandCounts[data.brand] = (brandCounts[data.brand] || 0) + 1;
          }
        });
        setTotalBrandEvents(totalEvents);
        setTopBrands(
          Object.entries(brandCounts)
            .map(([brand, events]) => ({ brand, events }))
            .sort((a, b) => b.events - a.events)
            .slice(0, 5)
        );
        
        // Coupon redemptions
        const redemptionsQuery = query(
          collection(firestore, 'coupon_redemptions'),
          where('redeemedAt', '>=', Timestamp.fromDate(range.start)),
          where('redeemedAt', '<=', Timestamp.fromDate(range.end)),
          orderBy('redeemedAt', 'desc'),
          limit(10)
        );
        const redemptionsSnap = await getDocs(redemptionsQuery);
        const redemptions: CouponRedemption[] = [];
        redemptionsSnap.forEach(doc => {
          redemptions.push({ id: doc.id, ...doc.data() } as CouponRedemption);
        });
        setTotalCouponRedemptions(redemptions.length);
        setRecentRedemptions(redemptions);
        
        // Engaged users
        const usersQuery = query(
          collection(firestore, 'users'),
          where('isEngaged', '==', true)
        );
        const usersSnap = await getDocs(usersQuery);
        setTotalEngagedUsers(usersSnap.size);
        
        // Brand engagement rate (sample - using first brand if available)
        if (topBrands.length > 0) {
          const rate = await calculateBrandEngagementRate(
            firestore,
            topBrands[0].brand,
            range
          );
          setBrandEngagementRate(rate);
        }
        
        // Coupon redemption rate
        if (topBrands.length > 0) {
          const rate = await calculateCouponRedemptionRate(
            firestore,
            topBrands[0].brand,
            undefined,
            range
          );
          setCouponRedemptionRate(rate);
        }
        
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalytics();
  }, [firestore, dateRange]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    subtitle,
    gradient 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType;
    subtitle?: string;
    gradient?: string;
  }) => (
    <Card className={gradient ? `bg-gradient-to-br ${gradient} border-0 text-white` : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`w-5 h-5 ${gradient ? 'text-white/80' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${gradient ? 'text-white' : ''}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {subtitle && (
              <p className={`text-xs mt-1 ${gradient ? 'text-white/70' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive user engagement and brand performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('today')}
          >
            Today
          </Button>
          <Button
            variant={dateRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('week')}
          >
            Week
          </Button>
          <Button
            variant={dateRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Active Users"
          value={dau}
          icon={Users}
          subtitle="Users active today"
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Monthly Active Users"
          value={mau}
          icon={TrendingUp}
          subtitle="Users active this month"
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Quiz Completion Rate"
          value={`${quizCompletionRate.toFixed(1)}%`}
          icon={Target}
          subtitle={`${totalQuizCompletions} of ${totalQuizAttempts} completed`}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Avg Session Time"
          value={formatDuration(avgSessionTime)}
          icon={Clock}
          subtitle="Average user session duration"
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Engaged Users"
          value={totalEngagedUsers}
          icon={Zap}
          subtitle="Users who completed quizzes or interacted with brands"
        />
        <StatCard
          title="Brand Engagement Rate"
          value={`${brandEngagementRate.toFixed(1)}%`}
          icon={Activity}
          subtitle="Users who clicked brand content"
        />
        <StatCard
          title="Coupon Redemption Rate"
          value={`${couponRedemptionRate.toFixed(1)}%`}
          icon={Ticket}
          subtitle={`${totalCouponRedemptions} redemptions`}
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="quizzes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
          <TabsTrigger value="brands">Brand Analytics</TabsTrigger>
          <TabsTrigger value="redemptions">Coupon Redemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Statistics</CardTitle>
              <CardDescription>
                Quiz performance metrics for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Attempts</div>
                    <div className="text-2xl font-bold mt-1">{totalQuizAttempts.toLocaleString()}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="text-2xl font-bold mt-1 text-green-600">
                      {totalQuizCompletions.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Abandoned</div>
                    <div className="text-2xl font-bold mt-1 text-orange-600">
                      {(totalQuizAttempts - totalQuizCompletions).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Brands</CardTitle>
              <CardDescription>
                Brands with the most interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : topBrands.length > 0 ? (
                <div className="space-y-2">
                  {topBrands.map((item, index) => (
                    <div
                      key={item.brand}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{item.brand}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {item.events.toLocaleString()} events
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No brand events found for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Coupon Redemptions</CardTitle>
              <CardDescription>
                Latest coupon redemptions across all brands
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentRedemptions.length > 0 ? (
                <div className="space-y-2">
                  {recentRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Ticket className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{redemption.brand}</div>
                          <div className="text-sm text-muted-foreground">
                            Code: {redemption.couponCode}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {redemption.orderValue && (
                          <div className="font-semibold">
                            ₹{redemption.orderValue.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {redemption.redeemedAt && (() => {
                            let date: Date;
                            if (redemption.redeemedAt instanceof Timestamp) {
                              date = redemption.redeemedAt.toDate();
                            } else if (redemption.redeemedAt instanceof Date) {
                              date = redemption.redeemedAt;
                            } else {
                              date = new Date(redemption.redeemedAt as any);
                            }
                            return format(date, 'MMM d, yyyy HH:mm');
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No coupon redemptions found for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

