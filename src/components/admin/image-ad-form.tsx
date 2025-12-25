'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/admin/image-upload';
import { createImageAdvertisement, updateImageAdvertisement } from '@/firebase/firestore/image-advertisements';
import { toast } from '@/hooks/use-toast';
import type { ImageAdvertisement } from '@/lib/types';

type ImageAdFormProps = {
  ad?: ImageAdvertisement;
  sponsors: any[];
  onSuccess: () => void;
  onCancel: () => void;
};

export function ImageAdForm({ ad, sponsors, onSuccess, onCancel }: ImageAdFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    sponsorId: ad?.sponsorId || '',
    sponsorName: ad?.sponsorName || '',
    title: ad?.title || '',
    description: ad?.description || '',
    imageUrl: ad?.imageUrl || '',
    thumbnailUrl: ad?.thumbnailUrl || '',
    displayDuration: ad?.displayDuration || 5,
    clickThroughUrl: ad?.clickThroughUrl || '',
    status: ad?.status || 'active',
    startDate: ad?.startDate 
      ? (ad.startDate instanceof Date ? ad.startDate.toISOString().split('T')[0] : new Date(ad.startDate).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    endDate: ad?.endDate
      ? (ad.endDate instanceof Date ? ad.endDate.toISOString().split('T')[0] : new Date(ad.endDate).toISOString().split('T')[0])
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    priority: ad?.priority || 1,
    maxViews: ad?.maxViews?.toString() || '',
    maxViewsPerUser: ad?.maxViewsPerUser?.toString() || '',
    targetTournaments: ad?.targetTournaments?.join(', ') || '',
    trackingPixel: ad?.trackingPixel || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    setIsSubmitting(true);

    try {
      const adData: any = {
        sponsorId: formData.sponsorId,
        sponsorName: formData.sponsorName,
        title: formData.title,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        displayDuration: Number(formData.displayDuration),
        clickThroughUrl: formData.clickThroughUrl || undefined,
        status: formData.status as 'active' | 'inactive' | 'scheduled' | 'expired',
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        priority: Number(formData.priority),
        maxViews: formData.maxViews ? Number(formData.maxViews) : undefined,
        maxViewsPerUser: formData.maxViewsPerUser ? Number(formData.maxViewsPerUser) : undefined,
        targetTournaments: formData.targetTournaments 
          ? formData.targetTournaments.split(',').map(t => t.trim()).filter(Boolean)
          : undefined,
        trackingPixel: formData.trackingPixel || undefined,
        createdBy: user.uid,
      };

      if (ad) {
        await updateImageAdvertisement(firestore, ad.id, adData);
      } else {
        await createImageAdvertisement(firestore, adData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: ad ? 'Failed to update advertisement.' : 'Failed to create advertisement.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync sponsor name when sponsorId changes or when editing existing ad
  useEffect(() => {
    if (formData.sponsorId && sponsors.length > 0) {
      const sponsor = sponsors.find(s => s.id === formData.sponsorId);
      if (sponsor && sponsor.name !== formData.sponsorName) {
        setFormData(prev => ({
          ...prev,
          sponsorName: sponsor.name,
        }));
      }
    }
  }, [formData.sponsorId, sponsors]);

  const handleSponsorChange = (sponsorId: string) => {
    if (sponsorId === 'none' || !sponsorId) {
      setFormData(prev => ({
        ...prev,
        sponsorId: '',
        sponsorName: '',
      }));
      return;
    }
    
    const sponsor = sponsors.find(s => s.id === sponsorId);
    if (sponsor) {
      setFormData(prev => ({
        ...prev,
        sponsorId: sponsor.id,
        sponsorName: sponsor.name,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sponsorId">Sponsor *</Label>
          <Select value={formData.sponsorId || 'none'} onValueChange={handleSponsorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sponsor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {sponsors.map((sponsor) => (
                <SelectItem key={sponsor.id} value={sponsor.id}>
                  {sponsor.name || sponsor.companyName || `Sponsor ${sponsor.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sponsors.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No sponsors available. <Link href="/admin/image-ads/sponsors" className="text-primary underline">Create a sponsor first</Link>.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Advertisement title"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the advertisement"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Ad Image *</Label>
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
          folder="advertisements"
          label="Advertisement Image"
        />
        <p className="text-xs text-muted-foreground">
          Recommended: 800x600px or 16:9 aspect ratio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayDuration">Display Duration (seconds) *</Label>
          <Input
            id="displayDuration"
            type="number"
            min="3"
            max="30"
            value={formData.displayDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, displayDuration: Number(e.target.value) }))}
            required
          />
          <p className="text-xs text-muted-foreground">How long users must view the ad (3-30 seconds)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="100"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
          />
          <p className="text-xs text-muted-foreground">Higher priority ads are shown first (1-100)</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clickThroughUrl">Click-Through URL</Label>
        <Input
          id="clickThroughUrl"
          type="url"
          value={formData.clickThroughUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, clickThroughUrl: e.target.value }))}
          placeholder="https://example.com"
        />
        <p className="text-xs text-muted-foreground">URL to open when users click the ad image</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxViews">Max Views (optional)</Label>
          <Input
            id="maxViews"
            type="number"
            min="1"
            value={formData.maxViews}
            onChange={(e) => setFormData(prev => ({ ...prev, maxViews: e.target.value }))}
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxViewsPerUser">Max Views Per User (optional)</Label>
          <Input
            id="maxViewsPerUser"
            type="number"
            min="1"
            value={formData.maxViewsPerUser}
            onChange={(e) => setFormData(prev => ({ ...prev, maxViewsPerUser: e.target.value }))}
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetTournaments">Target Tournaments (optional)</Label>
        <Input
          id="targetTournaments"
          value={formData.targetTournaments}
          onChange={(e) => setFormData(prev => ({ ...prev, targetTournaments: e.target.value }))}
          placeholder="Comma-separated tournament IDs"
        />
        <p className="text-xs text-muted-foreground">Leave empty to show for all tournaments</p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : ad ? 'Update Ad' : 'Create Ad'}
        </Button>
      </div>
    </form>
  );
}

