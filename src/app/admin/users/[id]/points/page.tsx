'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { updateUserPoints } from '@/firebase/firestore/users';
import { ArrowLeft, Coins, AlertCircle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserPointsManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustingPoints, setAdjustingPoints] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'admin_adjustment' as 'admin_adjustment' | 'bonus' | 'refund',
    reason: '',
    description: '',
  });

  useEffect(() => {
    if (!firestore || !userId) return;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile({ id: userSnap.id, ...userSnap.data() });
        } else {
          toast({
            variant: 'destructive',
            title: 'User Not Found',
            description: 'The user does not exist.',
          });
          router.back();
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [firestore, userId, router]);

  const handleAdjustPoints = async () => {
    if (!firestore || !currentUser) return;

    const amount = Number(adjustmentData.amount);
    if (isNaN(amount) || amount === 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid non-zero amount.',
      });
      return;
    }

    if (!adjustmentData.reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for this adjustment.',
      });
      return;
    }

    // Check if deduction would result in negative balance
    const currentBalance = userProfile?.points || 0;
    if (amount < 0 && currentBalance + amount < 0) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: `User has ${currentBalance} points. Cannot deduct ${Math.abs(amount)} points.`,
      });
      return;
    }

    setAdjustingPoints(true);
    try {
      await updateUserPoints(
        firestore,
        userId,
        amount,
        adjustmentData.description || `Admin adjustment: ${adjustmentData.reason}`,
        {
          type: adjustmentData.type,
          reason: adjustmentData.reason,
          adminId: currentUser.uid,
          adminEmail: currentUser.email,
        },
        amount < 0 // Allow negative only if admin explicitly deducts
      );

      // Refresh user data
      const userRef = doc(firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile({ id: userSnap.id, ...userSnap.data() });
      }

      toast({
        title: 'Points Adjusted',
        description: `Successfully ${amount > 0 ? 'added' : 'deducted'} ${Math.abs(amount)} points.`,
      });

      // Reset form
      setAdjustmentData({
        amount: '',
        type: 'admin_adjustment',
        reason: '',
        description: '',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Adjustment Failed',
        description: error instanceof Error ? error.message : 'Could not adjust points.',
      });
    } finally {
      setAdjustingPoints(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const currentBalance = userProfile.points || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Points Management</h1>
          <p className="text-muted-foreground">
            Adjust points for {userProfile.username || userProfile.email || userId}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold font-code text-primary">{currentBalance}</p>
          <p className="text-sm text-muted-foreground mt-2">quizzbuzz Points</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adjust Points</CardTitle>
          <CardDescription>
            Add or deduct points for this user. All adjustments are logged and require a reason.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount (positive to add, negative to deduct)"
              value={adjustmentData.amount}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use positive numbers to add points, negative numbers to deduct.
            </p>
          </div>

          <div>
            <Label htmlFor="type">Adjustment Type</Label>
            <Select
              value={adjustmentData.type}
              onValueChange={(value: any) => setAdjustmentData({ ...adjustmentData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_adjustment">Admin Adjustment</SelectItem>
                <SelectItem value="bonus">Bonus Points</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              placeholder="Reason for this adjustment"
              value={adjustmentData.reason}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this adjustment"
              value={adjustmentData.description}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, description: e.target.value })}
              rows={3}
            />
          </div>

          {Number(adjustmentData.amount) < 0 && currentBalance + Number(adjustmentData.amount) < 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-800">
                This adjustment would result in a negative balance. The operation will be blocked.
              </p>
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!adjustmentData.amount || !adjustmentData.reason.trim() || adjustingPoints}
              >
                {adjustingPoints ? 'Processing...' : 'Confirm Adjustment'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Points Adjustment</AlertDialogTitle>
                <AlertDialogDescription>
                  {Number(adjustmentData.amount) > 0 ? (
                    <>
                      You are about to <strong>add {Math.abs(Number(adjustmentData.amount))} points</strong> to this user.
                      <br />
                      Current balance: {currentBalance} → New balance: {currentBalance + Number(adjustmentData.amount)}
                    </>
                  ) : (
                    <>
                      You are about to <strong>deduct {Math.abs(Number(adjustmentData.amount))} points</strong> from this user.
                      <br />
                      Current balance: {currentBalance} → New balance: {currentBalance + Number(adjustmentData.amount)}
                    </>
                  )}
                  <br />
                  <br />
                  <strong>Reason:</strong> {adjustmentData.reason}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAdjustPoints} disabled={adjustingPoints}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

