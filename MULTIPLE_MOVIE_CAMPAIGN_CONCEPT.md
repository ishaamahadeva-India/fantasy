# Multiple Movie Campaign Concept - Competitive/Fan War Scenarios

## Overview

Multiple movie campaigns are designed to create competitive scenarios where users predict which movie will perform better across various metrics. This creates "fan war" scenarios where fans of different movies compete.

---

## Core Concept

### Single Movie Campaign vs Multiple Movie Campaign

**Single Movie Campaign:**
- Focus: One movie's performance
- Events: Predict specific metrics for that movie
- Example: "Will Movie A collect 50 Cr on opening day?"

**Multiple Movie Campaign:**
- Focus: **Comparison** between movies
- Events: Predict which movie will win/rank higher
- Example: "Which movie will collect more on opening day - Movie A, B, C, or D?"

---

## Example Scenario: Jan 8-15 Release Window

**Movies Releasing:**
- **Bollywood**: Movie A (Action)
- **Hollywood**: Movie B (Superhero)
- **Tollywood**: Movie C (Mass Entertainer)
- **Kollywood**: Movie D (Thriller)

**Campaign Goal**: Create competitive events comparing these 4 movies across various metrics.

---

## Event Categories for Multiple Movie Campaigns

### 1. **Head-to-Head Comparison Events**

These events directly compare movies and ask "Which will win?"

#### Opening Day Collection Winner
- **Question**: Which movie will collect the highest opening day box office?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 200
- **Description**: Predict which movie will have the highest opening day collection among all competing movies.

#### First Weekend Winner
- **Question**: Which movie will have the highest first weekend collection?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 250
- **Description**: Compare 3-day weekend collections across all movies.

#### Trailer Views Winner (24h)
- **Question**: Which movie's trailer will get the most views in first 24 hours?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 150
- **Description**: Compare trailer view counts across all movies.

#### IMDb Rating Leader
- **Question**: Which movie will have the highest IMDb rating after 1000+ reviews?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 180
- **Description**: Compare IMDb ratings across competing movies.

---

### 2. **Ranking Events (Top 3/4)**

These events ask users to predict the ranking order.

#### Opening Day Collection Ranking
- **Question**: Rank the movies by opening day collection (1st, 2nd, 3rd, 4th)
- **Type**: Choice Selection (or Multi-select with ranking)
- **Options**: 
  - 1st Place: [Select Movie]
  - 2nd Place: [Select Movie]
  - 3rd Place: [Select Movie]
  - 4th Place: [Select Movie]
- **Points**: 300
- **Description**: Predict the complete ranking order of all movies.

#### First Weekend Ranking
- **Question**: Rank movies by first weekend collection
- **Type**: Ranking Selection
- **Points**: 350
- **Description**: Predict the complete weekend performance ranking.

---

### 3. **Category Leaders (Who Leads in Specific Metrics)**

These events identify leaders in specific categories.

#### Overseas Collection Leader
- **Question**: Which movie will lead in overseas collections?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 200
- **Description**: Compare overseas (international) box office performance.

#### Domestic Collection Leader
- **Question**: Which movie will lead in domestic (India) collections?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 200
- **Description**: Compare domestic box office performance.

#### Social Media Buzz Leader
- **Question**: Which movie will generate the most social media buzz (trending topics)?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 100
- **Description**: Compare social media engagement and trending performance.

#### Critics' Choice Leader
- **Question**: Which movie will get the best critics' ratings?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 150
- **Description**: Compare average critics' ratings across platforms.

---

### 4. **Industry Battle Events**

These events compare industries (Bollywood vs Hollywood vs Tollywood vs Kollywood).

#### Industry Winner - Opening Day
- **Question**: Which industry will have the highest opening day collection?
- **Type**: Choice Selection
- **Options**: Bollywood, Hollywood, Tollywood, Kollywood
- **Points**: 180
- **Description**: Compare industries based on their movie's opening day performance.

#### Industry Winner - First Weekend
- **Question**: Which industry will dominate the first weekend?
- **Type**: Choice Selection
- **Options**: Bollywood, Hollywood, Tollywood, Kollywood
- **Points**: 220
- **Description**: Compare industries based on weekend collections.

#### Industry Leader - IMDb Ratings
- **Question**: Which industry's movie will have the highest IMDb rating?
- **Type**: Choice Selection
- **Options**: Bollywood, Hollywood, Tollywood, Kollywood
- **Points**: 150
- **Description**: Compare industries based on IMDb ratings.

---

### 5. **Margin/Performance Gap Events**

These events predict the gap between movies.

