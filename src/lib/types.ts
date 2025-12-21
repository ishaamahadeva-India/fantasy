

export type Movie = {
    id: string;
    title: string;
    releaseYear: number;
    genre: string;
    industry: 'Hollywood' | 'Bollywood' | 'Tollywood' | 'Tamil' | 'Kannada' | 'Malayalam' | 'Punjabi' | 'Bhojpuri' | 'Other';
    posterUrl: string;
    description: string;
    communityScore?: number;
    trendingRank?: number;
}

export type Star = {
    id: string;
    name: string;
    profession: string;
    avatar: string;
    specialization: string[];
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
  imageUrl?: string;
}

export type Gossip = {
    id: string;
    title: string;
    source: string;
    imageUrl?: string;
}

export type Advertisement = {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl: string;
    position: AdvertisementPosition;
    active: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type AdvertisementPosition = 
    | 'home-banner-top'           // Top banner on home page
    | 'home-sidebar-sponsored'    // Sidebar sponsored card on home
    | 'home-article-between'      // Between articles on home (AdBanner)
    | 'article-top'               // Top of article pages
    | 'article-sidebar'           // Sidebar in article pages
    | 'fantasy-banner'             // Banner in fantasy pages
    | 'profile-sidebar'           // Sidebar in profile page
    | 'quiz-banner';              // Banner in quiz pages

export type FantasyCampaign = {
    title: string;
    movieId: string;
    movieLanguage: string;
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
