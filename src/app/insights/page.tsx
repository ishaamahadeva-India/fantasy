'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { BookUp, Clock, Target } from 'lucide-react';

const userInsightsData = {
  timeInvested: 42,
  growthTrajectory: [
    { month: 'Jan', 'Knowledge Index': 75 },
    { month: 'Feb', 'Knowledge Index': 78 },
    { month: 'Mar', 'Knowledge Index': 82 },
    { month: 'Apr', 'Knowledge Index': 80 },
    { month: 'May', 'Knowledge Index': 85 },
    { month: 'Jun', 'Knowledge Index': 88 },
  ],
  categoryRadar: [
    { category: 'Cricket', score: 92 },
    { category: 'Movies', score: 85 },
    { category: 'Politics', score: 78 },
    { category: 'Tech', score: 81 },
    { category: 'History', score: 75 },
  ],
};


export default function InsightsPage() {
  const chartConfig = {
    'Knowledge Index': {
      label: 'Knowledge Index',
      color: 'hsl(var(--primary))',
    },
  };

  const radarChartConfig = {
    score: {
      label: 'Score',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Performance Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Analyze your performance, track stats, and identify weak zones.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Knowledge Index
            </CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-code">
              {userInsightsData.growthTrajectory.slice(-1)[0]['Knowledge Index']}
            </div>
            <p className="text-xs text-muted-foreground">
              +
              {userInsightsData.growthTrajectory.slice(-1)[0]['Knowledge Index'] -
                userInsightsData.growthTrajectory.slice(-2)[0]['Knowledge Index']}
              % from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-code">
              {userInsightsData.timeInvested}
              <span className="text-base font-medium text-muted-foreground">
                {' '}
                hours
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Total time spent in challenges
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Strongest Topic</CardTitle>
            <BookUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Cricket</div>
            <p className="text-xs text-muted-foreground">
              Highest accuracy category
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Growth Trajectory</CardTitle>
            <CardDescription>Your Knowledge Index over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <AreaChart data={userInsightsData.growthTrajectory}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-Knowledge-Index)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-Knowledge-Index)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[60, 100]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="Knowledge Index"
                  type="natural"
                  fill="url(#fill)"
                  stroke="var(--color-Knowledge-Index)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Skill Distribution</CardTitle>
            <CardDescription>
              Performance analysis across categories
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer config={radarChartConfig} className="h-64">
              <RadarChart data={userInsightsData.categoryRadar}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarAngleAxis dataKey="category" />
                <PolarGrid />
                <Radar
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.6}
                  stroke="var(--color-score)"
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
