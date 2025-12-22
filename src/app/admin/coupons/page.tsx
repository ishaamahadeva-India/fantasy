'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, where } from 'firebase/firestore';
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
import { Plus, Edit, Trash2, Copy, CheckCircle2, XCircle, Users, Calendar, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CouponCode, CouponRedemption } from '@/lib/types';
import { format } from 'date-fns';

function CouponForm({
  coupon,
  onClose,
  onSuccess,
}: {
  coupon?: CouponCode;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || 0,
    minPurchaseAmount: coupon?.minPurchaseAmount || 0,
    maxDiscountAmount: coupon?.maxDiscountAmount || 0,
    validFrom: coupon?.validFrom ? format(new Date(coupon.validFrom), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    validUntil: coupon?.validUntil ? format(new Date(coupon.validUntil), 'yyyy-MM-dd') : '',
    maxRedemptions: coupon?.maxRedemptions || '',
    isActive: coupon?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    setIsSubmitting(true);
    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        maxRedemptions: formData.maxRedemptions ? Number(formData.maxRedemptions) : undefined,
        isActive: formData.isActive,
        currentRedemptions: coupon?.currentRedemptions || 0,
        createdAt: coupon?.createdAt || serverTimestamp(),
        createdBy: coupon?.createdBy || user?.uid || '',
        updatedAt: serverTimestamp(),
      };

      if (coupon) {
        await updateDoc(doc(firestore, 'coupons', coupon.id), couponData);
        toast({
          title: 'Coupon Updated',
          description: 'Coupon code has been updated successfully.',
        });
      } else {
        await addDoc(collection(firestore, 'coupons'), couponData);
        toast({
          title: 'Coupon Created',
          description: 'New coupon code has been created successfully.',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save coupon code.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type *</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) =>
              setFormData({ ...formData, discountType: value as 'percentage' | 'fixed' | 'points' })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="points">Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Coupon description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Discount Value * {formData.discountType === 'percentage' ? '(%)' : formData.discountType === 'points' ? '(Points)' : '(₹)'}
          </Label>
          <Input
            id="discountValue"
            type="number"
            min="0"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minPurchaseAmount">Min Purchase Amount (₹)</Label>
          <Input
            id="minPurchaseAmount"
            type="number"
            min="0"
            value={formData.minPurchaseAmount}
            onChange={(e) => setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) })}
          />
        </div>
      </div>

      {formData.discountType === 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="maxDiscountAmount">Max Discount Amount (₹)</Label>
          <Input
            id="maxDiscountAmount"
            type="number"
            min="0"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid From *</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until *</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxRedemptions">Max Redemptions</Label>
          <Input
            id="maxRedemptions"
            type="number"
            min="1"
            value={formData.maxRedemptions}
            onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Unlimited if empty"
          />
        </div>
        <div className="space-y-2 flex items-end">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
}

function CouponList({ coupons, onEdit, onDelete }: { coupons: CouponCode[]; onEdit: (coupon: CouponCode) => void; onDelete: (id: string) => void }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (validUntil: Date) => new Date(validUntil) < new Date();
  const isActive = (coupon: CouponCode) => {
    const now = new Date();
    return coupon.isActive && new Date(coupon.validFrom) <= now && new Date(coupon.validUntil) >= now;
  };

  return (
    <div className="space-y-4">
      {coupons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No coupons found. Create your first coupon code!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={!isActive(coupon) ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl font-mono">{coupon.code}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      {isActive(coupon) ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : isExpired(coupon.validUntil) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {coupon.description && (
                      <CardDescription className="mt-1">{coupon.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(coupon)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete coupon code "{coupon.code}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(coupon.id)} className="bg-destructive">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-semibold">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : coupon.discountType === 'points'
                        ? `${coupon.discountValue} Points`
                        : `₹${coupon.discountValue}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Redemptions</p>
                    <p className="font-semibold">
                      {coupon.currentRedemptions}
                      {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ' / ∞'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid From</p>
                    <p className="font-semibold">{format(new Date(coupon.validFrom), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid Until</p>
                    <p className="font-semibold">{format(new Date(coupon.validUntil), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RedemptionList({ redemptions }: { redemptions: CouponRedemption[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Redemptions</CardTitle>
        <CardDescription>Track which users have redeemed which coupons</CardDescription>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No redemptions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Redeemed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((redemption) => (
                  <TableRow key={redemption.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{redemption.userName || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{redemption.userEmail || redemption.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {redemption.couponCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ₹{redemption.discountAmount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(redemption.redeemedAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CouponsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | undefined>();

  const couponsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'coupons'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const redemptionsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'coupon-redemptions'), orderBy('redeemedAt', 'desc'));
  }, [firestore]);

  const { data: coupons, isLoading: couponsLoading } = useCollection<CouponCode>(couponsQuery as any);
  const { data: redemptions, isLoading: redemptionsLoading } = useCollection<CouponRedemption>(redemptionsQuery as any);

  const handleEdit = (coupon: CouponCode) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'coupons', id));
      toast({
        title: 'Coupon Deleted',
        description: 'Coupon code has been deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete coupon code.',
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCoupon(undefined);
  };

  const handleSuccess = () => {
    // Data will refresh automatically via useCollection
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage coupon codes for your users</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCoupon(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update coupon details' : 'Create a new coupon code for your users'}
              </DialogDescription>
            </DialogHeader>
            <CouponForm coupon={editingCoupon} onClose={handleDialogClose} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons">
            <Tag className="w-4 h-4 mr-2" />
            Coupons ({coupons?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="redemptions">
            <Users className="w-4 h-4 mr-2" />
            Redemptions ({redemptions?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          {couponsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <CouponList coupons={coupons || []} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </TabsContent>

        <TabsContent value="redemptions">
          {redemptionsLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <RedemptionList redemptions={redemptions || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

