import type { ImagePlaceholder } from './placeholder-images';
import { placeholderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder =>
  placeholderImages.find((img) => img.id === id) || placeholderImages[0];

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
    slug: 'ipl-franchise-dynasties',
    title: 'The Dynasties of IPL: A Decade of Dominance',
    category: 'Cricket',
    length: 'Medium',
    hasNarration: true,
    image: getImage('article-1'),
    excerpt:
      'Analyzing the strategies and key players behind the most successful franchises in the Indian Premier League.',
    content: `
      <p>The Indian Premier League (IPL) has become a global cricketing phenomenon, but beyond the annual spectacle lies a story of strategy, team-building, and dominance. Certain franchises have risen above the rest, creating dynasties that have defined eras of the tournament.</p>
      <p>This article delves into the core reasons behind the sustained success of teams like the Mumbai Indians and Chennai Super Kings. We explore their auction strategies, their knack for scouting and nurturing young talent, and the leadership philosophies that have turned them into perennial contenders.</p>
      <h2>The Blueprint of Success</h2>
      <p>A consistent core group of players, a strong and stable leadership, and a data-driven approach to auctions and match-ups are common threads. Franchises that master these elements are able to build a winning culture that persists season after season, even with player turnovers.</p>
    `,
  },
  {
    id: '2',
    slug: 'european-football-leagues',
    title: 'Clash of Titans: The Battle for European Football Supremacy',
    category: 'Football',
    length: 'Deep',
    hasNarration: true,
    image: getImage('article-2'),
    excerpt: 'An in-depth look at the top football leagues in Europe and what makes each one unique.',
    content: `
      <p>From the Premier League's intensity to La Liga's technical flair, European football is a diverse and captivating world. This analysis breaks down the tactical trends, financial power, and historical rivalries that define the continent's top leagues and the annual chase for the Champions League trophy.</p>
    `,
  },
  {
    id: '3',
    slug: 'bollywood-new-wave',
    title: 'Bollywood\'s New Wave: The Rise of Pan-Indian Cinema',
    category: 'Movies',
    length: 'Medium',
    hasNarration: false,
    image: getImage('article-3'),
    excerpt:
      'How regional cinema from Tollywood and Kollywood is challenging Bollywood\'s dominance and creating a new "Pan-Indian" identity.',
    content: `
      <p>For decades, Bollywood has been the face of Indian cinema. However, a new wave of high-concept, big-budget films from South India is breaking language barriers and achieving nationwide success. This piece explores the trend, its key drivers, and what it means for the future of entertainment in India.</p>
    `,
  },
  {
    id: '4',
    slug: 'national-politics-simplified',
    title: 'Indian Politics: The National Arena',
    category: 'Politics',
    length: 'Short',
    hasNarration: true,
    image: getImage('article-4'),
    excerpt:
      'A concise overview of the key players, parties, and political dynamics shaping India\'s national policy.',
    content: `
      <p>Understanding the complexities of Indian national politics can be daunting. This short-read simplifies the landscape, providing a clear overview of the major political parties, their core ideologies, and the current issues driving the national conversation ahead of the next election cycle.</p>
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
    id: 'sports-legends',
    title: 'Sports Legends',
    description: 'Explore the stories and stats of the greatest icons in sports history.',
    image: getImage('collection-1'),
    itemCount: 12,
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
    { category: 'Cricket', score: 92, fullMark: 100 },
    { category: 'Politics', score: 78, fullMark: 100 },
    { category: 'Movies', score: 85, fullMark: 100 },
    { category: 'Football', score: 72, fullMark: 100 },
    { category: 'Tennis', score: 65, fullMark: 100 },
  ],
  timeInvested: 42, // hours
};

export const placeholderQuizzes = [
  {
    id: 'cricket-world-cup',
    title: 'Cricket World Cup Trivia',
    description: 'Test your knowledge on the history of the Cricket World Cup.',
    category: 'Cricket',
    questions: 8,
  },
  {
    id: 'bollywood-blockbusters',
    title: 'Bollywood Blockbusters',
    description: 'How well do you know India\'s biggest blockbuster movies?',
    category: 'Movies',
    questions: 10,
  },
];

export const popularMovies = [
    { id: 'm1', title: 'Kalki 2898 AD', releaseYear: 2024, genre: 'Sci-Fi', posterUrl: 'https://picsum.photos/seed/kalki/400/600', description: "A modern-day avatar of the Hindu god Vishnu, who is believed to have descended to Earth to protect the world from evil forces." },
    { id: 'm2', title: 'Pushpa 2: The Rule', releaseYear: 2024, genre: 'Action', posterUrl: 'https://picsum.photos/seed/pushpa2/400/600', description: "The story of Pushpa Raj, a lorry driver who rises to become a smuggling syndicate kingpin." },
    { id: 'm3', title: 'Baahubali 2', releaseYear: 2017, genre: 'Action', posterUrl: 'https://picsum.photos/seed/baahubali2/400/600', description: "The conclusion to the epic saga of Shivudu, who learns about his royal heritage and the treacherous past of his family." },
    { id: 'm4', title: 'RRR', releaseYear: 2022, genre: 'Action', posterUrl: 'https://picsum.photos/seed/rrr/400/600', description: "A fictional story about two real-life Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, and their fight against the British Raj." },
    { id: 'm5', title: 'K.G.F: Chapter 2', releaseYear: 2022, genre: 'Action', posterUrl: 'https://picsum.photos/seed/kgf2/400/600', description: "The story of Rocky, who has become the kingpin of the Kolar Gold Fields, and his struggle to retain power." },
    { id: 'm6', title: 'Jawan', releaseYear: 2023, genre: 'Action', posterUrl: 'https://picsum.photos/seed/jawan/400/600', description: "A man is driven by a personal vendetta to rectify the wrongs in society, in a way that is parallel to his past." },
];

export const popularStars = [
    { id: 's1', name: 'Prabhas', avatar: 'https://picsum.photos/seed/prabhas/400/400', genre: ['Action', 'Drama'] },
    { id: 's2', name: 'Allu Arjun', avatar: 'https://picsum.photos/seed/alluarjun/400/400', genre: ['Action', 'Dance'] },
    { id: 's3', name: 'Mahesh Babu', avatar: 'https://picsum.photos/seed/maheshbabu/400/400', genre: ['Action', 'Family'] },
    { id: 's4', name: 'NTR Jr.', avatar: 'https://picsum.photos/seed/ntr/400/400', genre: ['Action', 'Historical'] },
    { id: 's5', name: 'Ram Charan', avatar: 'https://picsum.photos/seed/ramcharan/400/400', genre: ['Action', 'Drama'] },
    { id: 's6', name: 'Chiranjeevi', avatar: 'https://picsum.photos/seed/chiranjeevi/400/400', genre: ['Action', 'Legend'] },
    { id: 's7', name: 'Pawan Kalyan', avatar: 'https://picsum.photos/seed/pawankalyan/400/400', genre: ['Action', 'Politics'] },
    { id: 's8', name: 'Vijay Deverakonda', avatar: 'https://picsum.photos/seed/vijayd/400/400', genre: ['Romance', 'Drama'] },
    { id: 's9', name: 'Nani', avatar: 'https://picsum.photos/seed/nani/400/400', genre: ['Comedy', 'Family'] },
    { id: 's10', name: 'Suriya', avatar: 'https://picsum.photos/seed/suriya/400/400', genre: ['Action', 'Thriller'] },
    { id: 's11', name: 'Yash', avatar: 'https://picsum.photos/seed/yash/400/400', genre: ['Action', 'Period'] },
    { id: 's12', name: 'Shah Rukh Khan', avatar: 'https://picsum.photos/seed/srk/400/400', genre: ['Romance', 'King'] },
    { id: 's13', name: 'Vijay', avatar: 'https://picsum.photos/seed/vijay/400/400', genre: ['Action', 'Mass'] },
    { id: 's14', name: 'Ajith Kumar', avatar: 'https://picsum.photos/seed/ajith/400/400', genre: ['Action', 'Racing'] },
    { id: 's15', name: 'Kamal Haasan', avatar: 'https://picsum.photos/seed/kamal/400/400', genre: ['Versatile', 'Legend'] },
];

    