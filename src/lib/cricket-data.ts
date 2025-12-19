
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
                keyPlayers: ["Sachin Tendulkar", "Sourav Ganguly", "Anil Kumble"]
            },
            "2010s": {
                winRate: 72,
                iccTrophies: 3,
                keyPlayers: ["MS Dhoni", "Virat Kohli", "Yuvraj Singh"]
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
                keyPlayers: ["Ricky Ponting", "Glenn McGrath", "Adam Gilchrist"]
            },
            "2010s": {
                winRate: 68,
                iccTrophies: 1,
                keyPlayers: ["Michael Clarke", "Steve Smith", "Mitchell Johnson"]
            }
        }
    }
]
