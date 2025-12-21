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
import type { FantasyMatch, CricketEvent, CricketEventType } from '@/lib/types';

type NewFantasyMatch = {
  matchName: string;
  format: "T20" | "ODI" | "Test" | "IPL";
  teams: string[];
  team1: string;
  team2: string;
  venue?: string;
  startTime: Date;
  status: "upcoming" | "live" | "completed";
  description?: string;
  entryFee?: {
    type: 'free' | 'paid';
    amount?: number;
  };
  maxParticipants?: number;
};

type NewCricketEvent = {
  title: string;
  description: string;
  eventType: CricketEventType;
  innings?: number;
  status: 'upcoming' | 'live' | 'completed' | 'locked';
  startTime?: Date;
  endTime?: Date;
  lockTime?: Date;
  points: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  options?: string[];
  rules?: string[];
  applicableFormats?: ('T20' | 'ODI' | 'Test' | 'IPL')[];
};

/**
 * Adds a new cricket match to the 'fantasy_matches' collection.
 */
export function addCricketMatch(firestore: Firestore, matchData: NewFantasyMatch) {
  const matchesCollection = collection(firestore, 'fantasy_matches');
  const docToSave = {
    ...matchData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(matchesCollection, docToSave)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: matchesCollection.path,
        operation: 'create',
        requestResourceData: docToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Updates an existing cricket match.
 */
export function updateCricketMatch(
  firestore: Firestore,
  matchId: string,
  matchData: Partial<NewFantasyMatch>
) {
  const matchDocRef = doc(firestore, 'fantasy_matches', matchId);
  const docToUpdate = {
    ...matchData,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(matchDocRef, docToUpdate)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: matchDocRef.path,
        operation: 'update',
        requestResourceData: docToUpdate,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Deletes a cricket match.
 */
export function deleteCricketMatch(firestore: Firestore, matchId: string) {
  const matchDocRef = doc(firestore, 'fantasy_matches', matchId);
  return deleteDoc(matchDocRef)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: matchDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}

/**
 * Adds an event to a cricket match.
 */
export function addMatchEvent(
  firestore: Firestore,
  matchId: string,
  eventData: NewCricketEvent
) {
  const eventsCollection = collection(firestore, 'fantasy_matches', matchId, 'events');
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
 * Updates an event in a cricket match.
 */
export function updateMatchEvent(
  firestore: Firestore,
  matchId: string,
  eventId: string,
  eventData: Partial<NewCricketEvent>
) {
  const eventDocRef = doc(firestore, 'fantasy_matches', matchId, 'events', eventId);
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
 * Deletes an event from a cricket match.
 */
export function deleteMatchEvent(
  firestore: Firestore,
  matchId: string,
  eventId: string
) {
  const eventDocRef = doc(firestore, 'fantasy_matches', matchId, 'events', eventId);
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
 * Predefined cricket event templates (30+ events)
 */
export const CRICKET_EVENT_TEMPLATES: Array<{
  title: string;
  description: string;
  eventType: CricketEventType;
  defaultPoints: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  defaultOptions?: string[];
  defaultRules?: string[];
  applicableFormats?: ('T20' | 'ODI' | 'Test' | 'IPL')[];
}> = [
  // Powerplay Events (T20/ODI)
  {
    title: 'Powerplay Runs (First 6 Overs)',
    description: 'Predict the total runs scored in the powerplay (first 6 overs).',
    eventType: 'powerplay_runs',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['0-30', '31-40', '41-50', '51-60', '61+'],
    applicableFormats: ['T20', 'ODI'],
  },
  {
    title: 'Powerplay Wickets',
    description: 'Predict the number of wickets lost in the powerplay.',
    eventType: 'powerplay_wickets',
    defaultPoints: 40,
    difficultyLevel: 'easy',
    defaultOptions: ['0', '1', '2', '3', '4+'],
    applicableFormats: ['T20', 'ODI'],
  },
  {
    title: 'Powerplay Boundaries',
    description: 'Predict the total number of boundaries (4s) in powerplay.',
    eventType: 'powerplay_boundaries',
    defaultPoints: 35,
    difficultyLevel: 'easy',
    defaultOptions: ['0-2', '3-4', '5-6', '7-8', '9+'],
    applicableFormats: ['T20', 'ODI'],
  },
  {
    title: 'Powerplay Sixes',
    description: 'Predict the total number of sixes in powerplay.',
    eventType: 'powerplay_sixes',
    defaultPoints: 45,
    difficultyLevel: 'medium',
    defaultOptions: ['0', '1-2', '3-4', '5-6', '7+'],
    applicableFormats: ['T20', 'ODI'],
  },
  
  // Batting Events
  {
    title: 'First Ball Runs',
    description: 'Predict the runs scored off the first ball of the match.',
    eventType: 'first_ball_runs',
    defaultPoints: 25,
    difficultyLevel: 'easy',
    defaultOptions: ['0', '1', '2', '3', '4', '6', 'Wicket'],
  },
  {
    title: 'First Boundary',
    description: 'Predict which over will see the first boundary (4 or 6).',
    eventType: 'first_boundary',
    defaultPoints: 30,
    difficultyLevel: 'easy',
    defaultOptions: ['Over 1', 'Over 2', 'Over 3', 'Over 4', 'Over 5+'],
  },
  {
    title: 'First Six',
    description: 'Predict which over will see the first six.',
    eventType: 'first_six',
    defaultPoints: 35,
    difficultyLevel: 'medium',
    defaultOptions: ['Over 1-2', 'Over 3-4', 'Over 5-6', 'Over 7-10', 'Over 11+'],
  },
  {
    title: 'First Wicket',
    description: 'Predict which over will see the first wicket fall.',
    eventType: 'first_wicket',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultOptions: ['Over 1-3', 'Over 4-6', 'Over 7-10', 'Over 11-15', 'Over 16+'],
  },
  {
    title: 'First 50 Partnership',
    description: 'Predict which over will see the first 50-run partnership.',
    eventType: 'first_50_partnership',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['Over 1-5', 'Over 6-10', 'Over 11-15', 'Over 16-20', 'No 50 partnership'],
  },
  {
    title: 'First 100 Partnership',
    description: 'Predict if there will be a 100-run partnership and in which over.',
    eventType: 'first_100_partnership',
    defaultPoints: 75,
    difficultyLevel: 'hard',
    defaultOptions: ['Over 1-10', 'Over 11-20', 'Over 21-30', 'Over 31+', 'No 100 partnership'],
  },
  {
    title: 'Highest Individual Score',
    description: 'Predict the range of the highest individual score in the match.',
    eventType: 'highest_individual_score',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultOptions: ['0-30', '31-50', '51-70', '71-100', '101+'],
  },
  {
    title: 'Most Boundaries',
    description: 'Predict which team will hit more boundaries (4s).',
    eventType: 'most_boundaries',
    defaultPoints: 30,
    difficultyLevel: 'easy',
    defaultOptions: ['Team 1', 'Team 2', 'Tie'],
  },
  {
    title: 'Most Sixes',
    description: 'Predict which team will hit more sixes.',
    eventType: 'most_sixes',
    defaultPoints: 35,
    difficultyLevel: 'easy',
    defaultOptions: ['Team 1', 'Team 2', 'Tie'],
  },
  {
    title: 'Strike Rate Range',
    description: 'Predict the strike rate range of the top scorer.',
    eventType: 'strike_rate_range',
    defaultPoints: 45,
    difficultyLevel: 'medium',
    defaultOptions: ['Below 100', '100-120', '121-150', '151-180', '181+'],
  },
  
  // Bowling Events
  {
    title: 'First Wicket Bowler',
    description: 'Predict which bowler will take the first wicket.',
    eventType: 'first_wicket_bowler',
    defaultPoints: 50,
    difficultyLevel: 'hard',
    defaultOptions: ['Bowler 1', 'Bowler 2', 'Bowler 3', 'Bowler 4', 'Other'],
  },
  {
    title: 'Most Wickets',
    description: 'Predict which bowler will take the most wickets.',
    eventType: 'most_wickets',
    defaultPoints: 60,
    difficultyLevel: 'hard',
    defaultOptions: ['Bowler 1', 'Bowler 2', 'Bowler 3', 'Bowler 4', 'Tie'],
  },
  {
    title: 'Best Economy Rate',
    description: 'Predict the economy rate range of the best bowler (min 2 overs).',
    eventType: 'best_economy',
    defaultPoints: 55,
    difficultyLevel: 'hard',
    defaultOptions: ['Below 4', '4-5', '5-6', '6-7', '7+'],
  },
  {
    title: 'Maiden Overs',
    description: 'Predict the total number of maiden overs in the match.',
    eventType: 'maiden_overs',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultOptions: ['0', '1-2', '3-4', '5-6', '7+'],
  },
  {
    title: 'Hat-trick',
    description: 'Predict if there will be a hat-trick in the match.',
    eventType: 'hat_trick',
    defaultPoints: 100,
    difficultyLevel: 'hard',
    defaultOptions: ['Yes', 'No'],
  },
  {
    title: 'First 5-Wicket Haul',
    description: 'Predict if any bowler will take 5 wickets in an innings.',
    eventType: 'first_5_wicket_haul',
    defaultPoints: 80,
    difficultyLevel: 'hard',
    defaultOptions: ['Yes', 'No'],
  },
  
  // Match Outcome Events
  {
    title: 'Toss Winner',
    description: 'Predict which team will win the toss.',
    eventType: 'toss_winner',
    defaultPoints: 20,
    difficultyLevel: 'easy',
    defaultOptions: ['Team 1', 'Team 2'],
  },
  {
    title: 'Toss Decision',
    description: 'Predict what the toss winner will choose.',
    eventType: 'toss_decision',
    defaultPoints: 25,
    difficultyLevel: 'easy',
    defaultOptions: ['Bat', 'Bowl', 'Field'],
  },
  {
    title: 'Match Winner',
    description: 'Predict which team will win the match.',
    eventType: 'match_winner',
    defaultPoints: 100,
    difficultyLevel: 'medium',
    defaultOptions: ['Team 1', 'Team 2', 'Tie', 'No Result'],
  },
  {
    title: 'Win Margin',
    description: 'Predict the margin of victory (if applicable).',
    eventType: 'win_margin',
    defaultPoints: 70,
    difficultyLevel: 'hard',
    defaultOptions: ['1-20 runs', '21-40 runs', '41-60 runs', '61+ runs', '1-3 wickets', '4-6 wickets', '7+ wickets'],
  },
  {
    title: 'Win By Wickets or Runs',
    description: 'Predict if the match will be won by wickets or runs.',
    eventType: 'win_by_wickets_or_runs',
    defaultPoints: 30,
    difficultyLevel: 'easy',
    defaultOptions: ['By Runs', 'By Wickets', 'Tie/No Result'],
  },
  {
    title: 'Total Runs',
    description: 'Predict the total runs scored in the match.',
    eventType: 'total_runs',
    defaultPoints: 80,
    difficultyLevel: 'hard',
    defaultOptions: ['0-200', '201-300', '301-400', '401-500', '501+'],
  },
  {
    title: 'Total Wickets',
    description: 'Predict the total wickets fallen in the match.',
    eventType: 'total_wickets',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['0-5', '6-10', '11-15', '16-20', '21+'],
  },
  {
    title: 'Total Fours',
    description: 'Predict the total number of fours in the match.',
    eventType: 'total_fours',
    defaultPoints: 45,
    difficultyLevel: 'medium',
    defaultOptions: ['0-10', '11-20', '21-30', '31-40', '41+'],
  },
  {
    title: 'Total Sixes',
    description: 'Predict the total number of sixes in the match.',
    eventType: 'total_sixes',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['0-5', '6-10', '11-15', '16-20', '21+'],
  },
  {
    title: 'Total Extras',
    description: 'Predict the total extras (wides, no-balls, byes, leg-byes) in the match.',
    eventType: 'total_extras',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultOptions: ['0-10', '11-20', '21-30', '31-40', '41+'],
  },
  
  // Innings Events
  {
    title: 'First Innings Score',
    description: 'Predict the total score in the first innings.',
    eventType: 'first_innings_score',
    defaultPoints: 70,
    difficultyLevel: 'hard',
    defaultOptions: ['0-100', '101-150', '151-200', '201-250', '251+'],
  },
  {
    title: 'Second Innings Score',
    description: 'Predict the total score in the second innings.',
    eventType: 'second_innings_score',
    defaultPoints: 70,
    difficultyLevel: 'hard',
    defaultOptions: ['0-100', '101-150', '151-200', '201-250', '251+'],
  },
  {
    title: 'First Innings Wickets',
    description: 'Predict the wickets lost in first innings.',
    eventType: 'first_innings_wickets',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['0-3', '4-6', '7-9', '10 (All Out)'],
  },
  {
    title: 'Second Innings Wickets',
    description: 'Predict the wickets lost in second innings.',
    eventType: 'second_innings_wickets',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['0-3', '4-6', '7-9', '10 (All Out)'],
  },
  
  // Test Match Specific
  {
    title: 'First Innings Lead',
    description: 'Predict which team will have the first innings lead (Test matches).',
    eventType: 'first_innings_lead',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultOptions: ['Team 1', 'Team 2', 'No Lead'],
    applicableFormats: ['Test'],
  },
  {
    title: 'Follow On',
    description: 'Predict if there will be a follow-on enforced (Test matches).',
    eventType: 'follow_on',
    defaultPoints: 70,
    difficultyLevel: 'hard',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['Test'],
  },
  {
    title: 'Declaration',
    description: 'Predict if any team will declare their innings (Test matches).',
    eventType: 'declaration',
    defaultPoints: 65,
    difficultyLevel: 'medium',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['Test'],
  },
  {
    title: 'Century Count',
    description: 'Predict the total number of centuries in the match.',
    eventType: 'century_count',
    defaultPoints: 75,
    difficultyLevel: 'hard',
    defaultOptions: ['0', '1', '2', '3', '4+'],
  },
  {
    title: 'Fifty Count',
    description: 'Predict the total number of fifties (50+) in the match.',
    eventType: 'fifty_count',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultOptions: ['0-2', '3-4', '5-6', '7-8', '9+'],
  },
  
  // ODI Specific
  {
    title: '300+ Score',
    description: 'Predict if any team will score 300+ runs (ODI).',
    eventType: '300_plus_score',
    defaultPoints: 60,
    difficultyLevel: 'medium',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['ODI'],
  },
  {
    title: '400+ Score',
    description: 'Predict if any team will score 400+ runs (ODI).',
    eventType: '400_plus_score',
    defaultPoints: 100,
    difficultyLevel: 'hard',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['ODI'],
  },
  {
    title: 'Chase Successful',
    description: 'Predict if the chasing team will successfully chase the target.',
    eventType: 'chase_successful',
    defaultPoints: 50,
    difficultyLevel: 'medium',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['ODI', 'T20'],
  },
  
  // T20/IPL Specific
  {
    title: '200+ Score',
    description: 'Predict if any team will score 200+ runs (T20/IPL).',
    eventType: '200_plus_score',
    defaultPoints: 70,
    difficultyLevel: 'medium',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['T20', 'IPL'],
  },
  {
    title: 'Fastest 50',
    description: 'Predict the range of balls for the fastest 50 in the match.',
    eventType: 'fastest_50',
    defaultPoints: 80,
    difficultyLevel: 'hard',
    defaultOptions: ['1-20 balls', '21-30 balls', '31-40 balls', '41-50 balls', '51+ balls'],
    applicableFormats: ['T20', 'IPL'],
  },
  {
    title: 'Fastest 100',
    description: 'Predict the range of balls for the fastest 100 in the match (if any).',
    eventType: 'fastest_100',
    defaultPoints: 100,
    difficultyLevel: 'hard',
    defaultOptions: ['1-40 balls', '41-50 balls', '51-60 balls', '61-70 balls', 'No 100'],
    applicableFormats: ['T20', 'IPL'],
  },
  {
    title: 'Super Over',
    description: 'Predict if the match will go to a super over (T20/IPL).',
    eventType: 'super_over',
    defaultPoints: 90,
    difficultyLevel: 'hard',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['T20', 'IPL'],
  },
  {
    title: 'DRS Reviews',
    description: 'Predict the total number of DRS reviews taken in the match.',
    eventType: 'drs_reviews',
    defaultPoints: 40,
    difficultyLevel: 'medium',
    defaultOptions: ['0-2', '3-4', '5-6', '7-8', '9+'],
  },
  {
    title: 'Timeout Taken',
    description: 'Predict if any team will take a strategic timeout (IPL).',
    eventType: 'timeout_taken',
    defaultPoints: 30,
    difficultyLevel: 'easy',
    defaultOptions: ['Yes', 'No'],
    applicableFormats: ['IPL'],
  },
];

