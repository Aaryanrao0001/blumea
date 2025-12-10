# Intelligence & Expansion System - Phase 4

## Overview

This system provides AI-powered content intelligence and opportunity tracking using ONLY free data sources. It scrapes Reddit, analyzes Google Trends, monitors SERP data, and automatically identifies content opportunities.

## Architecture

### Database Models

Located in `frontend/lib/db/models/`:

1. **RedditInsight** - Stores Reddit post data with AI-analyzed sentiment and keywords
2. **GoogleTrendsInsight** - Stores Google Trends data with growth projections
3. **SerpInsight** - Stores search engine data including PAA questions
4. **TopicOpportunity** - Stores calculated content opportunities with scores

### Services

Located in `frontend/lib/services/`:

1. **reddit-scraper.ts** - Scrapes Reddit using public JSON API
2. **google-trends.ts** - Analyzes search trends (mock implementation, can be replaced)
3. **serp-scraper.ts** - Scrapes SERP data (mock implementation, can be replaced)
4. **opportunity-calculator.ts** - Calculates opportunity scores using AI
5. **intelligence-cron.ts** - Manages scheduled intelligence gathering
6. **auto-content.ts** - Triggers automatic content generation
7. **strategy-report.ts** - Generates AI-powered strategy reports

### API Routes

Located in `frontend/app/api/intelligence/`:

1. **POST /api/intelligence/reddit** - Trigger Reddit scraping
   - Body: `{ subreddits?: string[], sort?: 'hot'|'top'|'new', limit?: number }`
   
2. **GET /api/intelligence/reddit** - Fetch Reddit insights
   - Query: `?subreddit=&intentType=&minSentiment=&limit=`

3. **POST /api/intelligence/trends** - Analyze keyword trends
   - Body: `{ keyword: string, timeRange?: '1-m'|'3-m'|'12-m' }`

4. **GET /api/intelligence/trends** - Fetch trends insights
   - Query: `?action=rising&limit=`

5. **POST /api/intelligence/serp** - Scrape SERP data
   - Body: `{ keyword: string }`

6. **GET /api/intelligence/serp** - Fetch SERP insights
   - Query: `?keyword=&limit=`

7. **POST /api/intelligence/opportunities** - Calculate opportunities
   - Body: `{ action: 'calculate', keywords?: string[] }`
   - Body: `{ action: 'mark_actioned', opportunityId: string }`
   - Body: `{ action: 'dismiss', opportunityId: string }`

8. **GET /api/intelligence/opportunities** - Fetch opportunities
   - Query: `?limit=&minScore=`

9. **POST /api/intelligence/auto-generate** - Auto-generate content
   - Body: `{ count?: number, minScore?: number }`

10. **GET /api/intelligence/report** - Generate strategy report

11. **POST /api/cron/intelligence** - Run full intelligence gathering
    - Auth: `x-cron-secret` or `authorization` header

### Growth Console Dashboard

Located at `/admin/growth`, provides:

1. **Opportunities Tab** - View and manage content opportunities
2. **Reddit Buzz Tab** - Monitor trending Reddit discussions
3. **Google Trends Tab** - View rising search trends
4. **SERP Intel Tab** - Analyze search results and PAA questions
5. **Strategy Tab** - AI-generated strategy recommendations

## Opportunity Scoring Algorithm

```
OpportunityScore = 
  (SearchIntentScore * 0.4) +
  (TrendGrowthScore * 0.3) +
  (RedditBuzzScore * 0.2) +
  (CompetitionWeaknessScore * 0.1)
```

### Components:

- **SearchIntentScore**: Based on search volume indicator and PAA questions
- **TrendGrowthScore**: Based on 30-day projected growth from trends
- **RedditBuzzScore**: Based on mentions and sentiment
- **CompetitionWeaknessScore**: Inverse of competitor strength (based on domain authority)

