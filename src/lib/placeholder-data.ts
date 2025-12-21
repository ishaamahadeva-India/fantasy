// Placeholder data for development and testing
// This file contains mock data used in various parts of the application

export interface PlaceholderStar {
  id: string;
  name: string;
  avatar: string;
  popularityIndex: number;
  genre: string[];
}

// Popular stars for draft selection and other features
export const popularStars: PlaceholderStar[] = [
  {
    id: 's4',
    name: 'NTR Jr.',
    avatar: 'https://picsum.photos/seed/ntr/400/400',
    popularityIndex: 95,
    genre: ['Action', 'Drama']
  },
  {
    id: 's5',
    name: 'Ram Charan',
    avatar: 'https://picsum.photos/seed/ramcharan/400/400',
    popularityIndex: 94,
    genre: ['Action', 'Drama']
  },
  // Add more popular stars as needed
];

