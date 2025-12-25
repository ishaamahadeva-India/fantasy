'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { 
  FantasyCampaign, 
  FantasyEvent, 
  CampaignMovie, 
  CampaignType,
  EntryFeeConfig,
  RewardConfig,
  PointsConfig
} from '@/lib/types';

// Type for a new campaign, before it's saved
type NewFantasyCampaign = {
  title: string;
  campaignType: CampaignType;
  description?: string;
  prizePool?: string;
  sponsorName?: string;
  sponsorLogo?: string;
  
  // Single movie (for backward compatibility)
  movieId?: string;
  movieTitle?: string;
  movieLanguage?: string;
  
  // Multiple movies
  movies?: CampaignMovie[];
  
  // Campaign settings
  startDate: Date;
  endDate?: Date;
  status: 'upcoming' | 'active' | 'completed';
  visibility: 'public' | 'private' | 'invite_only';
  maxParticipants?: number;
  
  // Entry and rewards
  entryFee: EntryFeeConfig;
  rewards?: RewardConfig[];
  
  createdBy?: string;
};

// Type for a new event
type NewFantasyEvent = {
  title: string;
  description: string;
  eventType: 'choice_selection' | 'numeric_prediction' | 'draft_selection';
  status: 'upcoming' | 'live' | 'completed';
  startDate: Date;
  endDate: Date;
  points: number;
  options?: string[];
  rules?: string[];
  draftConfig?: {
    budget: number;
    roles: Array<{ id: string; title: string; players: string[] }>;
    playerCredits: Record<string, number>;
  };
};

// Helper function to remove undefined values from an object recursively
function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue; // Skip undefined values
    }
    // Handle arrays
    if (Array.isArray(value)) {
      cleaned[key] = value.map(item => 
        typeof item === 'object' && item !== null ? removeUndefinedValues(item) : item
      );
    }
    // Handle nested objects
    else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      cleaned[key] = removeUndefinedValues(value);
    }
    // Handle strings - filter out empty strings for optional fields
    else if (typeof value === 'string' && value.trim() === '' && 
             (key === 'sponsorLogo' || key === 'sponsorName' || key === 'description' || 
              key === 'prizePool' || key === 'movieTitle' || key === 'movieLanguage')) {
      continue; // Skip empty strings for optional fields
    }
    else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Adds a new fantasy campaign to the 'fantasy-campaigns' collection.
 */
