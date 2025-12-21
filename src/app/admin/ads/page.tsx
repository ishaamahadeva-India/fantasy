'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { deleteAdvertisement } from '@/firebase/firestore/advertisements';
import { AD_POSITIONS } from '@/firebase/firestore/advertisements';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import type { Advertisement } from '@/lib/types';

export default function AdminAdsPage() {
  const firestore = useFirestore();
  const adsQuery = firestore ? collection(firestore, 'advertisements') : null;
  const { data: advertisements, isLoading } = useCollection<Advertisement>(adsQuery);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (!firestore) return;
    try {
      const adRef = doc(firestore, 'advertisements', id);
      await updateDoc(adRef, { active: !currentStatus });
      toast({
        title: 'Advertisement Updated',
        description: `The advertisement has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating advertisement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the advertisement status.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteAdvertisement(firestore, id);
      toast({
        title: 'Advertisement Deleted',
        description: 'The advertisement has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the advertisement. Please try again.',
      });
    }
  };

  const getPositionLabel = (position: string) => {
    return AD_POSITIONS.find((p) => p.value === position)?.label || position;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Advertisement Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage all advertisements across the application.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/ads/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Advertisement
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>
            Create, edit, and manage advertisements for different positions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="w-20 h-20 shrink-0" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && advertisements && advertisements.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="relative w-20 h-20">
                        <Image
                          src={ad.imageUrl}
                          alt={ad.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPositionLabel(ad.position)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.active ? 'default' : 'secondary'}>
                        {ad.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={ad.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Link
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggle(ad.id, ad.active)}
                        >
                          {ad.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/ads/edit/${ad.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                advertisement "{ad.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ad.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && (!advertisements || advertisements.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No advertisements found.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/ads/new">Create Your First Advertisement</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
