import { ITopic, ISkincareProduct, IProductScore } from '@/lib/types';

export function createDraftPrompt(
  topic: ITopic,
  outline: string[],
  products: ISkincareProduct[],
  scores: IProductScore[]
): string {
  const productDetails = products
    .map((p) => {
      const score = scores.find((s) => s.productId.toString() === p._id.toString());
      return `
Product: ${p.brand} ${p.name}
Category: ${p.category}
Score: ${score?.overallScore || 'N/A'}/100
Pros: ${score?.pros?.join(', ') || 'N/A'}
Cons: ${score?.cons?.join(', ') || 'N/A'}
Best For: ${score?.bestFor?.join(', ') || 'N/A'}
Key Ingredients: ${p.ingredientNames.slice(0, 5).join(', ')}
Price: ${p.price ? `${p.currency || '$'}${p.price}` : 'N/A'}`;
    })
    .join('\n---\n');

  return `You are an expert skincare writer for Blumea, a premium skincare blog. Write a comprehensive article following the provided outline.

TOPIC: ${topic.title}
PRIMARY KEYWORD: ${topic.primaryKeyword}
SECONDARY KEYWORDS: ${(topic.secondaryKeywords || []).join(', ')}

OUTLINE TO FOLLOW:
${outline.map((h, i) => `${i + 1}. ${h}`).join('\n')}

PRODUCT INFORMATION:
${productDetails}

WRITING GUIDELINES:
1. Write in a calm, science-based, friendly tone
2. Target 1500-2500 words total
3. Use proper HTML formatting (h2, h3, p, ul, li, strong, em)
4. Include the primary keyword naturally 3-5 times
5. Reference products authentically - don't oversell
6. Include practical tips and actionable advice
7. Be inclusive of all skin types and concerns
8. Back up claims with scientific reasoning when possible
9. Use engaging transitions between sections
10. End with a clear takeaway or call-to-action

OUTPUT FORMAT:
Return the full article body in HTML format. Do NOT include the title (h1) - start directly with the introduction paragraph.

Example structure:
<p>Introduction paragraph...</p>
<h2>First Section Heading</h2>
<p>Content...</p>
...`;
}
