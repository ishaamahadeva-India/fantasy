/**
 * Campaign Benchmarks
 * 
 * Default benchmark values for different campaign types in India market.
 * These values are based on industry averages and can be replaced with
 * real analytics averages from the platform later.
 * 
 * All rates are expressed as decimals (e.g., 0.015 = 1.5%)
 */

export type CampaignType = 'image_ads' | 'branded_quiz' | 'event_sponsorship';

export interface CampaignBenchmark {
  /** Cost per 1000 impressions (in ₹) */
  cpm: number;
  /** Click-through rate (as decimal, e.g., 0.015 = 1.5%) */
  ctr: number;
  /** Engagement rate - users who interact after clicking (as decimal) */
  engagementRate: number;
  /** Completion rate - users who complete quiz/event (as decimal) */
  completionRate: number;
  /** Redemption rate - users who redeem coupons (as decimal) */
  redemptionRate: number;
}

export const CAMPAIGN_BENCHMARKS: Record<CampaignType, CampaignBenchmark> = {
  image_ads: {
    cpm: 200, // ₹200 per 1000 impressions
    ctr: 0.015, // 1.5% click-through rate
    engagementRate: 0.15, // 15% engagement rate
    completionRate: 0.4, // 40% completion rate
    redemptionRate: 0.01, // 1% redemption rate
  },
  branded_quiz: {
    cpm: 400, // ₹400 per 1000 impressions
    ctr: 0.05, // 5% click-through rate
    engagementRate: 0.4, // 40% engagement rate
    completionRate: 0.65, // 65% completion rate
    redemptionRate: 0.04, // 4% redemption rate
  },
  event_sponsorship: {
    cpm: 800, // ₹800 per 1000 impressions
    ctr: 0.08, // 8% click-through rate
    engagementRate: 0.6, // 60% engagement rate
    completionRate: 0.75, // 75% completion rate
    redemptionRate: 0.06, // 6% redemption rate
  },
};

/**
 * Get benchmark for a campaign type
 */
export function getBenchmark(campaignType: CampaignType): CampaignBenchmark {
  return CAMPAIGN_BENCHMARKS[campaignType];
}

/**
 * Get campaign type display name
 */
export function getCampaignTypeName(campaignType: CampaignType): string {
  const names: Record<CampaignType, string> = {
    image_ads: 'Image Ads',
    branded_quiz: 'Branded Quiz',
    event_sponsorship: 'Event Sponsorship',
  };
  return names[campaignType];
}

/**
 * Get campaign type description
 */
export function getCampaignTypeDescription(campaignType: CampaignType): string {
  const descriptions: Record<CampaignType, string> = {
    image_ads: 'Display banner ads with brand messaging',
    branded_quiz: 'Interactive quiz campaigns with brand integration',
    event_sponsorship: 'Premium event sponsorship with high engagement',
  };
  return descriptions[campaignType];
}

