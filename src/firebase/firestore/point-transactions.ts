'use client';

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type Firestore,
  serverTimestamp,
  Timestamp,
  type FieldValue,
} from 'firebase/firestore';

/**
 * Point transaction types
 */
export type PointTransactionType = 
  | 'campaign_earned'      // Points earned from fantasy campaign
  | 'quiz_completed'        // Points from quiz completion
  | 'rating_submitted'     // Points from ratings/feedback
  | 'redemption'            // Points deducted for redemption
  | 'admin_adjustment'     // Manual adjustment by admin
  | 'refund'                // Points refunded
  | 'bonus';                // Bonus points

/**
 * Point transaction document
 */
export type PointTransaction = {
  id?: string;
  userId: string;
  type: PointTransactionType;
  amount: number; // Positive for earned, negative for deducted
  balanceAfter: number; // User's balance after this transaction
  description: string;
  metadata?: {
    campaignId?: string;
    eventId?: string;
    quizId?: string;
    redemptionId?: string;
    adminId?: string;
    reason?: string;
    [key: string]: any;
  };
  createdAt: Date | Timestamp | FieldValue;
};

/**
 * Creates a point transaction record
 */
export async function createPointTransaction(
  firestore: Firestore,
  userId: string,
  type: PointTransactionType,
  amount: number,
  balanceAfter: number,
  description: string,
  metadata?: PointTransaction['metadata']
): Promise<string> {
  try {
    const transactionData: Omit<PointTransaction, 'id'> = {
      userId,
      type,
      amount,
      balanceAfter,
      description,
      metadata,
      createdAt: serverTimestamp(),
    };

    const transactionsRef = collection(firestore, 'point_transactions');
    const docRef = await addDoc(transactionsRef, transactionData);
    return docRef.id;
  } catch (error) {
    console.error('Failed to create point transaction:', error);
    throw error;
  }
}

/**
 * Gets point transaction history for a user
 */
export async function getUserPointTransactions(
  firestore: Firestore,
  userId: string,
  limitCount: number = 50
): Promise<PointTransaction[]> {
  try {
    const transactionsRef = collection(firestore, 'point_transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as PointTransaction;
    });
  } catch (error) {
    console.error('Failed to fetch point transactions:', error);
    throw error;
  }
}

/**
 * Gets point transactions for a specific campaign
 */
export async function getCampaignPointTransactions(
  firestore: Firestore,
  campaignId: string
): Promise<PointTransaction[]> {
  try {
    const transactionsRef = collection(firestore, 'point_transactions');
    const q = query(
      transactionsRef,
      where('metadata.campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as PointTransaction;
    });
  } catch (error) {
    console.error('Failed to fetch campaign point transactions:', error);
    throw error;
  }
}

