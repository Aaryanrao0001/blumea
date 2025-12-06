import { IPost, IPostPerformance, IStrategyConfig } from '@/lib/types';

export interface RefreshReason {
  type: 'declining_traffic' | 'low_ctr' | 'outdated' | 'low_performance';
  details: string;
}

export function createRefreshPrompt(
  post: IPost,
  performance: IPostPerformance | null,
  reason: RefreshReason,
  config: IStrategyConfig
): string {
  const performanceInsight = performance
    ? `
Current Performance:
- Success Score: ${performance.successScore}/100
- Engagement Score: ${performance.engagementScore}/100
- SEO Score: ${performance.seoScore}/100
- Monetization Score: ${performance.monetizationScore}/100
`
    : 'Performance data not available.';

  const contentGuidelines = `
Content Guidelines (from current strategy):
- Introduction: Max ${config.contentRules.introMaxWords} words
- Include FAQ section with ${config.contentRules.faqCount} questions
- Comparison tables: ${Math.round(config.contentRules.includeComparisonTableProbability * 100)}% probability
- Routine sections: ${Math.round(config.contentRules.includeRoutineSectionProbability * 100)}% probability
`;

  const topPerformingTraits = `
Based on our top-performing content:
- Clear, actionable advice with specific product recommendations
- Science-backed claims with proper citations
- Comprehensive comparison tables when relevant
- Practical routines and step-by-step guides
- Engaging, conversational tone while maintaining expertise
`;

  return `You are an expert skincare writer refreshing content for Blumea, a premium skincare blog.

REFRESH REASON: ${reason.type}
${reason.details}

CURRENT POST:
Title: ${post.title}
Type: ${post.type}
Published: ${post.publishedAt}
Word Count: ${post.body.split(/\s+/).length}

${performanceInsight}

CURRENT CONTENT:
${post.body.substring(0, 2000)}${post.body.length > 2000 ? '...\n\n[Content truncated for brevity]' : ''}

${contentGuidelines}

${topPerformingTraits}

TASK:
Refresh and improve this article while:
1. Maintaining the core topic and primary keywords
2. Updating outdated information or statistics
3. Improving weak sections identified by performance data
4. Adding new insights or recent research
5. Enhancing SEO by better targeting search intent
6. Making CTAs more compelling if monetization is low
7. Following current content guidelines
8. Preserving the author's voice and brand style

Return the refreshed article in the same format as the original, maintaining markdown formatting.
Focus on improving ${reason.type === 'low_ctr' ? 'the title and introduction to increase click-through rate' : 
reason.type === 'declining_traffic' ? 'SEO optimization and search relevance' :
reason.type === 'low_performance' ? 'engagement and practical value' :
'accuracy and freshness of information'}.

DO NOT change the fundamental structure or voice drastically. This is an update, not a complete rewrite.`;
}

export function createRefreshWithStrategyInsightsPrompt(
  post: IPost,
  performance: IPostPerformance | null,
  reason: RefreshReason,
  config: IStrategyConfig,
  topPerformerInsights: string
): string {
  const basePrompt = createRefreshPrompt(post, performance, reason, config);
  
  return `${basePrompt}

INSIGHTS FROM TOP PERFORMERS:
${topPerformerInsights}

Use these insights to guide your refresh, incorporating successful patterns while maintaining originality.`;
}
