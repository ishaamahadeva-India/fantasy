


export type FanRating = {
  userId: string;
  entityId: string;
  entityType: 'cricketer' | 'team' | 'movie' | 'star';
  ratings: Record<string, number>;
  review?: string;
  createdAt: Date;
};

export type UserProfile = {
    id: string;
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

export type Article = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
}

export type FantasyCampaign = {
    title: string;
    movieId: string;
    startDate: Date;
    endDate?: Date;
    status: 'upcoming' | 'active' | 'completed';
}

export type FantasyMatch = {
    matchName: string;
    format: "T20" | "ODI" | "Test";
    teams: string[];
    startTime: Date;
    status: "upcoming" | "live" | "completed";
}
