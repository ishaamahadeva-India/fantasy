
export type FanRating = {
  userId: string;
  entityId: string;
  entityType: 'cricketer' | 'team' | 'movie' | 'star';
  ratings: Record<string, number>;
  review?: string;
  createdAt: Date;
};
