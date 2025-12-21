'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type AdPlacement = {
  id: string;
  name: string;
  page: string;
  active: boolean;
};

export default function AdminAdsPage() {
  const firestore = useFirestore();
  const adPlacementsQuery = firestore ? collection(firestore, 'ad-placements') : null;
  const { data: adPlacements, isLoading } = useCollection<AdPlacement>(adPlacementsQuery);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    try {
      const adRef = doc(firestore, 'ad-placements', id);
      await updateDoc(adRef, { active: !currentStatus });
      toast({
        title: 'Placement Updated',
        description: `The ad placement has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating ad placement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the ad placement status.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Advertisement Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Control ad placements and sponsors.
          </p>
        </div>
        <Button disabled>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Placement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Placements</CardTitle>
          <CardDescription>
            Enable or disable advertisement slots across the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
             <>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className='w-full'>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
               <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className='w-full'>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </>
          )}
          {adPlacements && adPlacements.map((placement) => (
            <div
              key={placement.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{placement.name}</p>
                <p className="text-sm text-muted-foreground">{placement.page}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`switch-${placement.id}`}
                  checked={placement.active}
                  onCheckedChange={() => handleToggle(placement.id, placement.active)}
                />
                <Label htmlFor={`switch-${placement.id}`}>
                  {placement.active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          ))}
          {!isLoading && adPlacements?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
                No ad placements found. You may need to seed your database.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
