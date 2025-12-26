'use client';

import {
  collection,
  getDocs,
  type Firestore,
} from 'firebase/firestore';

/**
 * Aggregation results for participations
 */
export type ParticipationsAggregation = {
  totalParticipations: number;
  uniqueParticipants: number;
  participationsByCampaign: Record<string, number>; // campaignId -> count
};

/**
 * Gets aggregation statistics for participations across all campaigns
 */
export async function getParticipationsStats(
  firestore: Firestore
): Promise<ParticipationsAggregation> {
  // Get all campaigns
  const campaignsRef = collection(firestore, 'fantasy-campaigns');
  const campaignsSnapshot = await getDocs(campaignsRef);
  const campaignIds = campaignsSnapshot.docs.map(doc => doc.id);

  const allParticipations: Array<{ campaignId: string; userId: string }> = [];
  const participationsByCampaign: Record<string, number> = {};
  const uniqueParticipants = new Set<string>();

  // Fetch participations from each campaign's subcollection
  await Promise.all(
    campaignIds.map(async (campaignId) => {
      try {
        const participationsRef = collection(
          firestore,
          'fantasy-campaigns',
          campaignId,
          'participations'
        );
        const participationsSnapshot = await getDocs(participationsRef);
        
        participationsByCampaign[campaignId] = participationsSnapshot.size;
        
        participationsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId || doc.id;
          allParticipations.push({ campaignId, userId });
          uniqueParticipants.add(userId);
        });
      } catch (error) {
        console.error(`Error fetching participations for campaign ${campaignId}:`, error);
        participationsByCampaign[campaignId] = 0;
      }
    })
  );

  return {
    totalParticipations: allParticipations.length,
    uniqueParticipants: uniqueParticipants.size,
    participationsByCampaign,
  };
}
