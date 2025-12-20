

export type Movie = {
    id: string;
    title: string;
    releaseYear: number;
    genre: string;
    industry: 'Hollywood' | 'Bollywood' | 'Tollywood' | 'Other';
    posterUrl: string;
    description: string;
    communityScore?: number;
    trendingRank?: number;
}

export type Star = {
    id: string;
    name: string;
    avatar: string;
    genre: string[];
    popularityIndex: number;
    trendingRank?: number;
}

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

export type Gossip = {
    id: string;
    title: string;
    source: string;
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

export type CricketerProfile = {
    id: string;
    name: string;
    country: string;
    roles: string[];
    avatarUrl?: string;
}

export type FantasyRoleSelection = {
    userId: string;
    matchId: string;
    innings: number;
    selectedRoles: Record<string, string>; // e.g., { "powerplay-king": "player-id-1" }
    lockedAt: Date;
};

export type LivePrediction = {
    matchId: string;
    phase: string; // e.g., "Powerplay", "Middle Overs", "Death Overs"
    type: 'range' | 'yesno' | 'ranking' | 'conditional';
    question: string;
    options?: string[]; // For range or conditional
    startTime: Date;
    lockTime: Date;
};

export type UserLivePrediction = {
    userId: string;
    predictionId: string;
    selectedOption: string;
    confidenceLevel?: 'Low' | 'Medium' | 'High';
    answeredAt: Date;
};

export type FantasyLeaderboard = {
    rankings: {
        userId: string;
        score: number;
        rank: number;
    }[];
};

    