Scores range from 0-100, where:
- **70+**: Create new content immediately
- **50-69**: Update existing content
- **Below 50**: Ignore or monitor

## Usage

### Manual Intelligence Gathering

1. Navigate to `/admin/growth`
2. Click "Scrape Reddit" to gather Reddit data
3. Click "Calculate Opportunities" to analyze data
4. Review opportunities and take action

### Automatic Content Generation

1. Ensure opportunities are calculated
2. Click "Auto-Generate Content" 
3. System will create topics and content jobs for top opportunities
4. Review generated drafts in `/admin/drafts`

### Setting Up Cron Jobs

For Vercel deployment, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/intelligence",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Or use external cron services like cron-job.org:
- URL: `https://your-domain.com/api/cron/intelligence`
- Method: POST
- Header: `x-cron-secret: YOUR_CRON_SECRET`

## Rate Limiting

All scrapers implement rate limiting:
- **Reddit**: 2 seconds between requests
- **Trends**: 2 seconds between keyword analyses
- **SERP**: 3 seconds between searches
- **Claude API**: 1 second between sentiment analyses

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` - For Claude AI analysis
- `MONGODB_URI` - For database connection
- `ADMIN_PASSWORD` - For admin authentication

Optional:
- `CRON_SECRET` - For securing cron endpoints
- `CLAUDE_MODEL` - Override default Claude model

## Extending the System

### Adding Real Google Trends Data

Replace mock implementation in `google-trends.ts` with:

```bash
npm install google-trends-api
```

Then update the service to use actual API calls.

### Adding Real SERP Scraping

Options:
1. Use ScraperAPI: https://www.scraperapi.com/
2. Use ValueSERP: https://www.valueserp.com/
3. Use SerpApi: https://serpapi.com/

### Adding More Subreddits

Edit `reddit-scraper.ts`:

```typescript
const SKINCARE_SUBREDDITS = [
  'SkincareAddiction',
  'AsianBeauty',
  '30PlusSkinCare',
  'Acne',
  'SkincareAddictionIndia',
  // Add more here
  'SkincareAddictionUK',
  'tretinoin',
];
```

## Monitoring & Debugging

### Check Intelligence Data

```bash
# View recent Reddit insights
curl -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  https://your-domain.com/api/intelligence/reddit?limit=10

# View opportunities
curl -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" \
  https://your-domain.com/api/intelligence/opportunities?minScore=60
```

### Logs

All services log to console. In production, these will appear in Vercel logs.

### Common Issues

1. **No opportunities found**: Run "Calculate Opportunities" after scraping data
2. **Reddit scraping fails**: Check rate limiting, user agents, or Reddit API status
3. **Claude analysis fails**: Verify `ANTHROPIC_API_KEY` is set correctly
4. **Database errors**: Verify `MONGODB_URI` and database connection

## Security Considerations

✅ **Implemented**:
- Authentication required for all intelligence endpoints
- Rate limiting to avoid IP blocks
- User agent rotation
- No hardcoded secrets
- Input validation on all API routes

⚠️ **Note**: 
- Reddit's public API is free but should be used respectfully
- Google SERP scraping may violate ToS - consider paid APIs for production
- Always respect robots.txt and rate limits

## Performance

- Reddit scraping: ~2-3 minutes for 5 subreddits (25 posts each)
- Opportunity calculation: ~10-30 seconds depending on data volume
- Claude analysis: ~1-2 seconds per post
- Full intelligence gathering: ~10-15 minutes

## Future Enhancements

1. Add YouTube trend analysis
2. Add TikTok hashtag monitoring
3. Add competitor content analysis
4. Add seasonal trend predictions
5. Add A/B testing for generated content
6. Add email alerts for high-score opportunities
7. Add Slack/Discord notifications
8. Add historical trend visualization
9. Add keyword clustering
10. Add content gap analysis

## Support

For issues or questions, refer to the main repository documentation or create an issue on GitHub.
