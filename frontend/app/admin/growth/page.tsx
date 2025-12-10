'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Search, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getAdminAuthHeader } from '@/lib/utils/adminAuth';

interface RedditInsight {
  _id: string;
  postId: string;
  subreddit: string;
  title: string;
  upvotes: number;
  comments: number;
  sentiment: number;
  keywords: string[];
  productsMentioned: string[];
  ingredientsMentioned: string[];
  intentType: string;
  permalink: string;
  timestamp: string;
}

interface TrendsInsight {
  _id: string;
  keyword: string;
  trendDirection: 'rising' | 'falling' | 'stable';
  projected30dGrowth: number;
  relatedQueries: { keyword: string; type: string; score: number }[];
  lastUpdated: string;
}

interface SerpInsight {
  _id: string;
  keyword: string;
  searchResults: { position: number; url: string; title: string; domain: string }[];
  peopleAlsoAsk: { question: string; snippet: string }[];
  relatedSearches: string[];
  lastScraped: string;
}

interface Opportunity {
  _id: string;
  keyword: string;
  title: string;
  score: number;
  redditMentions: number;
  redditSentiment: number;
  trendGrowth30d: number;
  recommendedAction: string;
  status: string;
  paaQuestions: string[];
  relatedKeywords: string[];
}

interface StrategyReport {
  weeklyTrends: string[];
  contentRecommendations: string[];
  emergingTopics: string[];
  competitorInsights: string[];
  fullReport: string;
}

