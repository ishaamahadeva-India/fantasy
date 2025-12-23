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
import type { CricketTournament, TournamentEvent, TournamentGroup, TournamentEventType } from '@/lib/types';

type NewCricketTournament = {
  name: string;
  format: "T20" | "ODI" | "Test" | "IPL";
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'live' | 'completed';
  teams: string[];
  groups?: TournamentGroup[];
  venue?: string;
  entryFee: {
    type: 'free' | 'paid';
    amount?: number;
    tiers?: Array<{ amount: number; label: string }>;
    seasonPass?: boolean;
  };
  maxParticipants?: number;
  matches?: string[];
  prizePool?: string;
  sponsorName?: string;
  sponsorLogo?: string;
  visibility: 'public' | 'private' | 'invite_only';
};

export type NewTournamentEvent = {
  title: string;
  description: string;
  eventType: TournamentEvent['eventType'];
  groupId?: string;
  status: 'upcoming' | 'live' | 'completed' | 'locked';
  startDate: Date;
  endDate: Date;
  lockTime?: Date;
  points: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  options?: string[];
  multiSelect?: boolean;
  maxSelections?: number;
  rules?: string[];
  applicableFormats?: ('T20' | 'ODI' | 'Test' | 'IPL')[];
};

/**
 * Adds a new cricket tournament to the 'cricket-tournaments' collection.
 */
