/**
 * Campaign Estimator
 * 
 * Calculation engine for estimating campaign results based on budget
 * or calculating required budget based on desired outcomes.
 * 
 * Uses industry benchmarks and proven formulas for accurate estimates.
 */

import { CampaignType, getBenchmark } from '@/constants/campaignBenchmarks';

/**
 * Results from budget estimation
 */
export interface BudgetEstimateResults {
  /** Estimated impressions */
  impressions: number;
  /** Estimated clicks */
  clicks: number;
  /** Estimated engaged users */
  engagedUsers: number;
  /** Estimated quiz/event completions */
  completions: number;
  /** Estimated coupon redemptions */
  redemptions: number;
  /** Cost per engaged user (₹) */
  costPerEngagedUser: number;
}

/**
 * Estimate campaign results from budget
 * 
 * Formula:
 * - impressions = (budget / cpm) * 1000
 * - clicks = impressions * ctr
 * - engagedUsers = clicks * engagementRate
 * - completions = engagedUsers * completionRate
 * - redemptions = clicks * redemptionRate
 * - costPerEngagedUser = budget / engagedUsers
 * 
 * @param budget - Campaign budget in ₹
 * @param campaignType - Type of campaign
 * @returns Estimated results
 */
export function estimateResultsFromBudget(
  budget: number,
  campaignType: CampaignType
): BudgetEstimateResults {
  // Validate inputs
  if (budget <= 0) {
    return {
      impressions: 0,
      clicks: 0,
      engagedUsers: 0,
      completions: 0,
      redemptions: 0,
      costPerEngagedUser: 0,
    };
  }

  const benchmark = getBenchmark(campaignType);

  // Calculate impressions: (budget / cpm) * 1000
  const impressions = (budget / benchmark.cpm) * 1000;

  // Calculate clicks: impressions * ctr
  const clicks = impressions * benchmark.ctr;

  // Calculate engaged users: clicks * engagementRate
  const engagedUsers = clicks * benchmark.engagementRate;

  // Calculate completions: engagedUsers * completionRate
  const completions = engagedUsers * benchmark.completionRate;

  // Calculate redemptions: clicks * redemptionRate
  const redemptions = clicks * benchmark.redemptionRate;

  // Calculate cost per engaged user: budget / engagedUsers
  // Prevent division by zero
  const costPerEngagedUser = engagedUsers > 0 ? budget / engagedUsers : 0;

  return {
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    engagedUsers: Math.round(engagedUsers),
    completions: Math.round(completions),
    redemptions: Math.round(redemptions),
    costPerEngagedUser: Math.round(costPerEngagedUser * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Estimate required budget from desired impressions
 * 
 * Formula:
 * - budget = (impressions / 1000) * cpm
 * 
 * @param impressions - Desired number of impressions
 * @param campaignType - Type of campaign
 * @returns Required budget in ₹
 */
export function estimateBudgetFromImpressions(
  impressions: number,
  campaignType: CampaignType
): number {
  // Validate inputs
  if (impressions <= 0) {
    return 0;
  }

  const benchmark = getBenchmark(campaignType);

  // Calculate budget: (impressions / 1000) * cpm
  const budget = (impressions / 1000) * benchmark.cpm;

  return Math.round(budget * 100) / 100; // Round to 2 decimals
}

/**
 * Estimate results from impressions (for Results → Budget mode)
 * 
 * First calculates budget, then estimates results
 * 
 * @param impressions - Desired number of impressions
 * @param campaignType - Type of campaign
 * @returns Estimated results
 */
export function estimateResultsFromImpressions(
  impressions: number,
  campaignType: CampaignType
): BudgetEstimateResults {
  // Calculate budget from impressions
  const budget = estimateBudgetFromImpressions(impressions, campaignType);

  // Use budget estimation to get results
  return estimateResultsFromBudget(budget, campaignType);
}

/**
 * Find the best value campaign type for a given budget
 * 
 * Best value = lowest cost per engaged user
 * 
 * @param budget - Campaign budget in ₹
 * @returns Campaign type with best value
 */
export function getBestValueCampaignType(budget: number): CampaignType {
  if (budget <= 0) {
    return 'image_ads'; // Default fallback
  }

  const campaignTypes: CampaignType[] = ['image_ads', 'branded_quiz', 'event_sponsorship'];
  
  let bestType: CampaignType = 'image_ads';
  let bestCostPerUser = Infinity;

  campaignTypes.forEach((type) => {
    const results = estimateResultsFromBudget(budget, type);
    if (results.costPerEngagedUser > 0 && results.costPerEngagedUser < bestCostPerUser) {
      bestCostPerUser = results.costPerEngagedUser;
      bestType = type;
    }
  });

  return bestType;
}

/**
 * Format number with Indian currency format
 * 
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "₹1,00,000")
 */
export function formatIndianCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * Format number with Indian number format
 * 
 * @param num - Number to format
 * @returns Formatted string (e.g., "1,00,000")
 */
export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

