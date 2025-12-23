'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Building2, Mail, Phone, Globe, Instagram, Twitter, Facebook, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ImageAdSponsor } from '@/lib/types';
import { format } from 'date-fns';
import { createImageAdSponsor, updateImageAdSponsor, deleteImageAdSponsor } from '@/firebase/firestore/image-ad-sponsors';
import { SponsorForm } from '@/components/admin/sponsor-form';

export default function SponsorsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<ImageAdSponsor | null>(null);

  // Fetch all sponsors
  const sponsorsRef = firestore ? collection(firestore, 'image-ad-sponsors') : null;
  const sponsorsQuery = sponsorsRef ? query(sponsorsRef, orderBy('createdAt', 'desc')) : null;
  const { data: sponsors, isLoading: sponsorsLoading } = useCollection(sponsorsQuery);

  const handleCreateSponsor = () => {
    setEditingSponsor(null);
    setIsFormOpen(true);
  };

  const handleEditSponsor = (sponsor: ImageAdSponsor) => {
    setEditingSponsor(sponsor);
    setIsFormOpen(true);
  };

  const handleDeleteSponsor = async (sponsorId: string) => {
    if (!firestore) return;
    try {
      await deleteImageAdSponsor(firestore, sponsorId);
      toast({
        title: 'Sponsor Deleted',
        description: 'The sponsor has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the sponsor. Please try again.',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingSponsor(null);
    toast({
      title: editingSponsor ? 'Sponsor Updated' : 'Sponsor Created',
      description: editingSponsor 
        ? 'The sponsor has been updated successfully.'
        : 'The sponsor has been created successfully.',
    });
  };

  if (sponsorsLoading) {
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
          <h1 className="text-3xl font-bold md:text-4xl font-headline">Ad Sponsors</h1>
          <p className="text-muted-foreground mt-2">
            Manage sponsors for image advertisements
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateSponsor}>
              <Plus className="w-4 h-4 mr-2" />
              Create Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Create Sponsor'}</DialogTitle>
              <DialogDescription>
                {editingSponsor 
                  ? 'Update the sponsor details below.'
                  : 'Create a new sponsor for image advertisements.'}
              </DialogDescription>
            </DialogHeader>
            <SponsorForm
              sponsor={editingSponsor || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!sponsors || sponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No sponsors found.</p>
            <Button onClick={handleCreateSponsor}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Sponsor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Views</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsors.map((sponsor: any) => {
                const createdAt = sponsor.createdAt?.toDate ? sponsor.createdAt.toDate() : new Date(sponsor.createdAt);
                const contractStart = sponsor.contractStartDate?.toDate ? sponsor.contractStartDate.toDate() : null;
                const contractEnd = sponsor.contractEndDate?.toDate ? sponsor.contractEndDate.toDate() : null;
                
                return (
                  <TableRow key={sponsor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {sponsor.logoUrl && (
                          <img 
                            src={sponsor.logoUrl} 
                            alt={sponsor.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{sponsor.name}</p>
                          <p className="text-xs text-muted-foreground">{sponsor.companyName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sponsor.contactEmail && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs">{sponsor.contactEmail}</span>
                          </div>
                        )}
                        {sponsor.contactPhone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs">{sponsor.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sponsor.status === 'active' ? 'default' : 'secondary'}>
                        {sponsor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span>{sponsor.totalViews || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">₹{sponsor.totalSpent || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSponsor(sponsor)}
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
                              <AlertDialogTitle>Delete Sponsor?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the sponsor. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSponsor(sponsor.id)}>
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
      )}
    </div>
  );
}