export function addFantasyCampaign(firestore: Firestore, campaignData: NewFantasyCampaign) {
  const campaignsCollection = collection(firestore, 'fantasy-campaigns');
  
  // Build the document to save
  const docToSave: Record<string, any> = {
    title: campaignData.title,
    campaignType: campaignData.campaignType,
    startDate: campaignData.startDate,
    status: campaignData.status,
    visibility: campaignData.visibility,
    entryFee: campaignData.entryFee,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Add optional fields only if they have values
  if (campaignData.description && campaignData.description.trim() !== '') {
    docToSave.description = campaignData.description;
  }
  if (campaignData.prizePool && campaignData.prizePool.trim() !== '') {
    docToSave.prizePool = campaignData.prizePool;
  }
  if (campaignData.sponsorName && campaignData.sponsorName.trim() !== '') {
    docToSave.sponsorName = campaignData.sponsorName;
  }
  if (campaignData.sponsorLogo && campaignData.sponsorLogo.trim() !== '') {
    docToSave.sponsorLogo = campaignData.sponsorLogo;
  }
  if (campaignData.endDate) {
    docToSave.endDate = campaignData.endDate;
  }
  if (campaignData.maxParticipants !== undefined && campaignData.maxParticipants !== null) {
    docToSave.maxParticipants = campaignData.maxParticipants;
  }
  if (campaignData.rewards && campaignData.rewards.length > 0) {
    docToSave.rewards = campaignData.rewards;
  }
  if (campaignData.createdBy) {
    docToSave.createdBy = campaignData.createdBy;
  }
  
  // Handle single movie fields
  if (campaignData.campaignType === 'single_movie') {
    if (campaignData.movieId && campaignData.movieId.trim() !== '') {
      docToSave.movieId = campaignData.movieId;
    }
    if (campaignData.movieTitle && campaignData.movieTitle.trim() !== '') {
      docToSave.movieTitle = campaignData.movieTitle;
    }
    if (campaignData.movieLanguage && campaignData.movieLanguage.trim() !== '') {
      docToSave.movieLanguage = campaignData.movieLanguage;
    }
  }
  
  // Handle multiple movies
  if (campaignData.campaignType === 'multiple_movies' && campaignData.movies && campaignData.movies.length > 0) {
    docToSave.movies = campaignData.movies;
  }
  
  // Final cleanup to remove any undefined values (safety check)
  const cleanData = removeUndefinedValues(docToSave);

  return addDoc(campaignsCollection, cleanData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: campaignsCollection.path,
        operation: 'create',
        requestResourceData: cleanData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing fantasy campaign.
 */
export function updateFantasyCampaign(
  firestore: Firestore,
  campaignId: string,
  campaignData: Partial<NewFantasyCampaign>
) {
  const campaignDocRef = doc(firestore, 'fantasy-campaigns', campaignId);
  
  // Build update object, only including defined fields
  const docToUpdate: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  
  // Only add fields that are defined
  Object.keys(campaignData).forEach(key => {
    const value = (campaignData as any)[key];
    if (value !== undefined) {
      // For strings, skip empty strings for optional fields
      if (typeof value === 'string' && value.trim() === '' && 
          (key === 'sponsorLogo' || key === 'sponsorName' || key === 'description' || 
           key === 'prizePool' || key === 'movieTitle' || key === 'movieLanguage')) {
        return; // Skip empty strings
      }
      docToUpdate[key] = value;
    }
  });
  
  // Final cleanup to remove any undefined values
  const cleanData = removeUndefinedValues(docToUpdate);

  return updateDoc(campaignDocRef, cleanData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: campaignDocRef.path,
        operation: 'update',
        requestResourceData: cleanData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes a fantasy campaign.
 */
export function deleteFantasyCampaign(firestore: Firestore, campaignId: string) {
  const campaignDocRef = doc(firestore, 'fantasy-campaigns', campaignId);
  return deleteDoc(campaignDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: campaignDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Adds an event to a campaign.
 */
export function addCampaignEvent(
  firestore: Firestore,
  campaignId: string,
  eventData: NewFantasyEvent
) {
  const eventsCollection = collection(firestore, 'fantasy-campaigns', campaignId, 'events');
  const docToSave = {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(eventsCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eventsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an event in a campaign.
 */
export function updateCampaignEvent(
  firestore: Firestore,
  campaignId: string,
  eventId: string,
  eventData: Partial<NewFantasyEvent>
) {
  const eventDocRef = doc(firestore, 'fantasy-campaigns', campaignId, 'events', eventId);
  const docToUpdate = {
    ...eventData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(eventDocRef, docToUpdate)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eventDocRef.path,
        operation: 'update',
        requestResourceData: docToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes an event from a campaign.
 */
export function deleteCampaignEvent(
  firestore: Firestore,
  campaignId: string,
  eventId: string
) {
  const eventDocRef = doc(firestore, 'fantasy-campaigns', campaignId, 'events', eventId);
  return deleteDoc(eventDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: eventDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Predefined event templates for movie fantasy campaigns
 */
export const EVENT_TEMPLATES: Array<{
  title: string;
  description: string;
  eventType: FantasyEvent['eventType'];
  defaultPoints: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  defaultOptions?: string[];
  defaultRules?: string[];
}> = [
  {
    title: 'Pre-Release Event Location',
    description: 'Predict the primary location of the main pre-release event.',
    eventType: 'choice_selection',
    defaultPoints: 25,
    defaultOptions: ['Hyderabad', 'Vizag', 'Dubai', 'Mumbai', 'Chennai', 'Bangalore'],
    defaultRules: ['The location of the main stage event will be considered final.'],
  },
  {
    title: 'First Teaser Views (24h)',
    description: 'Predict the range of total views for the first teaser across all official channels in its first 24 hours.',
    eventType: 'choice_selection',
    defaultPoints: 50,
    defaultOptions: ['0 - 10 Million', '10 - 20 Million', '20 - 30 Million', '30 Million+'],
    defaultRules: ['Views from official YouTube, X, and Instagram channels only.'],
  },
  {
    title: 'First Look Views (24h)',
    description: 'Predict the range of total views for the first look across all official channels in its first 24 hours.',
    eventType: 'choice_selection',
    defaultPoints: 50,
    defaultOptions: ['0 - 10 Million', '10 - 20 Million', '20 - 30 Million', '30 Million+'],
    defaultRules: ['Views from official YouTube, X, and Instagram channels only.'],
  },
  {
    title: 'First Look Views (1hr)',
    description: 'Predict the range of total views for the first look in its first hour.',
    eventType: 'choice_selection',
    defaultPoints: 20,
    defaultOptions: ['0 - 1 Million', '1 - 2 Million', '2 Million+'],
    defaultRules: ['Views from official YouTube, X, and Instagram channels only.'],
  },
  {
    title: 'First Look Views (7 Days)',
    description: 'Predict the range of total views for the first look after 7 days.',
    eventType: 'choice_selection',
    defaultPoints: 100,
    defaultOptions: ['0 - 50 Million', '50 - 100 Million', '100 Million+'],
    defaultRules: ['Views from official YouTube, X, and Instagram channels only.'],
  },
  {
    title: 'Trailer Views (24h)',
    description: 'Predict the range of total views for the official trailer across all official channels within the first 24 hours.',
    eventType: 'choice_selection',
    defaultPoints: 75,
    defaultOptions: ['0 - 25 Million', '25 - 50 Million', '50 - 75 Million', '75 Million+'],
    defaultRules: [
      'Views from official YouTube channels only.',
      'The 24-hour window starts from the exact time of the trailer release.',
    ],
  },
  {
    title: 'First Song Streaming Milestone',
    description: 'Which streaming platform will be the first to report 10 million streams for the first single?',
    eventType: 'choice_selection',
    defaultPoints: 40,
    defaultOptions: ['Spotify', 'Gaana', 'JioSaavn', 'Apple Music', 'YouTube Music'],
    defaultRules: ['Official reports from platform holders or the production house will be considered final.'],
  },
  {
    title: 'Opening Day Box Office Collection',
    description: 'Predict the range of opening day box office collections (in crores).',
    eventType: 'choice_selection',
    defaultPoints: 150,
    defaultOptions: ['0 - 10 Cr', '10 - 20 Cr', '20 - 30 Cr', '30 - 50 Cr', '50 Cr+'],
    defaultRules: ['Official box office reports will be considered final.'],
  },
  {
    title: 'First Weekend Box Office Collection',
    description: 'Predict the range of first weekend (3 days) box office collections (in crores).',
    eventType: 'choice_selection',
    defaultPoints: 200,
    defaultOptions: ['0 - 30 Cr', '30 - 50 Cr', '50 - 75 Cr', '75 - 100 Cr', '100 Cr+'],
    defaultRules: ['Official box office reports will be considered final.'],
  },
  {
    title: 'First Week Box Office Collection',
    description: 'Predict the range of first week box office collections (in crores).',
    eventType: 'choice_selection',
    defaultPoints: 250,
    defaultOptions: ['0 - 50 Cr', '50 - 100 Cr', '100 - 150 Cr', '150 - 200 Cr', '200 Cr+'],
    defaultRules: ['Official box office reports will be considered final.'],
  },
  {
    title: 'IMDb Rating Prediction',
    description: 'Predict the IMDb rating range the movie will achieve after 1000+ reviews.',
    eventType: 'choice_selection',
    defaultPoints: 100,
    defaultOptions: ['Below 6.0', '6.0 - 7.0', '7.0 - 8.0', '8.0 - 9.0', '9.0+'],
    defaultRules: ['IMDb rating after 1000+ verified reviews will be considered final.'],
  },
  {
    title: 'Full Team Draft (Release Week)',
    description: 'Draft your fantasy team for the opening weekend. Your team will score points based on performance mentions, social media buzz, and critics\' ratings.',
    eventType: 'draft_selection',
    defaultPoints: 200,
    difficultyLevel: 'hard',
    defaultRules: [
      'You have a budget of 100 credits.',
      'You must select one player for each role.',
      'Select one player as your Captain to earn 1.5x points.',
    ],
  },
  {
    title: 'Opening Day Collection Range',
    description: 'Predict the opening day box office collection range (in crores).',
    eventType: 'opening_day_collection',
    defaultPoints: 150,
    difficultyLevel: 'medium',
    defaultOptions: ['0 - 10 Cr', '10 - 20 Cr', '20 - 30 Cr', '30 - 50 Cr', '50 Cr+'],
    defaultRules: ['Official box office reports will be considered final.'],
  },
  {
    title: 'First Weekend Collection',
    description: 'Predict the first weekend (3 days) box office collection range (in crores).',
    eventType: 'weekend_collection',
    defaultPoints: 200,
    difficultyLevel: 'medium',
    defaultOptions: ['0 - 30 Cr', '30 - 50 Cr', '50 - 75 Cr', '75 - 100 Cr', '100 Cr+'],
    defaultRules: ['Official box office reports will be considered final.'],
  },
  {
    title: 'Lifetime Gross Collection',
    description: 'Predict the lifetime gross box office collection range (in crores).',
    eventType: 'lifetime_gross',
    defaultPoints: 300,
    difficultyLevel: 'hard',
    defaultOptions: ['0 - 50 Cr', '50 - 100 Cr', '100 - 200 Cr', '200 - 300 Cr', '300 Cr+'],
    defaultRules: ['Official box office reports will be considered final.'],
  },
  {
    title: 'IMDb Rating Range',
    description: 'Predict the IMDb rating range the movie will achieve after 1000+ reviews.',
    eventType: 'imdb_rating',
    defaultPoints: 100,
    difficultyLevel: 'medium',
    defaultOptions: ['Below 6.0', '6.0 - 7.0', '7.0 - 8.0', '8.0 - 9.0', '9.0+'],
    defaultRules: ['IMDb rating after 1000+ verified reviews will be considered final.'],
  },
  {
    title: 'Opening Day Occupancy Percentage',
    description: 'Predict the opening day theater occupancy percentage range.',
    eventType: 'occupancy_percentage',
    defaultPoints: 75,
    difficultyLevel: 'easy',
    defaultOptions: ['0 - 30%', '30 - 50%', '50 - 70%', '70 - 85%', '85%+'],
    defaultRules: ['Average occupancy across all theaters will be considered.'],
  },
  {
    title: 'Day-1 Talk (Hit/Average/Flop)',
    description: 'Predict the Day-1 audience talk and word-of-mouth verdict.',
    eventType: 'day1_talk',
    defaultPoints: 50,
    difficultyLevel: 'easy',
    defaultOptions: ['Hit', 'Average', 'Flop'],
    defaultRules: ['Based on social media sentiment and audience reviews on Day 1.'],
  },
  {
    title: 'Awards / Trending Rank',
    description: 'Predict the movie\'s ranking in awards season or trending charts.',
    eventType: 'awards_rank',
    defaultPoints: 80,
    difficultyLevel: 'medium',
    defaultOptions: ['Top 3', 'Top 5', 'Top 10', 'Top 20', 'Below Top 20'],
    defaultRules: ['Based on official awards nominations or trending charts.'],
  },
  {
    title: 'OTT Platform Debut Week Rank',
    description: 'Predict the movie\'s ranking on OTT platform in its debut week.',
    eventType: 'ott_debut_rank',
    defaultPoints: 60,
    difficultyLevel: 'easy',
    defaultOptions: ['#1', '#2-3', '#4-5', '#6-10', 'Below Top 10'],
    defaultRules: ['Based on official OTT platform rankings.'],
  },
];

