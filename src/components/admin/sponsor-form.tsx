'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/image-upload';
import { createImageAdSponsor, updateImageAdSponsor } from '@/firebase/firestore/image-ad-sponsors';
import { toast } from '@/hooks/use-toast';
import type { ImageAdSponsor } from '@/lib/types';

type SponsorFormProps = {
  sponsor?: ImageAdSponsor;
  onSuccess: () => void;
  onCancel: () => void;
};

export function SponsorForm({ sponsor, onSuccess, onCancel }: SponsorFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: sponsor?.name || '',
    companyName: sponsor?.companyName || '',
    logoUrl: sponsor?.logoUrl || '',
    contactEmail: sponsor?.contactEmail || '',
    contactPhone: sponsor?.contactPhone || '',
    website: sponsor?.website || '',
    instagram: sponsor?.instagram || '',
    twitter: sponsor?.twitter || '',
    facebook: sponsor?.facebook || '',
    billingAddress: sponsor?.billingAddress || '',
    paymentMethod: sponsor?.paymentMethod || '',
    status: sponsor?.status || 'active',
    contractStartDate: sponsor?.contractStartDate
      ? (sponsor.contractStartDate instanceof Date ? sponsor.contractStartDate.toISOString().split('T')[0] : new Date(sponsor.contractStartDate).toISOString().split('T')[0])
      : '',
    contractEndDate: sponsor?.contractEndDate
      ? (sponsor.contractEndDate instanceof Date ? sponsor.contractEndDate.toISOString().split('T')[0] : new Date(sponsor.contractEndDate).toISOString().split('T')[0])
      : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    setIsSubmitting(true);

    try {
      const sponsorData: any = {
        name: formData.name,
        companyName: formData.companyName,
        logoUrl: formData.logoUrl || undefined,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        facebook: formData.facebook || undefined,
        billingAddress: formData.billingAddress || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        status: formData.status as 'active' | 'inactive' | 'suspended',
        contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate) : undefined,
        contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : undefined,
      };

      if (sponsor) {
        await updateImageAdSponsor(firestore, sponsor.id, sponsorData);
      } else {
        await createImageAdSponsor(firestore, sponsorData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: sponsor ? 'Failed to update sponsor.' : 'Failed to create sponsor.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Contact Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="Acme Corporation"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Company Logo</Label>
        <ImageUpload
          value={formData.logoUrl}
          onChange={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
          folder="advertisements"
          label="Sponsor Logo"
          position="sponsor-logo"
          showSizeGuidance={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
            placeholder="contact@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
            placeholder="+91 1234567890"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            value={formData.twitter}
            onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            type="url"
            value={formData.facebook}
            onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billingAddress">Billing Address</Label>
        <Textarea
          id="billingAddress"
          value={formData.billingAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
          placeholder="Street address, City, State, ZIP"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractStartDate">Contract Start Date</Label>
          <Input
            id="contractStartDate"
            type="date"
            value={formData.contractStartDate}
            onChange={(e) => setFormData(prev => ({ ...prev, contractStartDate: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractEndDate">Contract End Date</Label>
          <Input
            id="contractEndDate"
            type="date"
            value={formData.contractEndDate}
            onChange={(e) => setFormData(prev => ({ ...prev, contractEndDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input
          id="paymentMethod"
          value={formData.paymentMethod}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
          placeholder="Bank transfer, UPI, etc."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : sponsor ? 'Update Sponsor' : 'Create Sponsor'}
        </Button>
      </div>
    </form>
  );
}

