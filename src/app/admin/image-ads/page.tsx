'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, ExternalLink, Calendar, TrendingUp, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ImageAdvertisement } from '@/lib/types';
import { format } from 'date-fns';
import { createImageAdvertisement, updateImageAdvertisement, deleteImageAdvertisement } from '@/firebase/firestore/image-advertisements';
import { getAllImageAdSponsors } from '@/firebase/firestore/image-ad-sponsors';
import { ImageAdForm } from '@/components/admin/image-ad-form';

export default function ImageAdsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<ImageAdvertisement | null>(null);

  // Fetch all image advertisements
  const adsRef = firestore ? collection(firestore, 'image-advertisements') : null;
  const adsQuery = adsRef ? query(adsRef, orderBy('createdAt', 'desc')) : null;
  const { data: ads, isLoading: adsLoading } = useCollection(adsQuery);

  // Fetch sponsors
  const [sponsors, setSponsors] = useState<any[]>([]);
  
  useEffect(() => {
    const loadSponsors = async () => {
      if (!firestore) return;
      try {
        const allSponsors = await getAllImageAdSponsors(firestore);
        setSponsors(allSponsors);
      } catch (error) {
        console.error('Error loading sponsors:', error);
      }
    };
    loadSponsors();
  }, [firestore]);

  const activeAds = useMemo(() => {
    if (!ads) return [];
    const now = new Date();
    return ads.filter((ad: any) => {
      const startDate = ad.startDate?.toDate ? ad.startDate.toDate() : new Date(ad.startDate);
      const endDate = ad.endDate?.toDate ? ad.endDate.toDate() : new Date(ad.endDate);
      return ad.status === 'active' && startDate <= now && endDate >= now;
    });
  }, [ads]);

  const handleCreateAd = () => {
    setEditingAd(null);
    setIsFormOpen(true);
  };

  const handleEditAd = (ad: ImageAdvertisement) => {
    setEditingAd(ad);
    setIsFormOpen(true);
  };

  const handleDeleteAd = async (adId: string) => {
    if (!firestore) return;
    try {
      await deleteImageAdvertisement(firestore, adId);
      toast({
        title: 'Ad Deleted',
        description: 'The advertisement has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the advertisement. Please try again.',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAd(null);
    toast({
      title: editingAd ? 'Ad Updated' : 'Ad Created',
      description: editingAd 
        ? 'The advertisement has been updated successfully.'
        : 'The advertisement has been created successfully.',
    });
  };

  if (adsLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">Image Advertisements</h1>
          <p className="text-muted-foreground mt-2">
            Manage image ads for tournament entry requirements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/image-ads/sponsors">
              <Building2 className="w-4 h-4 mr-2" />
              Manage Sponsors
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/image-ads/analytics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateAd}>
                <Plus className="w-4 h-4 mr-2" />
                Create Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</DialogTitle>
                <DialogDescription>
                  {editingAd 
                    ? 'Update the advertisement details below.'
                    : 'Create a new image advertisement for tournament entry requirements.'}
                </DialogDescription>
              </DialogHeader>
              <ImageAdForm
                ad={editingAd || undefined}
                sponsors={sponsors}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Ads ({ads?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeAds.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({ads ? ads.length - activeAds.length : 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AdsTable 
            ads={ads || []} 
            onEdit={handleEditAd}
            onDelete={handleDeleteAd}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <AdsTable 
            ads={activeAds} 
            onEdit={handleEditAd}
            onDelete={handleDeleteAd}
          />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <AdsTable 
            ads={(ads || []).filter((ad: any) => !activeAds.includes(ad))} 
            onEdit={handleEditAd}
            onDelete={handleDeleteAd}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdsTable({
  ads,
  onEdit,
  onDelete,
}: {
  ads: any[];
  onEdit: (ad: ImageAdvertisement) => void;
  onDelete: (adId: string) => void;
}) {
  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No advertisements found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Sponsor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad: any) => {
            const startDate = ad.startDate?.toDate ? ad.startDate.toDate() : new Date(ad.startDate);
            const endDate = ad.endDate?.toDate ? ad.endDate.toDate() : new Date(ad.endDate);
            const isActive = ad.status === 'active' && startDate <= new Date() && endDate >= new Date();
            
            return (
              <TableRow key={ad.id}>
                <TableCell>
                  <div className="relative w-16 h-10 rounded overflow-hidden bg-muted">
                    {ad.imageUrl ? (
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
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
                <TableCell>
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {ad.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{ad.currentViews || 0}</span>
                    {ad.maxViews && (
                      <span className="text-muted-foreground">/ {ad.maxViews}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{ad.displayDuration || 5}s</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ad.priority}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ad)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Advertisement?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the advertisement. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(ad.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

