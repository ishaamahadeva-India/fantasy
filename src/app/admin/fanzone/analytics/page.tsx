'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Film, Star, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Cricketer = { id: string; name: string; country: string; roles: string[] };
type Team = { id: string; name: string; type: 'ip' | 'national' };
type Movie = { id: string; title: string; industry: string; releaseYear: number };
type Star = { id: string; name: string; genre: string[] };

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function FanZoneAnalyticsPage() {
  const firestore = useFirestore();
  
  const cricketersQuery = firestore ? collection(firestore, 'cricketers') : null;
  const teamsQuery = firestore ? collection(firestore, 'teams') : null;
  const moviesQuery = firestore ? collection(firestore, 'movies') : null;
  const starsQuery = firestore ? collection(firestore, 'stars') : null;
  
  const { data: cricketers, isLoading: cricketersLoading } = useCollection(cricketersQuery);
  const { data: teams, isLoading: teamsLoading } = useCollection(teamsQuery);
  const { data: movies, isLoading: moviesLoading } = useCollection(moviesQuery);
  const { data: stars, isLoading: starsLoading } = useCollection(starsQuery);

  // Calculate statistics
  const totalCricketers = cricketers?.length || 0;
  const totalTeams = teams?.length || 0;
  const totalMovies = movies?.length || 0;
  const totalStars = stars?.length || 0;

  // Country distribution for cricketers
  const countryDistribution = cricketers?.reduce((acc, cricketer) => {
    const country = cricketer.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const countryData = Object.entries(countryDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Industry distribution for movies
  const industryDistribution = movies?.reduce((acc, movie) => {
    const industry = movie.industry || 'Other';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const industryData = Object.entries(industryDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Team type distribution
  const teamTypeDistribution = teams?.reduce((acc, team) => {
    const type = team.type === 'ip' ? 'IP Teams' : 'National Teams';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const teamTypeData = Object.entries(teamTypeDistribution)
    .map(([name, value]) => ({ name, value }));

  // Movies by year (last 5 years)
  const currentYear = new Date().getFullYear();
  const moviesByYear = movies?.reduce((acc, movie) => {
    const year = movie.releaseYear || currentYear;
    if (year >= currentYear - 4) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>) || {};

  const yearData = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 4 + i;
    return { year: year.toString(), count: moviesByYear[year] || 0 };
  });

  if (cricketersLoading || teamsLoading || moviesLoading || starsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fan Zone Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Insights and statistics for Fan Zone content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cricketers</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCricketers}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(countryDistribution).length} countries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              {teams?.filter(t => t.type === 'ip').length || 0} IP, {teams?.filter(t => t.type === 'national').length || 0} National
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovies}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(industryDistribution).length} industries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStars}</div>
            <p className="text-xs text-muted-foreground">
              Across all industries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Cricketers by Country
            </CardTitle>
            <CardDescription>Top 5 countries with most cricketers</CardDescription>
          </CardHeader>
          <CardContent>
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Movies by Industry
            </CardTitle>
            <CardDescription>Distribution across industries</CardDescription>
          </CardHeader>
          <CardContent>
            {industryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Type Distribution</CardTitle>
            <CardDescription>IP vs National teams</CardDescription>
          </CardHeader>
          <CardContent>
            {teamTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={teamTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {teamTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movies by Release Year</CardTitle>
            <CardDescription>Last 5 years</CardDescription>
          </CardHeader>
          <CardContent>
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

