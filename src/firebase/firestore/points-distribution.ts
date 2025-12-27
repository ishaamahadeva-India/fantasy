'use client';

import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  type Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { updateUserPoints } from './users';
import { calculatePoints, calculateTotalCampaignPoints, calculateMovieWisePoints } from '@/lib/points-engine';
import type { FantasyEvent, UserPrediction, EventResult, UserParticipation } from '@/lib/types';

/**
 * Distribution status to prevent duplicate distributions
 */
export type PointsDistributionStatus = {
  distributed: boolean;
  distributedAt?: Date;
  distributedBy?: string;
  totalUsers: number;
  totalPointsDistributed: number;
};

/**
 * Distributes points to all users who participated in a campaign
 * after all events have been verified and approved
 */
export async function distributeCampaignPoints(
  firestore: Firestore,
  campaignId: string,
  distributedBy: string
): Promise<{ success: boolean; usersUpdated: number; totalPointsDistributed: number; errors: string[] }> {
  const errors: string[] = [];
  let usersUpdated = 0;
  let totalPointsDistributed = 0;

  try {
    // 1. Fetch all events for the campaign
    const eventsRef = collection(firestore, 'fantasy-campaigns', campaignId, 'events');
    const eventsSnapshot = await getDocs(eventsRef);
    const events: FantasyEvent[] = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as FantasyEvent));

    if (events.length === 0) {
      return { success: false, usersUpdated: 0, totalPointsDistributed: 0, errors: ['No events found for this campaign'] };
    }

    // 2. Check if all events are verified and approved
    const allEventsVerified = events.every(event => 
      event.result?.verified === true && event.result?.approved === true
    );

    if (!allEventsVerified) {
      return { 
        success: false, 
        usersUpdated: 0, 
        totalPointsDistributed: 0, 
        errors: ['Not all events are verified and approved'] 
      };
    }

    // 3. Check if points have already been distributed
    const campaignRef = doc(firestore, 'fantasy-campaigns', campaignId);
    const campaignDocSnap = await getDoc(campaignRef);
    const campaignData = campaignDocSnap.data();
    
    if (campaignData?.pointsDistributed === true) {
      return { 
        success: false, 
        usersUpdated: 0, 
        totalPointsDistributed: 0, 
        errors: ['Points have already been distributed for this campaign'] 
      };
    }

    // 4. Create a map of event results
    const resultsMap = new Map<string, EventResult>();
    events.forEach(event => {
      if (event.result && event.result.verified && event.result.approved) {
        resultsMap.set(event.id, event.result);
      }
    });

    // 5. Fetch all participations
    const participationsRef = collection(firestore, 'fantasy-campaigns', campaignId, 'participations');
    const participationsSnapshot = await getDocs(participationsRef);
    const participations = participationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as UserParticipation & { id: string }));

    if (participations.length === 0) {
      return { success: false, usersUpdated: 0, totalPointsDistributed: 0, errors: ['No participations found'] };
    }

    // 6. For each participation, fetch predictions and calculate points
    const distributionPromises = participations.map(async (participation) => {
      try {
        const userId = participation.userId;
        const predictions: UserPrediction[] = [];

        // Fetch predictions for each event
        for (const event of events) {
          const predictionsRef = collection(
            firestore,
            'fantasy-campaigns',
            campaignId,
            'events',
            event.id,
            'predictions'
          );
          const predictionsQuery = query(predictionsRef, where('userId', '==', userId));
          const predictionsSnapshot = await getDocs(predictionsQuery);
          
          predictionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            predictions.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
            } as UserPrediction);
          });
        }

        if (predictions.length === 0) {
          return; // Skip if no predictions
        }

        // Calculate total points for this user
        const totalPoints = calculateTotalCampaignPoints(events, predictions, resultsMap);
        const movieWisePoints = calculateMovieWisePoints(events, predictions, resultsMap);
        const correctPredictions = predictions.filter(p => {
          const event = events.find(e => e.id === p.eventId);
          const result = resultsMap.get(p.eventId);
          if (!event || !result) return false;
          const calc = calculatePoints(event, p, result);
          return calc.isCorrect;
        }).length;

        // Update user balance
        if (totalPoints > 0) {
          await updateUserPoints(
            firestore,
            userId,
            totalPoints,
            `Points earned from fantasy campaign: ${campaignId}`,
            {
              type: 'campaign_earned',
              campaignId,
              totalPoints,
              correctPredictions,
            }
          );
          totalPointsDistributed += totalPoints;
        }

        // Update participation document
        const participationRef = doc(firestore, 'fantasy-campaigns', campaignId, 'participations', participation.id);
        await updateDoc(participationRef, {
          totalPoints,
          movieWisePoints,
          correctPredictions,
          predictionsCount: predictions.length,
          lastUpdated: serverTimestamp(),
          pointsAwarded: true,
          pointsAwardedAt: serverTimestamp(),
        });

        usersUpdated++;
      } catch (error) {
        const errorMsg = `Error distributing points for user ${participation.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    });

    await Promise.all(distributionPromises);

    // 7. Mark campaign as having distributed points
    if (usersUpdated > 0) {
      await updateDoc(campaignRef, {
        pointsDistributed: true,
        pointsDistributedAt: serverTimestamp(),
        pointsDistributedBy: distributedBy,
        pointsDistributionStats: {
          totalUsers: usersUpdated,
          totalPointsDistributed,
        },
      });
    }

    return {
      success: usersUpdated > 0,
      usersUpdated,
      totalPointsDistributed,
      errors,
    };
  } catch (error) {
    const errorMsg = `Failed to distribute campaign points: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMsg);
    console.error(errorMsg, error);
    return {
      success: false,
      usersUpdated,
      totalPointsDistributed,
      errors,
    };
  }
}

/**
 * Checks if points can be distributed for a campaign
 */
export async function canDistributePoints(
  firestore: Firestore,
  campaignId: string
): Promise<{ canDistribute: boolean; reason?: string }> {
  try {
    // Check if already distributed
    const campaignRef = doc(firestore, 'fantasy-campaigns', campaignId);
    const campaignDocSnap = await getDoc(campaignRef);
    const campaignData = campaignDocSnap.data();
    
    if (campaignData?.pointsDistributed === true) {
      return { canDistribute: false, reason: 'Points have already been distributed' };
    }

    // Check if all events are verified and approved
    const eventsRef = collection(firestore, 'fantasy-campaigns', campaignId, 'events');
    const eventsSnapshot = await getDocs(eventsRef);
    const events = eventsSnapshot.docs.map(doc => doc.data() as FantasyEvent);

    if (events.length === 0) {
      return { canDistribute: false, reason: 'No events found' };
    }

    const allVerified = events.every(event => 
      event.result?.verified === true && event.result?.approved === true
    );

    if (!allVerified) {
      const unverifiedCount = events.filter(e => !e.result?.verified || !e.result?.approved).length;
      return { canDistribute: false, reason: `${unverifiedCount} event(s) not verified/approved` };
    }

    return { canDistribute: true };
  } catch (error) {
    return { canDistribute: false, reason: `Error checking: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