#### Collection Gap Prediction
- **Question**: What will be the gap between highest and second-highest opening day collection?
- **Type**: Choice Selection
- **Options**: 
  - Less than 5 Cr
  - 5-10 Cr
  - 10-20 Cr
  - 20-30 Cr
  - More than 30 Cr
- **Points**: 100
- **Description**: Predict how close the competition will be.

#### Will Any Movie Cross 100 Cr in First Week?
- **Question**: Will any movie cross 100 Cr in first week?
- **Type**: Choice Selection
- **Options**: Yes (Movie A), Yes (Movie B), Yes (Movie C), Yes (Movie D), No
- **Points**: 200
- **Description**: Predict if any movie will achieve this milestone.

---

### 6. **Multi-Metric Champion Events**

These events combine multiple metrics to find the overall winner.

#### Overall Performance Champion
- **Question**: Which movie will be the overall champion (considering collections, ratings, and buzz)?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 400
- **Description**: Predict the overall winner considering multiple factors.

#### Fan War Winner
- **Question**: Which movie's fans will be most satisfied (based on collections + ratings + social buzz)?
- **Type**: Choice Selection
- **Options**: Movie A, Movie B, Movie C, Movie D
- **Points**: 300
- **Description**: Predict which movie will win the "fan war" based on overall performance.

---

## Event Structure for Multiple Movie Campaigns

### Current Structure:
```
Campaign: "Jan 8-15 Movie Battle"
├── Movies:
│   ├── Movie A (Bollywood)
│   ├── Movie B (Hollywood)
│   ├── Movie C (Tollywood)
│   └── Movie D (Kollywood)
└── Events:
    ├── Event 1: Opening Day Winner (campaign-wide)
    ├── Event 2: First Weekend Ranking (campaign-wide)
    ├── Event 3: IMDb Rating Leader (campaign-wide)
    └── Event 4: Overseas Collection Leader (campaign-wide)
```

### How Events Work:

1. **Campaign-Wide Events**: 
   - Apply to all movies in the campaign
   - Options are the movie names/titles
   - Users select which movie will win

2. **Movie-Specific Events**:
   - Can be assigned to specific movies
   - Example: "Movie A's opening day collection range" (only for Movie A)

3. **Comparison Events**:
   - Always campaign-wide
   - Options are the competing movies
   - Create competitive scenarios

---

## Recommended Event List for Multiple Movie Campaigns

### Phase 1: Pre-Release (Before Jan 8)

1. **Trailer Views Winner (24h)** - Which trailer gets most views?
2. **First Look Views Winner** - Which first look gets most views?
3. **Social Media Buzz Leader** - Which movie trends more before release?
4. **Pre-Release Event Location** - Where will each movie's event be? (movie-specific)

### Phase 2: Opening Day (Jan 8)

5. **Opening Day Collection Winner** - Which movie collects most?
6. **Opening Day Collection Ranking** - Complete ranking (1st, 2nd, 3rd, 4th)
7. **Opening Day Occupancy Leader** - Which movie has highest occupancy?
8. **Industry Winner - Opening Day** - Which industry wins?

### Phase 3: First Weekend (Jan 8-10)

9. **First Weekend Collection Winner** - Which movie wins the weekend?
10. **First Weekend Collection Ranking** - Complete weekend ranking
11. **Overseas Collection Leader** - Which movie leads overseas?
12. **Domestic Collection Leader** - Which movie leads domestically?
13. **Industry Winner - First Weekend** - Which industry dominates?

### Phase 4: First Week (Jan 8-15)

14. **First Week Collection Winner** - Which movie has best first week?
15. **IMDb Rating Leader** - Which movie gets highest rating?
16. **Critics' Choice Leader** - Which movie gets best reviews?
17. **Day-1 Talk Winner** - Which movie gets best word-of-mouth?
18. **Collection Gap Prediction** - How close is the competition?

### Phase 5: Post-Release (After Jan 15)

19. **Lifetime Gross Leader** - Which movie will collect most lifetime?
20. **OTT Debut Rank Winner** - Which movie ranks highest on OTT?
21. **Awards/Trending Rank Winner** - Which movie gets most awards/nominations?
22. **Overall Performance Champion** - Overall winner considering all metrics
23. **Fan War Winner** - Which movie's fans win the battle?

---

## How Users Participate

### Example User Flow:

1. **User joins campaign**: "Jan 8-15 Movie Battle"
2. **Sees all 4 movies**: Movie A, B, C, D
3. **Makes predictions**:
   - "Opening Day Winner: Movie B"
   - "First Weekend Ranking: 1st-Movie B, 2nd-Movie A, 3rd-Movie C, 4th-Movie D"
   - "IMDb Rating Leader: Movie A"
   - "Overseas Leader: Movie B"
