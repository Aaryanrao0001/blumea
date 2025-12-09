import Anthropic from '@anthropic-ai/sdk';
import { ITopic, ISkincareProduct, IProductScore } from '@/lib/types';
import { createOutlinePrompt } from './prompts/outlinePrompt';
import { createDraftPrompt } from './prompts/draftPrompt';
import { createSeoPrompt, SeoData } from './prompts/seoPrompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CLAUDE_MODEL = "claude-3-haiku-20240307";

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "Connection successful" in exactly those words.' }],
    });
    
    const content = response.content[0];
    if (content.type === 'text' && content.text.includes('Connection successful')) {
      return { success: true, message: 'Claude API connected successfully' };
    }
    return { success: true, message: 'Claude API connected (response received)' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function generateOutlineAndAngle(
  topic: ITopic,
  products: ISkincareProduct[],
  scores: IProductScore[]
): Promise<string[]> {
  const prompt = createOutlinePrompt(topic, products, scores);
  
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    // Try to parse as JSON array
    const text = content.text.trim();
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback: split by newlines if not valid JSON
    return content.text
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
  }
}

export async function generateFullArticleDraft(
  topic: ITopic,
  outline: string[],
  products: ISkincareProduct[],
  scores: IProductScore[]
): Promise<string> {
  const prompt = createDraftPrompt(topic, outline, products, scores);
  
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}

export async function generateSeoMetaAndSchema(
  draftBody: string,
  topic: ITopic,
  products: ISkincareProduct[]
): Promise<SeoData> {
  const prompt = createSeoPrompt(draftBody, topic, products);
  
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const text = content.text.trim();
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as SeoData;
  } catch (error) {
    console.error('Failed to parse SEO data:', error);
    throw new Error('Failed to parse SEO metadata from Claude response');
  }
}

export { CLAUDE_MODEL };
