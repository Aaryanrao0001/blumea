import { NextRequest, NextResponse } from 'next/server';
import { getTopTopicsForJob, markTopicUsed } from '@/lib/db/repositories/topics';
import { getSkincareProductsByIds } from '@/lib/db/repositories/skincareProducts';
import { getProductScoresByProductIds, updateProductScore } from '@/lib/db/repositories/productScores';
import { createGeneratedDraft } from '@/lib/db/repositories/generatedDrafts';
import { getCurrentConfig } from '@/lib/db/repositories/strategyConfig';
import { getPlannedItemsForDate } from '@/lib/db/repositories/contentPlan';
import { calculateProductScore } from '@/lib/scoring/calculateScore';
import {
  generateOutlineAndAngle,
  generateFullArticleDraft,
  generateSeoMetaAndSchema,
} from '@/lib/ai/claudeClient';
import { slugify } from '@/lib/utils';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 1;

    // Get strategy config
    const strategyConfig = await getCurrentConfig();

    // Check content plan for today
    const today = new Date();
    const plannedItems = await getPlannedItemsForDate(today);

    let topics;
    if (plannedItems.length > 0) {
      // Use planned topics
      const topicIds = plannedItems
        .filter(item => item.topicId && item.status === 'planned')
        .map(item => item.topicId!.toString())
        .slice(0, limit);
      
      // Get topics by IDs (simplified - in real implementation, add repository method)
      topics = await getTopTopicsForJob(limit);
      topics = topics.filter(t => topicIds.includes(t._id.toString()));
    } else {
      // Fallback to top topics
      topics = await getTopTopicsForJob(limit);
    }

    if (topics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No topics available',
        draftsCreated: 0,
      });
    }

    // Check safety limits
    const maxAutoPublish = strategyConfig.safety?.maxPostsPerDayAuto || strategyConfig.maxPostsPerDay;
    const actualLimit = Math.min(limit, maxAutoPublish);

    const results = [];

    for (let i = 0; i < actualLimit && i < topics.length; i++) {
      const topic = topics[i];
      
      try {
        // Step 2: Get related products and calculate scores
        const productIds = topic.relatedProductIds.map((id) => id.toString());
        const products = await getSkincareProductsByIds(productIds);

        // Calculate scores for products that don't have them
        for (const product of products) {
          const existingScore = await getProductScoresByProductIds([product._id.toString()]);
          if (existingScore.length === 0) {
            const calculatedScore = await calculateProductScore(product);
            await updateProductScore(product._id.toString(), {
              ...calculatedScore,
              lastCalculatedAt: new Date(),
            });
          }
        }

        const scores = await getProductScoresByProductIds(productIds);

        // Step 3: Generate outline via Claude with strategy context
        const outline = await generateOutlineAndAngle(topic, products, scores, strategyConfig);

        // Step 4: Generate full draft via Claude with strategy context
        const bodyRaw = await generateFullArticleDraft(topic, outline, products, scores, strategyConfig);

        // Step 5: Generate SEO meta via Claude
        const seoData = await generateSeoMetaAndSchema(bodyRaw, topic, products);

        // Step 6: Save to generatedDrafts collection
        const draft = await createGeneratedDraft({
          topicId: topic._id,
          productIds: products.map((p) => p._id),
          postType: 'blog',
          title: topic.title,
          slug: seoData.slug || slugify(topic.title),
          excerpt: seoData.excerpt,
          coverImageUrl: undefined,
          categorySlug: 'skincare',
          tagSlugs: topic.secondaryKeywords.slice(0, 3).map(slugify),
          seoTitle: seoData.seoTitle,
          seoDescription: seoData.seoDescription,
          schemaJson: seoData.schema,
          faq: seoData.faq,
          outline,
          bodyRaw,
          wordCount: bodyRaw.split(/\s+/).length,
          status: 'draft',
          createdBy: 'system',
        });

        // Mark topic as used
        await markTopicUsed(topic._id.toString());

        // Mark planned item as completed if it exists
        const plannedItem = plannedItems.find(item => 
          item.topicId?.toString() === topic._id.toString()
        );
        if (plannedItem && plannedItem._id) {
          // Note: We need the plan ID to mark as completed
          // This is a simplified version - in production, store plan ID with item
          // await markItemCompleted(planId, plannedItem._id, draft._id);
        }

        results.push({
          topicId: topic._id.toString(),
          topicTitle: topic.title,
          draftId: draft._id.toString(),
          status: 'success',
        });
      } catch (error) {
        console.error(`Error processing topic ${topic._id}:`, error);
        results.push({
          topicId: topic._id.toString(),
          topicTitle: topic.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} topics`,
      draftsCreated: results.filter((r) => r.status === 'success').length,
      results,
    });
  } catch (error) {
    console.error('Error running daily content job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
