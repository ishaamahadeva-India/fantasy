import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder =>
  PlaceHolderImages.find((img) => img.id === id) || PlaceHolderImages[0];

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  length: 'Short' | 'Medium' | 'Deep';
  hasNarration: boolean;
  image: ImagePlaceholder;
  excerpt: string;
  content: string;
};

export const placeholderArticles: Article[] = [
  {
    id: '1',
    slug: 'the-ai-revolution',
    title: 'The AI Revolution: Beyond the Hype',
    category: 'Technology',
    length: 'Medium',
    hasNarration: true,
    image: getImage('article-1'),
    excerpt:
      'Exploring the real-world impact of artificial intelligence on industries and daily life.',
    content: `
      <p>The dawn of the 21st century has been marked by an explosion of technological advancements, but few are as transformative as the rise of Artificial Intelligence. Once the realm of science fiction, AI is now deeply embedded in our daily lives, from the algorithms that recommend our next movie to the complex systems that power autonomous vehicles.</p>
      <p>This article delves beyond the buzzwords and media hype to explore the real-world impact of AI. We will examine its applications across key sectors like healthcare, finance, and transportation, highlighting both the groundbreaking innovations and the ethical challenges that accompany them.</p>
      <h2>The Core Technologies</h2>
      <p>At the heart of the AI revolution are several key technologies. Machine Learning (ML) allows systems to learn from data and improve over time without being explicitly programmed. Natural Language Processing (NLP) enables computers to understand, interpret, and generate human language. And computer vision gives machines the ability to 'see' and interpret the visual world.</p>
      <p>Together, these technologies are creating systems that can perform tasks previously thought to require human intelligence. For instance, in medicine, AI algorithms are now capable of detecting diseases like cancer from medical images with a level of accuracy that rivals or even surpasses human experts.</p>
      <h2>Economic and Social Implications</h2>
      <p>The economic impact of AI is staggering. It promises to automate repetitive tasks, optimize supply chains, and create entirely new business models. However, this disruption also raises critical questions about the future of work. As routine jobs are automated, there is a growing need for a workforce skilled in creativity, critical thinking, and emotional intelligence—areas where humans still hold a significant edge.</p>
      <p>Socially, AI presents a double-edged sword. It has the potential to solve some of humanity's most pressing problems, from climate change to disease, but it also poses risks related to privacy, bias, and control. Ensuring that AI is developed and deployed responsibly is one of the most significant challenges of our time.</p>
    `,
  },
  {
    id: '2',
    slug: 'geopolitical-shifts',
    title: 'Geopolitical Shifts in the 21st Century',
    category: 'Geopolitics',
    length: 'Deep',
    hasNarration: true,
    image: getImage('article-2'),
    excerpt: 'An in-depth analysis of the changing world order and its key players.',
    content: `
      <p>The global landscape is in a constant state of flux. This article provides an in-depth analysis of the key geopolitical shifts shaping the 21st century, from the rise of new economic powers to the complexities of digital warfare and resource competition.</p>
    `,
  },
  {
    id: '3',
    slug: 'behavioral-economics',
    title: 'Behavioral Economics: The Hidden Forces',
    category: 'Business',
    length: 'Short',
    hasNarration: false,
    image: getImage('article-3'),
    excerpt:
      'How psychological biases influence our financial decisions and market trends.',
    content: `
      <p>Why do we make the financial decisions we do? This short read explores the fascinating field of behavioral economics, revealing the hidden psychological forces that guide our choices about spending, saving, and investing.</p>
    `,
  },
  {
    id: '4',
    slug: 'renaissance-of-classical-art',
    title: 'The Renaissance of Classical Art',
    category: 'Arts & Culture',
    length: 'Medium',
    hasNarration: true,
    image: getImage('article-4'),
    excerpt:
      'A look at how timeless techniques are finding new expression in the modern art world.',
    content: `
      <p>In an age of digital abstraction and fleeting trends, a surprising movement is taking hold: a modern renaissance of classical art. Discover how artists are breathing new life into age-old techniques and what this means for the future of art.</p>
    `,
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
