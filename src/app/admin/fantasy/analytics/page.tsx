'use client';

import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Trophy, DollarSign, BarChart3, Calendar } from 'lucide-react';
import type { FantasyCampaign } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { getOverallEntryStats } from '@/firebase/firestore/campaign-entries-aggregation';
import type { CampaignEntryAggregation } from '@/firebase/firestore/campaign-entries-aggregation';

export default function FantasyAnalyticsPage() {
  const firestore = useFirestore();
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; participants: number }>>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  
  const campaignsRef = firestore ? collection(firestore, 'fantasy-campaigns') : null;
  const { data: campaigns, isLoading: campaignsLoading } = useCollection<FantasyCampaign>(campaignsRef);

  // Fetch participants and revenue data using aggregation queries
  useEffect(() => {
    if (!firestore || campaignsLoading) return;

    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        // Use aggregation query for better performance
        const entryStats = await getOverallEntryStats(firestore);
        
        setTotalParticipants(entryStats.uniqueParticipants);
        setTotalRevenue(entryStats.totalRevenue);
        
        // Calculate engagement rate
        const avgEntriesPerUser = entryStats.uniqueParticipants > 0 
          ? entryStats.totalEntries / entryStats.uniqueParticipants 
          : 0;
        setEngagementRate(Math.min(100, Math.round(avgEntriesPerUser * 20))); // Normalize to 0-100

        // Use monthly revenue from aggregation
        const revenueChartData = entryStats.monthlyRevenue.length > 0 
          ? entryStats.monthlyRevenue.map(m => ({
              month: m.month.split(' ')[0], // Extract month name
              revenue: m.revenue,
              participants: m.entries,
            }))
          : [
              { month: 'Jan', revenue: 0, participants: 0 },
              { month: 'Feb', revenue: 0, participants: 0 },
              { month: 'Mar', revenue: 0, participants: 0 },
            ];
        
        setRevenueData(revenueChartData);
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

