'use client';

import {
  collection,
  query,
  where,
  getDocs,
  type Firestore,
} from 'firebase/firestore';
import type { UserParticipation } from '@/lib/types';

/**
 * Aggregation results for participations
 */
export type ParticipationAggregation = {
  totalParticipants: number;
  totalPoints: number;
  averagePoints: number;
  totalPredictions: number;
  totalCorrectPredictions: number;
  accuracyRate: number; // Percentage
  topParticipants: Array<{
    userId: string;
    totalPoints: number;
    rank: number;
  }>;
};

/**
 * Gets aggregation statistics for campaign participations
 */
export async function getCampaignParticipationStats(
  firestore: Firestore,
  campaignId: string
): Promise<ParticipationAggregation> {
  const participationsRef = collection(
    firestore,
    'fantasy-campaigns',
    campaignId,
    'participations'
  );
  const snapshot = await getDocs(participationsRef);
  const participations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    })) as unknown as UserParticipation[];

  return aggregateParticipations(participations);
}

/**
 * Gets aggregation statistics for tournament participations
 */
export async function getTournamentParticipationStats(
  firestore: Firestore,
  tournamentId: string
): Promise<ParticipationAggregation> {
  const participationsRef = collection(
    firestore,
    'cricket-tournaments',
    tournamentId,
    'participations'
  );
  const snapshot = await getDocs(participationsRef);
  const participations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    })) as unknown as UserParticipation[];

  return aggregateParticipations(participations);
}

/**
 * Gets participation stats for multiple campaigns
 */
export async function getMultipleCampaignStats(
  firestore: Firestore,
  campaignIds: string[]
): Promise<Record<string, ParticipationAggregation>> {
  const stats: Record<string, ParticipationAggregation> = {};

  await Promise.all(
    campaignIds.map(async (campaignId) => {
      try {
        stats[campaignId] = await getCampaignParticipationStats(
          firestore,
          campaignId
        );
      } catch (error) {
        console.error(`Error fetching stats for campaign ${campaignId}:`, error);
        stats[campaignId] = getEmptyAggregation();
      }
    })
  );

  return stats;
}

/**
 * Gets participation stats for multiple tournaments
 */
export async function getMultipleTournamentStats(
  firestore: Firestore,
  tournamentIds: string[]
): Promise<Record<string, ParticipationAggregation>> {
  const stats: Record<string, ParticipationAggregation> = {};

  await Promise.all(
    tournamentIds.map(async (tournamentId) => {
      try {
        stats[tournamentId] = await getTournamentParticipationStats(
          firestore,
          tournamentId
        );
      } catch (error) {
        console.error(`Error fetching stats for tournament ${tournamentId}:`, error);
        stats[tournamentId] = getEmptyAggregation();
      }
    })
  );

  return stats;
}

/**
 * Aggregates participation data
 */
function aggregateParticipations(
  participations: UserParticipation[]
): ParticipationAggregation {
  if (participations.length === 0) {
    return getEmptyAggregation();
  }

  const totalParticipants = participations.length;
  const totalPoints = participations.reduce(
    (sum, p) => sum + (p.totalPoints || 0),
    0
  );
  const averagePoints = totalPoints / totalParticipants;

  const totalPredictions = participations.reduce(
    (sum, p) => sum + (p.predictionsCount || 0),
    0
  );
  const totalCorrectPredictions = participations.reduce(
    (sum, p) => sum + (p.correctPredictions || 0),
    0
  );
  const accuracyRate =
    totalPredictions > 0
      ? (totalCorrectPredictions / totalPredictions) * 100
      : 0;

  // Get top 10 participants
  const sorted = [...participations].sort(
    (a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)
  );
  const topParticipants = sorted.slice(0, 10).map((p, index) => ({
    userId: p.userId,
    totalPoints: p.totalPoints || 0,
    rank: index + 1,
  }));

  return {
    totalParticipants,
    totalPoints,
    averagePoints,
    totalPredictions,
    totalCorrectPredictions,
    accuracyRate,
    topParticipants,
  };
}

/**
 * Returns empty aggregation structure
 */
function getEmptyAggregation(): ParticipationAggregation {
  return {
    totalParticipants: 0,
    totalPoints: 0,
    averagePoints: 0,
    totalPredictions: 0,
    totalCorrectPredictions: 0,
    accuracyRate: 0,
    topParticipants: [],
  };
}