export default function GrowthDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reddit' | 'trends' | 'serp' | 'opportunities' | 'strategy'>('opportunities');
  
  // Data states
  const [redditInsights, setRedditInsights] = useState<RedditInsight[]>([]);
  const [trendsInsights, setTrendsInsights] = useState<TrendsInsight[]>([]);
  const [serpInsights, setSerpInsights] = useState<SerpInsight[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [strategyReport, setStrategyReport] = useState<StrategyReport | null>(null);
  
  // Action states
  const [scraping, setScraping] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRedditInsights(),
      fetchTrendsInsights(),
      fetchSerpInsights(),
      fetchOpportunities(),
    ]);
    setLoading(false);
  };

  const fetchRedditInsights = async () => {
    try {
      const res = await fetch('/api/intelligence/reddit', {
        headers: {
          ...getAdminAuthHeader(),
        },
      });
      const data = await res.json();
      if (data.success) {
        setRedditInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching Reddit insights:', error);
    }
  };

  const fetchTrendsInsights = async () => {
    try {
      const res = await fetch('/api/intelligence/trends?action=rising&limit=20', {
        headers: {
          ...getAdminAuthHeader(),
        },
      });
      const data = await res.json();
      if (data.success) {
        setTrendsInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching trends insights:', error);
    }
  };

  const fetchSerpInsights = async () => {
    try {
      const res = await fetch('/api/intelligence/serp?limit=20', {
        headers: {
          ...getAdminAuthHeader(),
        },
      });
      const data = await res.json();
      if (data.success) {
        setSerpInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching SERP insights:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/intelligence/opportunities?limit=30&minScore=40', {
        headers: {
          ...getAdminAuthHeader(),
        },
      });
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const fetchStrategyReport = async () => {
    try {
      const res = await fetch('/api/intelligence/report', {
        headers: {
          ...getAdminAuthHeader(),
        },
      });
      const data = await res.json();
      if (data.success && data.report) {
        setStrategyReport(data.report);
      }
    } catch (error) {
      console.error('Error fetching strategy report:', error);
    }
  };

  const triggerRedditScraping = async () => {
    setScraping(true);
    try {
      const res = await fetch('/api/intelligence/reddit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminAuthHeader(),
        },
        body: JSON.stringify({ limit: 25 }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully scraped ${data.count} new posts!`);
        await fetchRedditInsights();
      } else {
        alert(`Scraping failed: ${data.error}`);
      }
    } catch (error) {
      alert('Error triggering scraping');
    } finally {
      setScraping(false);
    }
  };

  const calculateOpportunities = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/intelligence/opportunities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminAuthHeader(),
        },
        body: JSON.stringify({ action: 'calculate' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Calculated ${data.opportunities.length} opportunities!`);
        await fetchOpportunities();
      } else {
        alert(`Calculation failed: ${data.error}`);
      }
    } catch (error) {
      alert('Error calculating opportunities');
    } finally {
      setCalculating(false);
    }
  };

  const markOpportunityActioned = async (opportunityId: string) => {
    try {
      const res = await fetch('/api/intelligence/opportunities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminAuthHeader(),
        },
        body: JSON.stringify({ action: 'mark_actioned', opportunityId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOpportunities();
      }
    } catch (error) {
      alert('Error marking opportunity');
    }
  };

  const dismissOpportunity = async (opportunityId: string) => {
    try {
      const res = await fetch('/api/intelligence/opportunities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminAuthHeader(),
        },
        body: JSON.stringify({ action: 'dismiss', opportunityId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOpportunities();
      }
    } catch (error) {
      alert('Error dismissing opportunity');
    }
  };

  const triggerAutoGeneration = async () => {
    if (!confirm('Generate content for top 3 opportunities?')) return;
    
    try {
      const res = await fetch('/api/intelligence/auto-generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAdminAuthHeader(),
        },
        body: JSON.stringify({ count: 3, minScore: 70 }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.jobsCreated} content jobs!`);
      } else {
        alert(`Auto-generation failed: ${data.error}`);
      }
    } catch (error) {
      alert('Error triggering auto-generation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Growth Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth Console</h1>
          <p className="text-gray-600">AI-powered content intelligence and opportunity tracking</p>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={triggerRedditScraping}
              disabled={scraping}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {scraping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Scrape Reddit
            </button>
            
            <button
              onClick={calculateOpportunities}
              disabled={calculating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {calculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Calculate Opportunities
            </button>
            
            <button
              onClick={triggerAutoGeneration}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Play className="w-4 h-4" />
              Auto-Generate Content
            </button>
            
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh All
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { id: 'opportunities', label: 'Opportunities', icon: Sparkles },
              { id: 'reddit', label: 'Reddit Buzz', icon: MessageSquare },
              { id: 'trends', label: 'Google Trends', icon: TrendingUp },
              { id: 'serp', label: 'SERP Intel', icon: Search },
              { id: 'strategy', label: 'Strategy', icon: ChevronRight },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'strategy' && !strategyReport) {
                    fetchStrategyReport();
                  }
                }}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Content Opportunities</h2>
              <p className="text-gray-600 mb-6">Ranked by AI-calculated opportunity score</p>
              
              {opportunities.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No opportunities found. Click "Calculate Opportunities" to analyze your data.
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.filter(o => o.status === 'pending').map(opp => (
                    <div key={opp._id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-2xl font-bold ${
                              opp.score >= 80 ? 'text-green-600' :
                              opp.score >= 60 ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {opp.score}
                            </span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{opp.keyword}</h3>
                              <p className="text-sm text-gray-600">{opp.title}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 mt-3 mb-3">
                            <div className="text-sm">
                              <span className="text-gray-500">Reddit</span>
                              <p className="font-semibold">{opp.redditMentions} mentions</p>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Sentiment</span>
                              <p className="font-semibold">{(opp.redditSentiment * 100).toFixed(0)}%</p>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Trend</span>
                              <p className="font-semibold">{opp.trendGrowth30d > 0 ? '+' : ''}{opp.trendGrowth30d.toFixed(1)}%</p>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Action</span>
                              <p className="font-semibold capitalize">{opp.recommendedAction.replace('_', ' ')}</p>
                            </div>
                          </div>
                          
                          {opp.paaQuestions.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">PAA Questions:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {opp.paaQuestions.slice(0, 3).map((q, i) => (
                                  <li key={i}>• {q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => markOpportunityActioned(opp._id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Action
                          </button>
                          <button
                            onClick={() => dismissOpportunity(opp._id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            <XCircle className="w-4 h-4" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reddit Buzz Tab */}
          {activeTab === 'reddit' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Reddit Intelligence</h2>
              <p className="text-gray-600 mb-6">Recent skincare discussions from top subreddits</p>
              
              {redditInsights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No Reddit data yet. Click "Scrape Reddit" to gather insights.
                </div>
              ) : (
                <div className="space-y-4">
                  {redditInsights.slice(0, 20).map(insight => (
                    <div key={insight._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <a
                            href={`https://reddit.com${insight.permalink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:underline"
                          >
                            {insight.title}
                          </a>
                          <p className="text-sm text-gray-500 mt-1">
                            r/{insight.subreddit} • {insight.upvotes} upvotes • {insight.comments} comments
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                            insight.sentiment >= 0.7 ? 'bg-green-100 text-green-700' :
                            insight.sentiment >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {(insight.sentiment * 100).toFixed(0)}% sentiment
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {insight.intentType.replace('_', ' ')}
                        </span>
                        {insight.keywords.slice(0, 5).map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                      
                      {insight.productsMentioned.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">Products: </span>
                          <span className="text-gray-600">{insight.productsMentioned.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Google Trends Tab */}
          {activeTab === 'trends' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Google Trends Intelligence</h2>
              <p className="text-gray-600 mb-6">Rising search trends and projections</p>
              
              {trendsInsights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No trends data yet. Data is collected automatically or via API calls.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendsInsights.map(trend => (
                    <div key={trend._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{trend.keyword}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm px-2 py-1 rounded ${
                              trend.trendDirection === 'rising' ? 'bg-green-100 text-green-700' :
                              trend.trendDirection === 'falling' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {trend.trendDirection}
                            </span>
                            <span className="text-sm text-gray-600">
                              {trend.projected30dGrowth > 0 ? '+' : ''}{trend.projected30dGrowth.toFixed(1)}% projected
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {trend.relatedQueries.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Related Queries:</p>
                          <div className="space-y-1">
                            {trend.relatedQueries.slice(0, 4).map((query, i) => (
                              <div key={i} className="text-sm text-gray-600 flex items-center justify-between">
                                <span>• {query.keyword}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  query.type === 'rising' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {query.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SERP Intelligence Tab */}
          {activeTab === 'serp' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">SERP Intelligence</h2>
              <p className="text-gray-600 mb-6">Search engine insights and PAA questions</p>
              
              {serpInsights.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No SERP data yet. Data is collected via API or cron jobs.
                </div>
              ) : (
                <div className="space-y-6">
                  {serpInsights.slice(0, 10).map(serp => (
                    <div key={serp._id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{serp.keyword}</h3>
                      
                      {serp.peopleAlsoAsk.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">People Also Ask:</p>
                          <ul className="space-y-1">
                            {serp.peopleAlsoAsk.map((paa, i) => (
                              <li key={i} className="text-sm text-gray-600">• {paa.question}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {serp.relatedSearches.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Related Searches:</p>
                          <div className="flex flex-wrap gap-2">
                            {serp.relatedSearches.map((search, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                {search}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {serp.searchResults.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Top Results:</p>
                          <div className="space-y-1">
                            {serp.searchResults.slice(0, 5).map((result, i) => (
                              <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="font-mono text-gray-400">#{result.position}</span>
                                <span className="font-medium">{result.domain}</span>
                                <span className="truncate flex-1">{result.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Strategy Report Tab */}
          {activeTab === 'strategy' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">AI Strategy Recommendations</h2>
              <p className="text-gray-600 mb-6">Weekly intelligence summary and action items</p>
              
              {!strategyReport ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Generating strategy report...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {strategyReport.contentRecommendations.length > 0 && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Recommendations</h3>
                      <ul className="space-y-2">
                        {strategyReport.contentRecommendations.map((rec, i) => (
                          <li key={i} className="text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {strategyReport.emergingTopics.length > 0 && (
                    <div className="border rounded-lg p-4 bg-yellow-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Emerging Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {strategyReport.emergingTopics.map((topic, i) => (
                          <span key={i} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {strategyReport.weeklyTrends.length > 0 && (
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weekly Trends</h3>
                      <div className="flex flex-wrap gap-2">
                        {strategyReport.weeklyTrends.map((trend, i) => (
                          <span key={i} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                            {trend}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {strategyReport.competitorInsights.length > 0 && (
                    <div className="border rounded-lg p-4 bg-purple-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Competitor Insights</h3>
                      <ul className="space-y-2">
                        {strategyReport.competitorInsights.map((insight, i) => (
                          <li key={i} className="text-gray-700">• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
