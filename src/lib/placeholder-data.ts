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

export const fanWarData = [
  {
    id: 'movie-star-1',
    title: 'Tollywood King: Who Reigns Supreme?',
    category: 'Movies',
    entityOne: {
      name: 'Prabhas',
      avatar: `https://picsum.photos/seed/prabhas/200/200`,
      stats: [
        { label: 'Recent Hits', value: '3' },
        { label: 'Upcoming Projects', value: '5' },
        { label: 'Fan Following', value: '9.2/10' },
      ],
      votes: 1834,
    },
    entityTwo: {
      name: 'Allu Arjun',
      avatar: `https://picsum.photos/seed/alluarjun/200/200`,
      stats: [
        { label: 'Recent Hits', value: '4' },
        { label: 'Upcoming Projects', value: '3' },
        { label: 'Fan Following', value: '9.5/10' },
      ],
      votes: 2109,
    },
  },
  {
    id: 'cricket-captain-1',
    title: 'Best IPL Captain: Dhoni vs Rohit',
    category: 'Cricket',
    entityOne: {
      name: 'MS Dhoni',
      avatar: `https://picsum.photos/seed/dhoni/200/200`,
      stats: [
        { label: 'IPL Titles', value: '5' },
        { label: 'Win %', value: '58.9' },
        { label: 'Matches', value: '226' },
      ],
      votes: 3456,
    },
    entityTwo: {
      name: 'Rohit Sharma',
      avatar: `https://picsum.photos/seed/rohit/200/200`,
      stats: [
        { label: 'IPL Titles', value: '5' },
        { label: 'Win %', value: '56.6' },
        { label: 'Matches', value: '158' },
      ],
      votes: 2987,
    },
  },
];

export const popularEntities = [
    { id: 'p1', name: 'Prabhas', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/prabhas/200/200' },
    { id: 'p2', name: 'Allu Arjun', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/alluarjun/200/200' },
    { id: 'p3', name: 'Mahesh Babu', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/maheshbabu/200/200' },
    { id: 'p4', name: 'NTR Jr.', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/ntr/200/200' },
    { id: 'p5', name: 'Ram Charan', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/ramcharan/200/200' },
    { id: 'p6', name: 'Chiranjeevi', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/chiranjeevi/200/200' },
    { id: 'p7', name: 'Pawan Kalyan', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/pawankalyan/200/200' },
    { id: 'p8', name: 'Vijay Deverakonda', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/vijayd/200/200' },
    { id: 'p9', name: 'Nani', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/nani/200/200' },
    { id: 'p10', name: 'Suriya', category: 'Movie Stars', avatar: 'https://picsum.photos/seed/suriya/200/200' },
    { id: 'c1', name: 'Virat Kohli', category: 'Cricketers', avatar: 'https://picsum.photos/seed/kohli/200/200' },
    { id: 'c2', name: 'MS Dhoni', category: 'Cricketers', avatar: 'https://picsum.photos/seed/dhoni/200/200' },
    { id: 'c3', name: 'Rohit Sharma', category: 'Cricketers', avatar: 'https://picsum.photos/seed/rohit/200/200' },
    { id: 'c4', name: 'Hardik Pandya', category: 'Cricketers', avatar: 'https://picsum.photos/seed/hardik/200/200' },
    { id: 'c5', name: 'KL Rahul', category: 'Cricketers', avatar: 'https://picsum.photos/seed/rahul/200/200' },
    { id: 't1', name: 'Chennai Super Kings', category: 'IPL Teams', avatar: 'https://picsum.photos/seed/csk/200/200' },
    { id: 't2', name: 'Mumbai Indians', category: 'IPL Teams', avatar: 'https://picsum.photos/seed/mi/200/200' },
    { id: 't3', name: 'Royal Challengers', category: 'IPL Teams', avatar: 'https://picsum.photos/seed/rcb/200/200' },
    { id: 't4', name: 'Kolkata Knight Riders', category: 'IPL Teams', avatar: 'https://picsum.photos/seed/kkr/200/200' },
    { id: 't5', name: 'Sunrisers Hyderabad', category: 'IPL Teams', avatar: 'https://picsum.photos/seed/srh/200/200' },
    { id: 'po1', name: 'Narendra Modi', category: 'Politicians', avatar: 'https://picsum.photos/seed/modi/200/200' },
    { id: 'po2', name: 'Rahul Gandhi', category: 'Politicians', avatar: 'https://picsum.photos/seed/rahulgandhi/200/200' },
    { id: 'po3', name: 'Amit Shah', category: 'Politicians', avatar: 'https://picsum.photos/seed/amitshah/200/200' },
    { id: 'po4', name: 'Arvind Kejriwal', category: 'Politicians', avatar: 'https://picsum.photos/seed/kejriwal/200/200' },
    { id: 'po5', name: 'Yogi Adityanath', category: 'Politicians', avatar: 'https://picsum.photos/seed/yogi/200/200' },
];
