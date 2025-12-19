
export type FanRating = {
  userId: string;
  entityId: string;
  entityType: 'cricketer' | 'team' | 'movie' | 'star';
  ratings: Record<string, number>;
  review?: string;
  createdAt: Date;
};

export type UserProfile = {
    displayName: string;
    email: string;
    avatarUrl?: string;
    points: number;
    watchlist?: string[];
    ageVerified?: boolean;
    fantasyEnabled?: boolean;
    isAdmin?: boolean;
};

export type UserPrediction = {
    userId: string;
    eventId: string;
    campaignId: string;
    predictionData: Record<string, any>;
    score?: number;
    createdAt: Date;
};
