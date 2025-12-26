'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, MousePointerClick, CheckCircle2, Users, Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ImageAdsAnalyticsPage() {
  const firestore = useFirestore();

  // Fetch all advertisements
  const adsRef = firestore ? collection(firestore, 'image-advertisements') : null;
  const adsQuery = adsRef ? query(adsRef, orderBy('createdAt', 'desc')) : null;
  const { data: ads, isLoading: adsLoading } = useCollection(adsQuery);

  // Fetch all ad views
  const viewsRef = firestore ? collection(firestore, 'image-ad-views') : null;
  const viewsQuery = viewsRef ? query(viewsRef, orderBy('viewedAt', 'desc')) : null;
  const { data: views, isLoading: viewsLoading } = useCollection(viewsQuery);

  const isLoading = adsLoading || viewsLoading;

  // Calculate overall statistics
  const stats = useMemo(() => {
    if (!ads || !views) return null;

    const totalAds = ads.length;
    const activeAds = ads.filter((ad: any) => {
      try {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;
        
        if (ad.startDate) {
          if (ad.startDate.toDate && typeof ad.startDate.toDate === 'function') {
            startDate = ad.startDate.toDate();
          } else if (ad.startDate instanceof Date) {
            startDate = ad.startDate;
          } else {
            startDate = new Date(ad.startDate);
          }
          if (isNaN(startDate.getTime())) return false;
        } else {
          return false;
        }
        
        if (ad.endDate) {
          if (ad.endDate.toDate && typeof ad.endDate.toDate === 'function') {
            endDate = ad.endDate.toDate();
          } else if (ad.endDate instanceof Date) {
            endDate = ad.endDate;
          } else {
            endDate = new Date(ad.endDate);
          }
          if (isNaN(endDate.getTime())) return false;
        } else {
          return false;
        }
        
        return ad.status === 'active' && startDate <= now && endDate >= now;
      } catch (error) {
        console.error('Error processing ad dates:', error);
        return false;
      }
    }).length;

    const totalViews = views.length;
    const completedViews = views.filter((v: any) => v.wasCompleted).length;
    const clickedViews = views.filter((v: any) => v.clicked).length;

    const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;
    const clickThroughRate = totalViews > 0 ? (clickedViews / totalViews) * 100 : 0;

    // Calculate views by date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));
    const viewsByDate = last7Days.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayViews = views.filter((v: any) => {
        try {
          let viewedAt: Date;
          if (v.viewedAt) {
            if (v.viewedAt.toDate && typeof v.viewedAt.toDate === 'function') {
              viewedAt = v.viewedAt.toDate();
            } else if (v.viewedAt instanceof Date) {
              viewedAt = v.viewedAt;
            } else {
              viewedAt = new Date(v.viewedAt);
            }
            // Validate date
            if (isNaN(viewedAt.getTime())) {
              return false;
            }
            return viewedAt >= dayStart && viewedAt <= dayEnd;
          }
          return false;
        } catch (error) {
          console.error('Error processing view date:', error);
          return false;
        }
      }).length;
      return { date, views: dayViews };
    }).reverse();

    // Calculate device breakdown
    const deviceBreakdown = views.reduce((acc: any, view: any) => {
      const device = view.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAds,
      activeAds,
      totalViews,
      completedViews,
      clickedViews,
      completionRate,
      clickThroughRate,
      viewsByDate,
      deviceBreakdown,
    };
  }, [ads, views]);

  // Calculate per-ad statistics
  const adStats = useMemo(() => {
    if (!ads || !views) return [];

    return ads.map((ad: any) => {
      const adViews = views.filter((v: any) => v.advertisementId === ad.id);
      const completed = adViews.filter((v: any) => v.wasCompleted).length;
      const clicked = adViews.filter((v: any) => v.clicked).length;
      const completionRate = adViews.length > 0 ? (completed / adViews.length) * 100 : 0;
      const clickThroughRate = adViews.length > 0 ? (clicked / adViews.length) * 100 : 0;

      return {
        ...ad,
        views: adViews.length,
        completed,
        clicked,
        completionRate,
        clickThroughRate,
      };
    });
  }, [ads, views]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline mb-6">Image Ads Analytics</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-6">Image Ads Analytics</h1>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAds} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedViews} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedViews} / {stats.totalViews}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickThroughRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.clickedViews} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads">By Ad</TabsTrigger>
          <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.viewsByDate.map(({ date, views }, index) => (
                  <div key={date && !isNaN(date.getTime()) ? date.toISOString() : `date-${index}`} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {format(date, 'MMM dd, yyyy')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(views / Math.max(...stats.viewsByDate.map(d => d.views))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Title</TableHead>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adStats.map((ad: any) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{ad.title}</p>
                        {ad.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{ad.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ad.sponsorName}</Badge>
                    </TableCell>
                    <TableCell>{ad.views}</TableCell>
                    <TableCell>{ad.completed}</TableCell>
                    <TableCell>{ad.clicked}</TableCell>
                    <TableCell>
                      <Badge variant={ad.completionRate >= 80 ? 'default' : ad.completionRate >= 60 ? 'secondary' : 'destructive'}>
                        {ad.completionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.clickThroughRate >= 10 ? 'default' : ad.clickThroughRate >= 5 ? 'secondary' : 'outline'}>
                        {ad.clickThroughRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views by Device Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.deviceBreakdown).map(([device, count]: [string, any]) => {
                  const total = Object.values(stats.deviceBreakdown).reduce((sum: number, c: any) => sum + c, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{device}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

