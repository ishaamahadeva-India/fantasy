'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { FantasyCampaign, FantasyMatch } from '@/lib/types';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


// Extend types to include Firestore document ID
type FantasyCampaignWithId = FantasyCampaign & { id: string };
type FantasyMatchWithId = FantasyMatch & { id: string };

export default function AdminFantasyPage() {
  const firestore = useFirestore();
  
  const campaignsQuery = firestore ? collection(firestore, 'fantasy-campaigns') : null;
  const matchesQuery = firestore ? collection(firestore, 'fantasy_matches') : null;
  
  const { data: campaigns, isLoading: campaignsLoading } = useCollection<FantasyCampaignWithId>(campaignsQuery);
  const { data: matches, isLoading: matchesLoading } = useCollection<FantasyMatchWithId>(matchesQuery);

  const handleDeleteCampaign = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'fantasy-campaigns', id));
      toast({ title: 'Campaign Deleted' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting campaign' });
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'fantasy_matches', id));
      toast({ title: 'Match Deleted' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting match' });
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fantasy Game Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage Movie Fantasy Leagues and Live Cricket Matches.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movie Fantasy Campaigns</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/fantasy/campaign/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
          <CardDescription>
            Create and manage long-running movie prediction campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaignsLoading && (
            <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <Skeleton className="h-5 w-64 mb-2" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            </>
          )}
          {campaigns && campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-semibold">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">{campaign.movieId}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>{campaign.status}</Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/fantasy/campaign/edit/${campaign.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the campaign "{campaign.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCampaign(campaign.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          ))}
          {!campaignsLoading && campaigns?.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">No movie campaigns found.</div>
          )}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Cricket Matches</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/fantasy/match/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Match
              </Link>
            </Button>
          </div>
          <CardDescription>
            Manage live, role-based fantasy cricket matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matchesLoading && (
            <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Skeleton className="h-5 w-72" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
            </>
          )}
          {matches && matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-semibold">{match.matchName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={match.status === 'live' ? 'destructive' : 'secondary'}>{match.status}</Badge>
                     <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/fantasy/match/edit/${match.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                             This will permanently delete the match "{match.matchName}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMatch(match.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          ))}
           {!matchesLoading && matches?.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">No cricket matches found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
