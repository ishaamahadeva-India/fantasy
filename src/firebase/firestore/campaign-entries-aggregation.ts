'use client';

import {
  collection,
  query,
  where,
  getDocs,
  type Firestore,
} from 'firebase/firestore';
import type { CampaignEntry } from '@/lib/types';

/**
 * Aggregation results for campaign entries
 */
export type CampaignEntryAggregation = {
  totalEntries: number;
  uniqueParticipants: number;
  totalRevenue: number;
  paidEntries: number;
  pendingEntries: number;
  refundedEntries: number;
  averageEntryFee: number;
  revenueByTier: Record<string, number>; // tier -> revenue
  revenueByPaymentMethod: Record<string, number>; // method -> revenue
  entriesByCity: Record<string, number>; // city -> count
  entriesByState: Record<string, number>; // state -> count
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    entries: number;
  }>;
};

/**
 * Gets aggregation statistics for campaign entries
 */
export async function getCampaignEntryStats(
  firestore: Firestore,
  campaignId?: string
): Promise<CampaignEntryAggregation> {
  const entriesRef = collection(firestore, 'campaign-entries');
  const q = campaignId
    ? query(entriesRef, where('campaignId', '==', campaignId))
    : entriesRef;
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CampaignEntry[];

  return aggregateCampaignEntries(entries);
}

/**
 * Gets entry stats for multiple campaigns
 */
export async function getMultipleCampaignEntryStats(
  firestore: Firestore,
  campaignIds: string[]
): Promise<Record<string, CampaignEntryAggregation>> {
  const stats: Record<string, CampaignEntryAggregation> = {};

  await Promise.all(
    campaignIds.map(async (campaignId) => {
      try {
        stats[campaignId] = await getCampaignEntryStats(
          firestore,
          campaignId
        );
      } catch (error) {
        console.error(`Error fetching entry stats for campaign ${campaignId}:`, error);
        stats[campaignId] = getEmptyEntryAggregation();
      }
    })
  );

  return stats;
}

/**
 * Gets overall platform entry statistics
 */
export async function getOverallEntryStats(
  firestore: Firestore
): Promise<CampaignEntryAggregation> {
  return getCampaignEntryStats(firestore);
}

/**
 * Aggregates campaign entry data
 */
function aggregateCampaignEntries(
  entries: CampaignEntry[]
): CampaignEntryAggregation {
  if (entries.length === 0) {
    return getEmptyEntryAggregation();
  }

  const totalEntries = entries.length;
  const uniqueParticipants = new Set(entries.map((e) => e.userId)).size;

  // Payment status breakdown
  const paidEntries = entries.filter(
    (e) => e.paymentStatus === 'paid'
  ).length;
  const pendingEntries = entries.filter(
    (e) => e.paymentStatus === 'pending'
  ).length;
  const refundedEntries = entries.filter(
    (e) => e.paymentStatus === 'refunded'
  ).length;

  // Revenue calculations
  const paidEntriesList = entries.filter(
    (e) => e.paymentStatus === 'paid' && e.entryFee
  );
  const totalRevenue = paidEntriesList.reduce(
    (sum, e) => sum + (e.entryFee || 0),
    0
  );
  const averageEntryFee =
    paidEntriesList.length > 0
      ? totalRevenue / paidEntriesList.length
      : 0;

  // Revenue by tier
  const revenueByTier: Record<string, number> = {};
  paidEntriesList.forEach((e) => {
    const tier = e.entryFeeTier || 'default';
    revenueByTier[tier] = (revenueByTier[tier] || 0) + (e.entryFee || 0);
  });

  // Revenue by payment method
  const revenueByPaymentMethod: Record<string, number> = {};
  paidEntriesList.forEach((e) => {
    const method = e.paymentMethod || 'unknown';
    revenueByPaymentMethod[method] =
      (revenueByPaymentMethod[method] || 0) + (e.entryFee || 0);
  });

  // Entries by city
  const entriesByCity: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.city) {
      entriesByCity[e.city] = (entriesByCity[e.city] || 0) + 1;
    }
  });

  // Entries by state
  const entriesByState: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.state) {
      entriesByState[e.state] = (entriesByState[e.state] || 0) + 1;
    }
  });

  // Monthly revenue
  const monthlyData: Record<
    string,
    { revenue: number; participants: Set<string> }
  > = {};
  paidEntriesList.forEach((e) => {
    const date =
      e.joinedAt instanceof Date
        ? e.joinedAt
        : (e.joinedAt as any)?.toDate
        ? (e.joinedAt as any).toDate()
        : new Date();
    const monthKey = date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, participants: new Set() };
    }
    monthlyData[monthKey].revenue += e.entryFee || 0;
    monthlyData[monthKey].participants.add(e.userId);
  });

  const monthlyRevenue = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      entries: data.participants.size,
    }))
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    totalEntries,
    uniqueParticipants,
    totalRevenue,
    paidEntries,
    pendingEntries,
    refundedEntries,
    averageEntryFee,
    revenueByTier,
    revenueByPaymentMethod,
    entriesByCity,
    entriesByState,
    monthlyRevenue,
  };
}

/**
 * Returns empty aggregation structure
 */
function getEmptyEntryAggregation(): CampaignEntryAggregation {
  return {
    totalEntries: 0,
    uniqueParticipants: 0,
    totalRevenue: 0,
    paidEntries: 0,
    pendingEntries: 0,
    refundedEntries: 0,
    averageEntryFee: 0,
    revenueByTier: {},
    revenueByPaymentMethod: {},
    entriesByCity: {},
    entriesByState: {},
    monthlyRevenue: [],
  };
}

