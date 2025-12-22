/**
 * Utility functions to generate CSV template files for bulk uploads
 */

export function downloadCSVTemplate(headers: string[], exampleRows: string[][], filename: string) {
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Template generators for each type

export function downloadArticlesTemplate() {
  const headers = ['title', 'slug', 'category', 'excerpt', 'content', 'imageUrl'];
  const examples = [
    [
      'Top 10 Movies of 2024',
      'top-10-movies-2024',
      'entertainment',
      'Discover the most popular movies of 2024...',
      'This article covers the top 10 movies that dominated the box office in 2024...',
      'https://example.com/image.jpg'
    ],
    [
      'Cricket World Cup Preview',
      'cricket-world-cup-preview',
      'sports',
      'Everything you need to know about the upcoming World Cup...',
      'The Cricket World Cup is set to begin next month...',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'articles-template.csv');
}

export function downloadGossipsTemplate() {
  const headers = ['title', 'source', 'imageUrl'];
  const examples = [
    [
      'New Movie Announcement Coming Soon',
      'Entertainment Weekly',
      'https://example.com/gossip1.jpg'
    ],
    [
      'Star Spotted at Film Location',
      'Bollywood Times',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'gossips-template.csv');
}

export function downloadCampaignsTemplate() {
  const headers = ['title', 'campaignType', 'description', 'startDate', 'endDate', 'status', 'visibility', 'movieId', 'movieTitle', 'movieLanguage', 'entryFeeType', 'entryFeeAmount', 'maxParticipants', 'prizePool', 'sponsorName', 'sponsorLogo'];
  const examples = [
    [
      'Summer Blockbusters 2024',
      'multiple_movies',
      'Predict the performance of summer blockbusters',
      '2024-06-01',
      '2024-08-31',
      'upcoming',
      'public',
      '',
      '',
      '',
      'free',
      '',
      '1000',
      '₹50,000',
      'Movie Studio',
      'https://example.com/logo.png'
    ],
    [
      'Single Movie Campaign',
      'single_movie',
      'Predict box office collection',
      '2024-07-01',
      '2024-07-15',
      'upcoming',
      'public',
      'movie123',
      'Action Hero',
      'Hindi',
      'paid',
      '49',
      '500',
      '₹25,000',
      '',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'campaigns-template.csv');
}

export function downloadMatchesTemplate() {
  const headers = ['matchName', 'format', 'team1', 'team2', 'teams', 'venue', 'startTime', 'status', 'description', 'entryFeeType', 'entryFeeAmount', 'maxParticipants'];
  const examples = [
    [
      'MI vs CSK',
      'IPL',
      'Mumbai Indians',
      'Chennai Super Kings',
      'Mumbai Indians,Chennai Super Kings',
      'Wankhede Stadium, Mumbai',
      '2024-05-15T19:30:00',
      'upcoming',
      'IPL Match between MI and CSK',
      'free',
      '',
      '10000'
    ],
    [
      'India vs Australia',
      'ODI',
      'India',
      'Australia',
      'India,Australia',
      'MCG, Melbourne',
      '2024-06-20T14:00:00',
      'upcoming',
      'ODI Series Match',
      'paid',
      '99',
      '5000'
    ]
  ];
  downloadCSVTemplate(headers, examples, 'matches-template.csv');
}

export function downloadTournamentsTemplate() {
  const headers = ['name', 'format', 'description', 'startDate', 'endDate', 'status', 'teams', 'venue', 'entryFeeType', 'entryFeeAmount', 'maxParticipants', 'prizePool', 'sponsorName', 'sponsorLogo', 'visibility'];
  const examples = [
    [
      'IPL 2024',
      'IPL',
      'Indian Premier League 2024',
      '2024-03-22',
      '2024-05-26',
      'upcoming',
      'Mumbai Indians,Chennai Super Kings,RCB,KKR,SRH,DC,RR,PBKS,LSG,GT',
      'Multiple Venues',
      'paid',
      '199',
      '50000',
      '₹10,00,000',
      'IPL Official',
      'https://example.com/ipl-logo.png',
      'public'
    ],
    [
      'World Cup 2024',
      'ODI',
      'Cricket World Cup 2024',
      '2024-10-01',
      '2024-11-15',
      'upcoming',
      'India,Australia,England,New Zealand,South Africa,Pakistan,West Indies,Sri Lanka',
      'Multiple Venues',
      'free',
      '',
      '100000',
      '₹50,00,000',
      '',
      '',
      'public'
    ]
  ];
  downloadCSVTemplate(headers, examples, 'tournaments-template.csv');
}

export function downloadCricketersTemplate() {
  const headers = ['name', 'country', 'roles', 'avatarUrl'];
  const examples = [
    [
      'Virat Kohli',
      'India',
      'Batsman,Captain',
      'https://example.com/virat.jpg'
    ],
    [
      'Jasprit Bumrah',
      'India',
      'Bowler',
      'https://example.com/bumrah.jpg'
    ],
    [
      'MS Dhoni',
      'India',
      'Wicketkeeper,Batsman,Captain',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'cricketers-template.csv');
}

export function downloadTeamsTemplate() {
  const headers = ['name', 'type', 'logoUrl'];
  const examples = [
    [
      'Mumbai Indians',
      'ip',
      'https://example.com/mi-logo.png'
    ],
    [
      'India',
      'national',
      'https://example.com/india-logo.png'
    ],
    [
      'Chennai Super Kings',
      'ip',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'teams-template.csv');
}

export function downloadMoviesTemplate() {
  const headers = ['title', 'releaseYear', 'genre', 'description', 'posterUrl'];
  const examples = [
    [
      'Action Hero 2',
      '2024',
      'Action',
      'The sequel to the blockbuster Action Hero...',
      'https://example.com/poster1.jpg'
    ],
    [
      'Romantic Drama',
      '2024',
      'Romance,Drama',
      'A heartwarming love story...',
      'https://example.com/poster2.jpg'
    ],
    [
      'Thriller Night',
      '2024',
      'Thriller',
      'A suspenseful thriller that keeps you on the edge...',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'movies-template.csv');
}

export function downloadStarsTemplate() {
  const headers = ['name', 'genre', 'avatar'];
  const examples = [
    [
      'NTR Jr.',
      'Action,Drama',
      'https://example.com/ntr.jpg'
    ],
    [
      'Ram Charan',
      'Action,Drama',
      'https://example.com/ramcharan.jpg'
    ],
    [
      'Allu Arjun',
      'Action,Dance',
      ''
    ]
  ];
  downloadCSVTemplate(headers, examples, 'stars-template.csv');
}

