
export type Cricketer = {
  id: string;
  name: string;
  roles: string[];
  country: string;
  avatar: string;
  consistencyIndex: number;
  impactScore: number;
  recentForm: number[]; // 5 numbers representing scores or an indicator
  careerPhase: 'Early' | 'Peak' | 'Late';
  trendingRank?: number;
};

export const placeholderCricketers: Cricketer[] = [
  {
    id: 'c1',
    name: 'Virat Kohli',
    roles: ['Batsman', 'Top Order'],
    country: 'IND',
    avatar: 'https://picsum.photos/seed/virat/400/400',
    consistencyIndex: 9.2,
    impactScore: 9.5,
    recentForm: [88, 92, 10, 75, 60],
    careerPhase: 'Peak',
    trendingRank: 2,
  },
  {
    id: 'c2',
    name: 'Jasprit Bumrah',
    roles: ['Bowler', 'Pacer'],
    country: 'IND',
    avatar: 'https://picsum.photos/seed/bumrah/400/400',
    consistencyIndex: 8.8,
    impactScore: 9.7,
    recentForm: [9, 10, 8, 9, 9], // Representing wickets or eco
    careerPhase: 'Peak',
    trendingRank: 1,
  },
  {
    id: 'c3',
    name: 'Rohit Sharma',
    roles: ['Batsman', 'Opener'],
    country: 'IND',
    avatar: 'https://picsum.photos/seed/rohit/400/400',
    consistencyIndex: 8.5,
    impactScore: 9.3,
    recentForm: [102, 15, 80, 55, 40],
    careerPhase: 'Late',
    trendingRank: 3,
  },
];

export type IpTeam = {
  id: string;
  name: string;
  league: string;
  logo: string;
  homeVenue: string;
  stabilityIndex: number;
  squadBalance: number;
  momentum: number[];
  fanConfidence: number;
};

export const placeholderIpTeams: IpTeam[] = [
    {
        id: 'ip1',
        name: 'Mumbai Indians',
        league: 'IPL',
        logo: 'https://picsum.photos/seed/mumbaiindians/400/400',
        homeVenue: 'Wankhede Stadium, Mumbai',
        stabilityIndex: 8.5,
        squadBalance: 7.8,
        momentum: [50, 55, 65, 60, 70],
        fanConfidence: 75,
    },
    {
        id: 'ip2',
        name: 'Chennai Super Kings',
        league: 'IPL',
        logo: 'https://picsum.photos/seed/csk/400/400',
        homeVenue: 'M.A. Chidambaram Stadium, Chennai',
        stabilityIndex: 9.2,
        squadBalance: 8.5,
        momentum: [60, 68, 72, 65, 78],
        fanConfidence: 88,
    }
];

export type NationalTeam = {
    id: string;
    name: string;
    crest: string;
    eras: Record<string, {
        winRate: number;
        iccTrophies: number;
        keyPlayers: string[];
        definingMoment: string;
    }>
};

export const placeholderNationalTeams: NationalTeam[] = [
    {
        id: 'nt1',
        name: 'India',
        crest: 'https://picsum.photos/seed/india/400/400',
        eras: {
            "2000s": {
                winRate: 65,
                iccTrophies: 2,
                keyPlayers: ["Sachin Tendulkar", "Sourav Ganguly", "Anil Kumble"],
                definingMoment: "The 2007 T20 World Cup victory under a young MS Dhoni, which heralded a new era in Indian cricket and sparked the IPL revolution."
            },
            "2010s": {
                winRate: 72,
                iccTrophies: 3,
                keyPlayers: ["MS Dhoni", "Virat Kohli", "Yuvraj Singh"],
                definingMoment: "Lifting the 2011 ODI World Cup on home soil after 28 years, a moment etched in the memory of a billion fans as Sachin Tendulkar's dream came true."
            }
        }
    },
    {
        id: 'nt2',
        name: 'Australia',
        crest: 'https://picsum.photos/seed/australia/400/400',
        eras: {
            "2000s": {
                winRate: 85,
                iccTrophies: 4,
                keyPlayers: ["Ricky Ponting", "Glenn McGrath", "Adam Gilchrist"],
                definingMoment: "The 'three-peat' of World Cups (1999, 2003, 2007) established this team as arguably the greatest ODI side in history, showcasing ruthless efficiency."
            },
            "2010s": {
                winRate: 68,
                iccTrophies: 1,
                keyPlayers: ["Michael Clarke", "Steve Smith", "Mitchell Johnson"],
                definingMoment: "The dominant 2015 World Cup win on home soil, which was a fitting farewell for captain Michael Clarke and a testament to their fast-bowling prowess."
            }
        }
    }
]