4. **Points awarded** based on correct predictions
5. **Leaderboard** shows who predicted best

---

## Scoring System

### Single Correct Prediction:
- Opening Day Winner: 200 points
- First Weekend Ranking: 350 points (higher because harder)
- IMDb Rating Leader: 180 points

### Partial Credit (for rankings):
- Correct 1st place: 150 points
- Correct 2nd place: 100 points
- Correct 3rd place: 50 points
- All correct: 350 points (bonus)

---

## Key Differences from Single Movie Campaigns

| Aspect | Single Movie Campaign | Multiple Movie Campaign |
|--------|----------------------|------------------------|
| **Focus** | One movie's metrics | Comparison between movies |
| **Event Options** | Ranges/numbers | Movie names/titles |
| **Question Type** | "How much?" | "Which one?" |
| **Competition** | Individual performance | Head-to-head comparison |
| **Fan Engagement** | Moderate | High (fan wars) |
| **Complexity** | Simple | More complex (rankings) |

---

## Implementation Considerations

### 1. **Event Options**
- Options should be movie titles/names
- For rankings, need multi-select or ranking interface
- Can have "Tie" or "None" options

### 2. **Movie Assignment**
- Campaign-wide events: Leave movieId blank
- Movie-specific events: Assign to specific movie
- Comparison events: Always campaign-wide

### 3. **Result Verification**
- Need to compare actual performance data
- May need to fetch box office data from APIs
- IMDb ratings from IMDb API
- Social media metrics from platforms

### 4. **Leaderboard**
- Shows users who predicted best
- Can have separate leaderboards per event
- Overall campaign leaderboard

### 5. **Real-time Updates**
- Update rankings as data comes in
- Show live comparisons
- Update leaderboards dynamically

---

## Example: Complete Event Set for Jan 8-15 Campaign

### Pre-Release Events (Before Jan 8)
1. Trailer Views Winner (24h) - 150 pts
2. First Look Views Winner (24h) - 150 pts
3. Social Media Buzz Leader - 100 pts

### Opening Day Events (Jan 8)
4. Opening Day Collection Winner - 200 pts
5. Opening Day Collection Ranking - 350 pts
6. Opening Day Occupancy Leader - 100 pts
7. Industry Winner - Opening Day - 180 pts

### First Weekend Events (Jan 8-10)
8. First Weekend Collection Winner - 250 pts
9. First Weekend Collection Ranking - 400 pts
10. Overseas Collection Leader - 200 pts
11. Domestic Collection Leader - 200 pts
12. Industry Winner - First Weekend - 220 pts

### First Week Events (Jan 8-15)
13. First Week Collection Winner - 300 pts
14. IMDb Rating Leader - 180 pts
15. Critics' Choice Leader - 150 pts
16. Day-1 Talk Winner - 100 pts
17. Collection Gap Prediction - 100 pts

### Post-Release Events (After Jan 15)
18. Lifetime Gross Leader - 400 pts
19. OTT Debut Rank Winner - 150 pts
20. Overall Performance Champion - 500 pts
21. Fan War Winner - 400 pts

**Total Events: 21**
**Total Possible Points: 4,330**

---

## Benefits of Multiple Movie Campaigns

1. **Higher Engagement**: Fan wars create excitement
2. **Competitive Spirit**: Direct comparisons drive participation
3. **Broader Appeal**: Attracts fans of all competing movies
4. **Viral Potential**: Fans share and debate predictions
5. **Longer Duration**: Events span pre-release to post-release
6. **Data Rich**: More metrics to compare and analyze

---

## Next Steps for Implementation

1. **Add comparison event types** to EVENT_TEMPLATES
2. **Update event form** to support movie selection as options
3. **Create ranking interface** for ranking events
4. **Build comparison dashboard** showing all movies side-by-side
5. **Implement result verification** system to compare actual data
6. **Create comparison leaderboards** showing movie vs movie performance

---

## Questions to Consider

1. **How many movies** should be in a campaign? (2-6 recommended)
2. **Should events be mandatory** for all movies or optional?
3. **How to handle ties** in comparisons?
4. **Partial credit** for rankings (if user gets 2 out of 4 correct)?
5. **Real-time updates** vs final results only?
6. **Industry-based grouping** vs individual movie comparisons?

---

This concept creates a competitive, engaging experience where fans can support their favorite movies and compete against fans of other movies!

