'use client';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { CampaignLeaderboard, LeaderboardEntry } from '@/lib/types';

/**
 * Creates or updates a campaign leaderboard
 */
export function updateCampaignLeaderboard(
  firestore: Firestore,
  campaignId: string,
  leaderboardType: 'overall' | 'movie_wise' | 'city_wise' | 'state_wise',
  entries: LeaderboardEntry[],
  movieId?: string
) {
  const leaderboardPath = movieId
    ? `campaigns/${campaignId}/leaderboards/${leaderboardType}_${movieId}`
    : `campaigns/${campaignId}/leaderboards/${leaderboardType}`;
  
  const leaderboardDocRef = doc(firestore, leaderboardPath);
  const leaderboardData: CampaignLeaderboard = {
    campaignId,
    type: leaderboardType,
    movieId,
    entries: entries.sort((a, b) => b.totalPoints - a.totalPoints).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })),
    lastUpdated: new Date(),
  };

  return setDoc(leaderboardDocRef, {
    ...leaderboardData,
    lastUpdated: serverTimestamp(),
  })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: leaderboardDocRef.path,
        operation: 'update',
        requestResourceData: leaderboardData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Gets a campaign leaderboard
 */
export async function getCampaignLeaderboard(
  firestore: Firestore,
  campaignId: string,
  leaderboardType: 'overall' | 'movie_wise' | 'city_wise' | 'state_wise',
  movieId?: string
) {
  const leaderboardPath = movieId
    ? `campaigns/${campaignId}/leaderboards/${leaderboardType}_${movieId}`
    : `campaigns/${campaignId}/leaderboards/${leaderboardType}`;
  
  const leaderboardDocRef = doc(firestore, leaderboardPath);
  const snapshot = await getDoc(leaderboardDocRef);
  
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as unknown as CampaignLeaderboard;
}