export function addCricketTournament(firestore: Firestore, tournamentData: NewCricketTournament) {
  const tournamentsCollection = collection(firestore, 'cricket-tournaments');
  const docToSave = {
    ...tournamentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(tournamentsCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: tournamentsCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing cricket tournament.
 */
export function updateCricketTournament(
  firestore: Firestore,
  tournamentId: string,
  tournamentData: Partial<NewCricketTournament>
) {
  const tournamentDocRef = doc(firestore, 'cricket-tournaments', tournamentId);
  const docToUpdate = {
    ...tournamentData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(tournamentDocRef, docToUpdate)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: tournamentDocRef.path,
        operation: 'update',
        requestResourceData: docToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes a cricket tournament.
 */
export function deleteCricketTournament(firestore: Firestore, tournamentId: string) {
  const tournamentDocRef = doc(firestore, 'cricket-tournaments', tournamentId);
  return deleteDoc(tournamentDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: tournamentDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Adds an event to a tournament.
 */
// Helper function to remove undefined and null values from an object
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined, null, and empty arrays
    if (value === undefined || value === null) {
      continue;
    }
    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    // Skip invalid Date objects
    if (value instanceof Date && isNaN(value.getTime())) {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned as Partial<T>;
}

export function addTournamentEvent(
  firestore: Firestore,
  tournamentId: string,
  eventData: NewTournamentEvent
) {
  const eventsCollection = collection(firestore, 'cricket-tournaments', tournamentId, 'events');
  
  // Build the document with only defined values
  const docToSave: any = {
    title: eventData.title,
    description: eventData.description,
    eventType: eventData.eventType,
    tournamentId,
    status: eventData.status,
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    points: eventData.points,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  // Only add optional fields if they exist and are not undefined/null
  if (eventData.lockTime !== undefined && eventData.lockTime !== null) {
    docToSave.lockTime = eventData.lockTime;
  }
  if (eventData.difficultyLevel !== undefined && eventData.difficultyLevel !== null) {
    docToSave.difficultyLevel = eventData.difficultyLevel;
  }
  if (eventData.options !== undefined && eventData.options !== null && Array.isArray(eventData.options) && eventData.options.length > 0) {
    docToSave.options = eventData.options;
  }
  if (eventData.multiSelect !== undefined && eventData.multiSelect !== null) {
    docToSave.multiSelect = eventData.multiSelect;
  }
  if (eventData.maxSelections !== undefined && eventData.maxSelections !== null) {
    docToSave.maxSelections = eventData.maxSelections;
  }
  if (eventData.rules !== undefined && eventData.rules !== null && Array.isArray(eventData.rules) && eventData.rules.length > 0) {
    docToSave.rules = eventData.rules;
  }
  if (eventData.groupId !== undefined && eventData.groupId !== null && eventData.groupId !== '') {
    docToSave.groupId = eventData.groupId;
  }

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
 * Updates an event in a tournament.
 */
export function updateTournamentEvent(
  firestore: Firestore,
  tournamentId: string,
  eventId: string,
  eventData: Partial<NewTournamentEvent>
) {
  const eventDocRef = doc(firestore, 'cricket-tournaments', tournamentId, 'events', eventId);
  
  // Build update object with only defined values
  const docToUpdate: any = {
    updatedAt: serverTimestamp(),
  };
  
  // Only include fields that are actually provided and not undefined/null
  if (eventData.title !== undefined) docToUpdate.title = eventData.title;
  if (eventData.description !== undefined) docToUpdate.description = eventData.description;
  if (eventData.eventType !== undefined) docToUpdate.eventType = eventData.eventType;
  if (eventData.status !== undefined) docToUpdate.status = eventData.status;
  if (eventData.startDate !== undefined) docToUpdate.startDate = eventData.startDate;
  if (eventData.endDate !== undefined) docToUpdate.endDate = eventData.endDate;
  if (eventData.points !== undefined) docToUpdate.points = eventData.points;
  
  // Optional fields - only include if they have valid values
  if (eventData.lockTime !== undefined && eventData.lockTime !== null) {
    docToUpdate.lockTime = eventData.lockTime;
  } else if (eventData.lockTime === null) {
    // Explicitly remove lockTime if set to null
    docToUpdate.lockTime = null;
  }
  if (eventData.difficultyLevel !== undefined && eventData.difficultyLevel !== null) {
    docToUpdate.difficultyLevel = eventData.difficultyLevel;
  }
  if (eventData.options !== undefined && eventData.options !== null) {
    docToUpdate.options = Array.isArray(eventData.options) && eventData.options.length > 0 ? eventData.options : null;
  }
  if (eventData.multiSelect !== undefined && eventData.multiSelect !== null) {
    docToUpdate.multiSelect = eventData.multiSelect;
  }
  if (eventData.maxSelections !== undefined && eventData.maxSelections !== null) {
    docToUpdate.maxSelections = eventData.maxSelections;
  }
  if (eventData.rules !== undefined && eventData.rules !== null) {
    docToUpdate.rules = Array.isArray(eventData.rules) && eventData.rules.length > 0 ? eventData.rules : null;
  }
  if (eventData.groupId !== undefined && eventData.groupId !== null && eventData.groupId !== '') {
    docToUpdate.groupId = eventData.groupId;
  }

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
 * Deletes an event from a tournament.
 */
export function deleteTournamentEvent(
  firestore: Firestore,
  tournamentId: string,
  eventId: string
) {
  const eventDocRef = doc(firestore, 'cricket-tournaments', tournamentId, 'events', eventId);
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
 * Predefined tournament event templates
 */
export const TOURNAMENT_EVENT_TEMPLATES: Array<{
  title: string;
  description: string;
  eventType: TournamentEventType;
  defaultPoints: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  defaultOptions?: string[];
  defaultRules?: string[];
  multiSelect?: boolean;
  maxSelections?: number;
  applicableFormats?: ('T20' | 'ODI' | 'Test' | 'IPL')[];
}> = [
  // Tournament Level Predictions (Before Start)
  {
    title: 'Tournament Winner',
    description: 'Predict which team will win the tournament.',
    eventType: 'tournament_winner',
    defaultPoints: 100,
    difficultyLevel: 'hard',
    defaultRules: ['Locked before first match starts.'],
  },
  {
    title: 'Tournament Runner-up',
    description: 'Predict which team will be the runner-up.',
    eventType: 'tournament_runner_up',
    defaultPoints: 60,
    difficultyLevel: 'hard',
    defaultRules: ['Locked before first match starts.'],
  },
  {
    title: 'Semi-finalists',
    description: 'Predict the 4 teams that will reach the semi-finals.',
    eventType: 'semi_finalists',
    defaultPoints: 25,
    difficultyLevel: 'hard',
    multiSelect: true,
    maxSelections: 4,
    defaultRules: ['Select exactly 4 teams. Locked before first match starts.'],
  },
  {
    title: 'Finalists',
    description: 'Predict the 2 teams that will reach the finals.',
    eventType: 'finalists',
    defaultPoints: 50,
    difficultyLevel: 'hard',
    multiSelect: true,
    maxSelections: 2,
    defaultRules: ['Select exactly 2 teams. Locked before first match starts.'],
  },
  {
    title: 'Points Table Topper',
    description: 'Predict which team will top the points table (group stage).',
    eventType: 'points_table_topper',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultRules: ['Locked before first match starts.'],
  },
  
  // Group Level Predictions
  {
    title: 'Group Topper',
    description: 'Predict which team will top this group.',
    eventType: 'group_topper',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultRules: ['Locked before first match of the group.'],
  },
  {
    title: 'Group Second Place',
    description: 'Predict which team will finish second in this group.',
    eventType: 'group_second_place',
    defaultPoints: 35,
    difficultyLevel: 'medium',
    defaultRules: ['Locked before first match of the group.'],
  },
  {
    title: 'Group Qualifiers',
    description: 'Predict which teams will qualify from this group.',
    eventType: 'group_qualifiers',
    defaultPoints: 30,
    difficultyLevel: 'medium',
    multiSelect: true,
    maxSelections: 2,
    defaultRules: ['Select teams that will qualify. Locked before first match of the group.'],
  },
  {
    title: 'Group Team Points',
    description: 'Predict the total points a specific team will accumulate in the group stage.',
    eventType: 'group_team_points',
    defaultPoints: 50,
    difficultyLevel: 'hard',
    defaultOptions: ['0-2', '3-4', '5-6', '7-8', '9-10', '11+'],
    defaultRules: ['Locked before first match of the group.'],
  },
  
  // Player Level Predictions
  {
    title: 'Top Run Scorer',
    description: 'Predict which player will score the most runs in the tournament.',
    eventType: 'top_run_scorer',
    defaultPoints: 80,
    difficultyLevel: 'hard',
    defaultRules: ['Minimum matches played requirement applies.'],
  },
  {
    title: 'Top Wicket Taker',
    description: 'Predict which bowler will take the most wickets in the tournament.',
    eventType: 'top_wicket_taker',
    defaultPoints: 80,
    difficultyLevel: 'hard',
    defaultRules: ['Minimum matches played requirement applies.'],
  },
  {
    title: 'Tournament MVP',
    description: 'Predict which player will be the Most Valuable Player of the tournament.',
    eventType: 'tournament_mvp',
    defaultPoints: 100,
    difficultyLevel: 'hard',
    defaultRules: ['Based on overall performance across all matches.'],
  },
  {
    title: 'Most Sixes',
    description: 'Predict which player will hit the most sixes in the tournament.',
    eventType: 'most_sixes',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultRules: ['Minimum matches played requirement applies.'],
  },
  {
    title: 'Best Strike Rate',
    description: 'Predict which player will have the best strike rate (min 100 runs).',
    eventType: 'best_strike_rate',
    defaultPoints: 70,
    difficultyLevel: 'hard',
    defaultRules: ['Minimum 100 runs required.'],
  },
  {
    title: 'Most Centuries',
    description: 'Predict which player will score the most centuries in the tournament.',
    eventType: 'most_centuries',
    defaultPoints: 75,
    difficultyLevel: 'hard',
    defaultRules: ['Minimum matches played requirement applies.'],
  },
  {
    title: 'Most Fifties',
    description: 'Predict which player will score the most fifties (50+) in the tournament.',
    eventType: 'most_fifties',
    defaultPoints: 65,
    difficultyLevel: 'medium',
    defaultRules: ['Minimum matches played requirement applies.'],
  },
  {
    title: 'Best Bowling Average',
    description: 'Predict which bowler will have the best bowling average (min 5 wickets).',
    eventType: 'best_bowling_average',
    defaultPoints: 75,
    difficultyLevel: 'hard',
    defaultRules: ['Minimum 5 wickets required.'],
  },
  
  // Special Prediction Events
  {
    title: 'Most Toss Wins',
    description: 'Predict which team will win the most tosses in the tournament.',
    eventType: 'most_toss_wins',
    defaultPoints: 40,
    difficultyLevel: 'easy',
    defaultRules: ['Based on total toss wins across all matches.'],
  },
  {
    title: 'Highest Team Total',
    description: 'Predict which team will score the highest total in a single match.',
    eventType: 'highest_team_total',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultRules: ['Highest score in any single match of the tournament.'],
  },
  {
    title: 'Lowest Team Total',
    description: 'Predict which team will score the lowest total in a single match.',
    eventType: 'lowest_team_total',
    defaultPoints: 55,
    difficultyLevel: 'medium',
    defaultRules: ['Lowest score in any single match of the tournament.'],
  },
  {
    title: 'Super Over Count',
    description: 'Predict the total number of super overs in the tournament.',
    eventType: 'super_over_count',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['0', '1', '2', '3', '4+'],
    defaultRules: ['Total super overs across all matches.'],
  },
  {
    title: 'Highest Individual Score',
    description: 'Predict the range of the highest individual score in the tournament.',
    eventType: 'highest_individual_score',
    defaultPoints: 70,
    difficultyLevel: 'hard',
    defaultOptions: ['0-50', '51-75', '76-100', '101-125', '126-150', '151+'],
    defaultRules: ['Highest individual score in any match.'],
  },
  {
    title: 'Fastest Fifty (Tournament)',
    description: 'Predict the range of balls for the fastest fifty in the tournament.',
    eventType: 'fastest_fifty_tournament',
    defaultPoints: 80,
    difficultyLevel: 'hard',
    defaultOptions: ['1-20 balls', '21-30 balls', '31-40 balls', '41-50 balls', '51+ balls'],
    defaultRules: ['Fastest fifty across all matches.'],
  },
  {
    title: 'Fastest Hundred (Tournament)',
    description: 'Predict the range of balls for the fastest hundred in the tournament (if any).',
    eventType: 'fastest_hundred_tournament',
    defaultPoints: 100,
    difficultyLevel: 'hard',
    defaultOptions: ['1-40 balls', '41-50 balls', '51-60 balls', '61-70 balls', 'No 100'],
    defaultRules: ['Fastest hundred across all matches.'],
  },
  
  // Live Tournament Predictions (During Tournament)
  {
    title: 'Group Qualifier (Live)',
    description: 'Predict which team will qualify from this group (unlocks mid-tournament).',
    eventType: 'group_qualifier_live',
    defaultPoints: 45,
    difficultyLevel: 'medium',
    defaultRules: ['Unlocks after group stage begins.'],
  },
  {
    title: 'Top 2 After X Matches',
    description: 'Predict which teams will be in top 2 after a certain number of matches.',
    eventType: 'top_2_after_matches',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    multiSelect: true,
    maxSelections: 2,
    defaultRules: ['Unlocks mid-tournament.'],
  },
  {
    title: 'Playoff Qualifier',
    description: 'Predict if a specific team will reach the playoffs.',
    eventType: 'playoff_qualifier',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultOptions: ['Yes', 'No'],
    defaultRules: ['Unlocks mid-tournament.'],
  },
  {
    title: 'MVP As Of Today',
    description: 'Predict who will be the MVP based on current tournament performance.',
    eventType: 'mvp_as_of_today',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultRules: ['Unlocks mid-tournament. Updates as tournament progresses.'],
  },
];

