import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder =>
  PlaceHolderImages.find((img) => img.id === id) || PlaceHolderImages[0];

export type Article = {
  id: string;
  title: string;
  category: string;
  length: 'Short' | 'Medium' | 'Deep';
  hasNarration: boolean;
  image: ImagePlaceholder;
  excerpt: string;
};

export const placeholderArticles: Article[] = [
  {
    id: '1',
    title: 'The AI Revolution: Beyond the Hype',
    category: 'Technology',
    length: 'Medium',
    hasNarration: true,
    image: getImage('article-1'),
    excerpt:
      'Exploring the real-world impact of artificial intelligence on industries and daily life.',
  },
  {
    id: '2',
    title: 'Geopolitical Shifts in the 21st Century',
    category: 'Geopolitics',
    length: 'Deep',
    hasNarration: true,
    image: getImage('article-2'),
    excerpt: 'An in-depth analysis of the changing world order and its key players.',
  },
  {
    id: '3',
    title: 'Behavioral Economics: The Hidden Forces',
    category: 'Business',
    length: 'Short',
    hasNarration: false,
    image: getImage('article-3'),
    excerpt:
      'How psychological biases influence our financial decisions and market trends.',
  },
  {
    id: '4',
    title: 'The Renaissance of Classical Art',
    category: 'Arts & Culture',
    length: 'Medium',
    hasNarration: true,
    image: getImage('article-4'),
    excerpt:
      'A look at how timeless techniques are finding new expression in the modern art world.',
  },
];

export type Collection = {
  id: string;
  title: string;
  description: string;
  image: ImagePlaceholder;
  itemCount: number;
};

export const placeholderCollections: Collection[] = [
  {
    id: 'geo-essentials',
    title: 'Geopolitics Essentials',
    description: 'Understand the forces shaping global politics and economies.',
    image: getImage('collection-1'),
    itemCount: 8,
  },
];

export const userInsightsData = {
  growthTrajectory: [
    { month: 'Jan', 'Knowledge Index': 65 },
    { month: 'Feb', 'Knowledge Index': 72 },
    { month: 'Mar', 'Knowledge Index': 75 },
    { month: 'Apr', 'Knowledge Index': 82 },
    { month: 'May', 'Knowledge Index': 85 },
    { month: 'Jun', 'Knowledge Index': 91 },
  ],
  categoryRadar: [
    { category: 'Technology', score: 90, fullMark: 100 },
    { category: 'Geopolitics', score: 75, fullMark: 100 },
    { category: 'Business', score: 82, fullMark: 100 },
    { category: 'Arts & Culture', score: 65, fullMark: 100 },
    { category: 'Science', score: 70, fullMark: 100 },
  ],
  timeInvested: 42, // hours
};

export const placeholderQuizzes = [
  {
    id: 'tech-innovators',
    title: 'Tech Innovators',
    description: 'Test your knowledge on the pioneers of technology.',
    category: 'Technology',
    questions: 5,
  },
  {
    id: 'world-capitals',
    title: 'World Capitals Challenge',
    description: 'How well do you know the capitals of the world?',
    category: 'Geography',
    questions: 10,
  },
];
