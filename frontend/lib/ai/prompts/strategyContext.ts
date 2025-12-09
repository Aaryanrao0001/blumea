import { StrategyConfig } from '@/lib/types';
import { IPost } from '@/lib/types';

/**
 * Build strategy context for Claude prompts
 * 
 * This function creates a context string that includes:
 * - Content rules from strategy config
 * - Patterns from top-performing posts
 * - Tone preferences
 * - Word count targets
 */
export function buildStrategyContext(
  config: StrategyConfig,
  topPerformers: IPost[] = []
): string {
  const { contentRules, topicPreferencesByFormat } = config;
  
  let context = `## Content Strategy Guidelines\n\n`;
  
  // Word count targets
  if (contentRules.bodyTargetWordCount) {
    context += `### Word Count Targets:\n`;
    if (contentRules.bodyTargetWordCount.blog) {
      context += `- Blog posts: ${contentRules.bodyTargetWordCount.blog} words\n`;
    }
    if (contentRules.bodyTargetWordCount.review) {
      context += `- Reviews: ${contentRules.bodyTargetWordCount.review} words\n`;
    }
    if (contentRules.bodyTargetWordCount.comparison) {
      context += `- Comparisons: ${contentRules.bodyTargetWordCount.comparison} words\n`;
    }
    if (contentRules.bodyTargetWordCount.deepDive) {
      context += `- Deep dives: ${contentRules.bodyTargetWordCount.deepDive} words\n`;
    }
    context += `\n`;
  }
  
  // Introduction guidelines
  context += `### Introduction:\n`;
  context += `- Keep introduction under ${contentRules.introMaxWords} words\n`;
  context += `- Hook the reader immediately with a relatable scenario or question\n\n`;
  
  // Structural elements
  context += `### Structural Elements:\n`;
  context += `- Include ${contentRules.faqCount} FAQ items near the end\n`;
  
  if (contentRules.useComparisonTable && contentRules.comparisonTableProbability > 0.5) {
    context += `- Include comparison tables when relevant (recommended in ${Math.round(contentRules.comparisonTableProbability * 100)}% of cases)\n`;
  }
  
  if (contentRules.includeRoutineSectionProbability && contentRules.includeRoutineSectionProbability > 0.3) {
    context += `- Consider including a routine/step-by-step section (${Math.round(contentRules.includeRoutineSectionProbability * 100)}% probability)\n`;
  }
  
  context += `\n`;
  
  // Tone preferences
  if (contentRules.toneVariants) {
    context += `### Tone & Voice:\n`;
    const tones = [];
    
    if (contentRules.toneVariants.calm_explainer && contentRules.toneVariants.calm_explainer > 0.3) {
      tones.push(`calm, science-based explainer (${Math.round(contentRules.toneVariants.calm_explainer * 100)}%)`);
    }
    if (contentRules.toneVariants.slightly_playful && contentRules.toneVariants.slightly_playful > 0.2) {
      tones.push(`slightly playful and conversational (${Math.round(contentRules.toneVariants.slightly_playful * 100)}%)`);
    }
    if (contentRules.toneVariants.clinical && contentRules.toneVariants.clinical > 0.1) {
      tones.push(`clinical and authoritative (${Math.round(contentRules.toneVariants.clinical * 100)}%)`);
    }
    
    if (tones.length > 0) {
      context += `Preferred tone distribution:\n`;
      tones.forEach(tone => context += `- ${tone}\n`);
      context += `\n`;
    }
  }
  
  // Format preferences
  if (topicPreferencesByFormat) {
    context += `### Preferred Content Formats:\n`;
    const formats = Object.entries(topicPreferencesByFormat)
      .filter(([, weight]) => weight && weight > 0.5)
      .sort(([, a], [, b]) => (b || 0) - (a || 0));
    
    if (formats.length > 0) {
      formats.forEach(([format, weight]) => {
        context += `- ${format.replace(/([A-Z])/g, ' $1').trim()}: ${Math.round((weight || 0) * 100)}% preference\n`;
      });
      context += `\n`;
    }
  }
  
  // Patterns from top performers
  if (topPerformers.length > 0) {
    context += `### Patterns from Top-Performing Content:\n`;
    
    // Analyze common patterns
    const avgWordCount = topPerformers.reduce((sum, post) => {
      return sum + (post.wordCount || 0);
    }, 0) / topPerformers.length;
    
    if (avgWordCount > 0) {
      context += `- Top performers average ${Math.round(avgWordCount)} words\n`;
    }
    
    // Count posts with specific features (if available in post body)
    // This is a simplified analysis
    context += `- Top posts are well-structured with clear headings and subsections\n`;
    context += `- Include practical, actionable advice\n`;
    context += `\n`;
  }
  
  context += `### General Guidelines:\n`;
  context += `- Be inclusive of all skin types and concerns\n`;
  context += `- Back claims with scientific reasoning when possible\n`;
  context += `- Use engaging transitions between sections\n`;
  context += `- End with a clear takeaway or call-to-action\n`;
  context += `- Reference products authentically without overselling\n`;
  
  return context;
}

/**
 * Get tone instruction based on strategy config
 */
export function getToneInstruction(config: StrategyConfig): string {
  const { toneVariants } = config.contentRules;
  
  if (!toneVariants) {
    return "Use a calm, science-based, and friendly tone.";
  }
  
  // Determine primary tone
  const tones = [
    { name: 'calm_explainer', weight: toneVariants.calm_explainer || 0 },
    { name: 'slightly_playful', weight: toneVariants.slightly_playful || 0 },
    { name: 'clinical', weight: toneVariants.clinical || 0 },
  ];
  
  tones.sort((a, b) => b.weight - a.weight);
  const primary = tones[0];
  
  if (primary.name === 'calm_explainer') {
    return "Use a calm, science-based tone that's friendly and approachable. Explain concepts clearly without being preachy.";
  } else if (primary.name === 'slightly_playful') {
    return "Use a conversational, slightly playful tone while maintaining credibility. Be relatable and engaging.";
  } else if (primary.name === 'clinical') {
    return "Use a clinical, authoritative tone with emphasis on scientific evidence and professional language.";
  }
  
  return "Use a calm, science-based, and friendly tone.";
}
