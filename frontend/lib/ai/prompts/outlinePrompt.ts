import { ITopic, ISkincareProduct, IProductScore } from '@/lib/types';

export function createOutlinePrompt(
  topic: ITopic,
  products: ISkincareProduct[],
  scores: IProductScore[]
): string {
  const productList = products
    .map((p) => {
      const score = scores.find((s) => s.productId.toString() === p._id.toString());
      return `- ${p.brand} ${p.name} (Score: ${score?.overallScore || 'N/A'})`;
    })
    .join('\n');

  return `You are an expert skincare content strategist creating an outline for a blog article.

Topic: ${topic.title}
Primary Keyword: ${topic.primaryKeyword}
Secondary Keywords: ${topic.secondaryKeywords.join(', ')}

Related Products:
${productList}

Create a detailed article outline with 8-14 headings. The outline should:
1. Start with an engaging introduction hook
2. Include educational sections about the topic
3. Feature product recommendations where appropriate
4. Include a FAQ section near the end
5. End with a conclusion/takeaway

Return ONLY a JSON array of heading strings, like:
["Introduction: Why [Topic] Matters", "Understanding [Key Concept]", ...]

The tone should be:
- Calm and science-based
- Friendly and approachable
- Authoritative but not preachy
- Inclusive of all skin types`;
}
