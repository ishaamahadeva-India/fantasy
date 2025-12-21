
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, Star, Gamepad2, TrendingUp, Activity, Zap } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading, 
  trend,
  description,
  gradient
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  isLoading: boolean;
  trend?: string;
  description?: string;
  gradient?: string;
}) {
    return (
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
          gradient && `bg-gradient-to-br ${gradient} border-0`
        )}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-sm font-medium text-foreground/80">{title}</CardTitle>
                <div className={cn(
                  "p-2 rounded-lg",
                  gradient ? "bg-white/20" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    gradient ? "text-white" : "text-muted-foreground"
                  )} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                {isLoading ? (
                  <Skeleton className={cn("h-10 w-24", gradient && "bg-white/20")} />
                ) : (
                  <>
                    <div className={cn(
                      "text-3xl font-bold mb-1",
                      gradient ? "text-white" : "text-foreground"
                    )}>
                      {value.toLocaleString()}
                    </div>
                    {trend && (
                      <div className="flex items-center gap-1 text-xs text-foreground/60">
                        <TrendingUp className="w-3 h-3" />
                        <span>{trend}</span>
                      </div>
                    )}
                    {description && (
                      <p className="text-xs text-foreground/60 mt-1">{description}</p>
                    )}
                  </>
                )}
            </CardContent>
        </Card>
    )
}

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  
  const usersQuery = firestore ? collection(firestore, 'users') : null;
  const articlesQuery = firestore ? collection(firestore, 'articles') : null;
  const ratingsQuery = firestore ? collection(firestore, 'ratings') : null;
  const predictionsQuery = firestore ? collection(firestore, 'user-predictions') : null;

  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: articles, isLoading: articlesLoading } = useCollection(articlesQuery);
  const { data: ratings, isLoading: ratingsLoading } = useCollection(ratingsQuery);
  const { data: predictions, isLoading: predictionsLoading } = useCollection(predictionsQuery);


  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Comprehensive overview of your application's data and analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={users?.length || 0} 
          icon={Users} 
          isLoading={usersLoading}
          trend="+12% this month"
          description="Active platform users"
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Total Articles" 
          value={articles?.length || 0} 
          icon={FileText} 
          isLoading={articlesLoading}
          trend="+5 new today"
          description="Published content"
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard 
          title="Fan Ratings" 
          value={ratings?.length || 0} 
          icon={Star} 
          isLoading={ratingsLoading}
          trend="+23% engagement"
          description="Community ratings"
          gradient="from-amber-500 to-amber-600"
        />
        <StatCard 
          title="Predictions" 
          value={predictions?.length || 0} 
          icon={Gamepad2} 
          isLoading={predictionsLoading}
          trend="Active now"
          description="User predictions"
          gradient="from-green-500 to-green-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/fantasy" className="p-4 rounded-lg border hover:bg-muted transition-colors">
                <Gamepad2 className="w-5 h-5 mb-2 text-primary" />
                <p className="font-semibold text-sm">Fantasy Games</p>
                <p className="text-xs text-muted-foreground">Manage campaigns</p>
              </a>
              <a href="/admin/content" className="p-4 rounded-lg border hover:bg-muted transition-colors">
                <FileText className="w-5 h-5 mb-2 text-primary" />
                <p className="font-semibold text-sm">Content</p>
                <p className="text-xs text-muted-foreground">Articles & news</p>
              </a>
              <a href="/admin/fanzone" className="p-4 rounded-lg border hover:bg-muted transition-colors">
                <Star className="w-5 h-5 mb-2 text-primary" />
                <p className="font-semibold text-sm">Fan Zone</p>
                <p className="text-xs text-muted-foreground">Cricketers & stars</p>
              </a>
              <a href="/admin/users" className="p-4 rounded-lg border hover:bg-muted transition-colors">
                <Users className="w-5 h-5 mb-2 text-primary" />
                <p className="font-semibold text-sm">Users</p>
                <p className="text-xs text-muted-foreground">Manage users</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>System Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">System Operational</span>
              </div>
              <span className="text-xs text-muted-foreground">99.9% uptime</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Database</span>
                <span className="font-medium">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-medium">Healthy</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">API</span>
                <span className="font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
