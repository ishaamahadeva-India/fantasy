
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FileText, Star, Gamepad2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          An overview of your application's data.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={users?.length || 0} icon={Users} isLoading={usersLoading} />
        <StatCard title="Total Articles" value={articles?.length || 0} icon={FileText} isLoading={articlesLoading} />
        <StatCard title="Total Fan Ratings" value={ratings?.length || 0} icon={Star} isLoading={ratingsLoading} />
        <StatCard title="Total Predictions" value={predictions?.length || 0} icon={Gamepad2} isLoading={predictionsLoading} />
      </div>
    </div>
  );
}
