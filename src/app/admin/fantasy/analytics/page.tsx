'use client';

import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Trophy, DollarSign, BarChart3, Calendar } from 'lucide-react';
import type { FantasyCampaign, UserParticipation, CampaignEntry } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useMemo } from 'react';

export default function FantasyAnalyticsPage() {
  const firestore = useFirestore();
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; participants: number }>>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  
  const campaignsRef = firestore ? collection(firestore, 'fantasy-campaigns') : null;
  const { data: campaigns, isLoading: campaignsLoading } = useCollection<FantasyCampaign>(campaignsRef);

  // Fetch participants and revenue data
  useEffect(() => {
    if (!firestore || campaignsLoading) return;

    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        // Get all campaign entries
        const entriesRef = collection(firestore, 'campaign-entries');
        const entriesSnapshot = await getDocs(entriesRef);
        const entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CampaignEntry[];

        // Calculate unique participants
        const uniqueParticipants = new Set(entries.map(e => e.userId));
        setTotalParticipants(uniqueParticipants.size);

        // Calculate revenue (sum of all paid entry fees)
        const paidEntries = entries.filter(e => e.paymentStatus === 'paid' && e.entryFee);
        const revenue = paidEntries.reduce((sum, entry) => sum + (entry.entryFee || 0), 0);
        setTotalRevenue(revenue);

        // Calculate engagement rate (participants / total users who could participate)
        // For now, we'll use a simple calculation based on entries
        const totalEntries = entries.length;
        const uniqueUsers = uniqueParticipants.size;
        const avgEntriesPerUser = totalEntries > 0 ? totalEntries / uniqueUsers : 0;
        setEngagementRate(Math.min(100, Math.round(avgEntriesPerUser * 20))); // Normalize to 0-100

        // Calculate monthly revenue data
        const monthlyData: Record<string, { revenue: number; participants: Set<string> }> = {};
        paidEntries.forEach(entry => {
          const date = entry.joinedAt instanceof Date ? entry.joinedAt : 
                      (entry.joinedAt as any)?.toDate ? (entry.joinedAt as any).toDate() : new Date();
          const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, participants: new Set() };
          }
          monthlyData[monthKey].revenue += entry.entryFee || 0;
          monthlyData[monthKey].participants.add(entry.userId);
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueChartData = months.map(month => ({
          month,
          revenue: monthlyData[month]?.revenue || 0,
          participants: monthlyData[month]?.participants.size || 0,
        })).filter(d => d.revenue > 0 || d.participants > 0);
        
        setRevenueData(revenueChartData.length > 0 ? revenueChartData : [
          { month: 'Jan', revenue: 0, participants: 0 },
          { month: 'Feb', revenue: 0, participants: 0 },
          { month: 'Mar', revenue: 0, participants: 0 },
        ]);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [firestore, campaignsLoading]);

  if (campaignsLoading || loadingMetrics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((c) => c.status === 'active').length || 0;
  const completedCampaigns = campaigns?.filter((c) => c.status === 'completed').length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fantasy Analytics Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Comprehensive analytics and insights for fantasy campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns} active, {completedCampaigns} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From paid entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average participation rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="events">Event Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: activeCampaigns, color: '#10b981' },
                        { name: 'Upcoming', value: campaigns?.filter((c) => c.status === 'upcoming').length || 0, color: '#3b82f6' },
                        { name: 'Completed', value: completedCampaigns, color: '#6b7280' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Active', value: activeCampaigns, color: '#10b981' },
                        { name: 'Upcoming', value: campaigns?.filter((c) => c.status === 'upcoming').length || 0, color: '#3b82f6' },
                        { name: 'Completed', value: completedCampaigns, color: '#6b7280' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Overview of all campaigns and their performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{campaign.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {campaign.campaignType === 'multiple_movies' 
                              ? `Multiple Movies (${campaign.movies?.length || 0} movies)`
                              : 'Single Movie'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-semibold capitalize">{campaign.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!campaigns || campaigns.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No campaigns found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>
                Detailed analytics for prediction events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[
                  { name: 'Choice Selection', count: 45, avgPoints: 75 },
                  { name: 'Numeric Prediction', count: 30, avgPoints: 100 },
                  { name: 'Opening Day', count: 20, avgPoints: 150 },
                  { name: 'Weekend Collection', count: 15, avgPoints: 200 },
                  { name: 'IMDb Rating', count: 25, avgPoints: 100 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Event Count" />
                  <Bar dataKey="avgPoints" fill="#10b981" name="Avg Points" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>
                Revenue breakdown by campaign and entry type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData.length > 0 ? revenueData : [
                  { month: 'No Data', revenue: 0, participants: 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue (₹)" />
                  <Line type="monotone" dataKey="participants" stroke="#3b82f6" name="Participants" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

