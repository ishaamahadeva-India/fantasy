/**
 * Points Engine for Fantasy Campaigns
 * Calculates points based on predictions and results
 */

import type { FantasyEvent, UserPrediction, PointsConfig, EventResult } from './types';

export interface PointsCalculationResult {
  points: number;
  isCorrect: boolean;
  accuracy?: number; // 0-100 percentage
  bonus?: number;
}

/**
 * Calculates points for a user prediction
 */
export function calculatePoints(
  event: FantasyEvent,
  prediction: UserPrediction,
  result?: EventResult
): PointsCalculationResult {
  if (!result || !result.verified) {
    return { points: 0, isCorrect: false };
  }

  const config = event.pointsConfig || { difficultyLevel: 'medium', basePoints: event.points };
  let points = 0;
  let isCorrect = false;
  let accuracy = 0;

  switch (event.eventType) {
    case 'choice_selection':
      isCorrect = String(prediction.predictionData.selectedChoice || '') === String(result.outcome);
      if (isCorrect) {
        points = config.basePoints;
        if (config.perfectBonus) {
          points += config.perfectBonus;
        }
        accuracy = 100;
      } else if (config.negativeMarking && config.negativeMarking > 0) {
        points = -config.negativeMarking;
      }
      break;

    case 'numeric_prediction':
      const predictedValue = Number(prediction.predictionData.predictedValue || 0);
      const actualValue = Number(result.outcome);
      
      if (predictedValue === actualValue) {
        isCorrect = true;
        points = config.basePoints;
        if (config.perfectBonus) {
          points += config.perfectBonus;
        }
        accuracy = 100;
      } else if (config.accuracyBased) {
        // Calculate accuracy based on how close the prediction is
        const difference = Math.abs(predictedValue - actualValue);
        const maxDifference = Math.max(predictedValue, actualValue) * 0.5; // 50% tolerance
        accuracy = Math.max(0, 100 - (difference / maxDifference) * 100);
        points = Math.round((config.basePoints * accuracy) / 100);
        
        if (accuracy >= 95) {
          isCorrect = true;
          if (config.perfectBonus) {
            points += config.perfectBonus;
          }
        }
      } else {
        // Range-based scoring for numeric predictions
        const tolerance = actualValue * 0.1; // 10% tolerance
        if (Math.abs(predictedValue - actualValue) <= tolerance) {
          isCorrect = true;
          points = config.basePoints * 0.5; // Half points for close prediction
          accuracy = 90;
        } else if (config.negativeMarking && config.negativeMarking > 0) {
          points = -config.negativeMarking;
        }
      }
      break;

    case 'draft_selection':
      // Draft selection scoring is more complex and would need specific logic
      // For now, return base points if result indicates success
      isCorrect = true; // Simplified - would need actual draft result comparison
      points = config.basePoints;
      accuracy = 100;
      break;
  }

  return {
    points: Math.max(0, points), // Ensure no negative points unless negative marking is enabled
    isCorrect,
    accuracy,
    bonus: isCorrect && config.perfectBonus ? config.perfectBonus : 0,
  };
}

/**
 * Calculates total points for a user across all events in a campaign
 */
export function calculateTotalCampaignPoints(
  events: FantasyEvent[],
  predictions: UserPrediction[],
  results: Map<string, EventResult> // eventId -> result
): number {
  let totalPoints = 0;

  for (const prediction of predictions) {
    const event = events.find((e) => e.id === prediction.eventId);
    if (!event) continue;

    const result = results.get(prediction.eventId);
    if (!result) continue;

    const calculation = calculatePoints(event, prediction, result);
    totalPoints += calculation.points;
  }

  return totalPoints;
}

/**
 * Calculates movie-wise points for multi-movie campaigns
 */
export function calculateMovieWisePoints(
  events: FantasyEvent[],
  predictions: UserPrediction[],
  results: Map<string, EventResult>
): Record<string, number> {
  const moviePoints: Record<string, number> = {};

  for (const prediction of predictions) {
    if (!prediction.movieId) continue;

    const event = events.find((e) => e.id === prediction.eventId);
    if (!event) continue;

    const result = results.get(prediction.eventId);
    if (!result) continue;

    const calculation = calculatePoints(event, prediction, result);
    
    if (!moviePoints[prediction.movieId]) {
      moviePoints[prediction.movieId] = 0;
    }
    moviePoints[prediction.movieId] += calculation.points;
  }

  return moviePoints;
}

