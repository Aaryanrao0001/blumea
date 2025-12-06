import { NextRequest, NextResponse } from 'next/server';
import * as productRepo from '@/lib/db/repositories/skincareProducts';
import * as productScoreRepo from '@/lib/db/repositories/productScores';
import * as draftRepo from '@/lib/db/repositories/generatedDrafts';
import * as topicRepo from '@/lib/db/repositories/topics';
import {
  generateOutlineAndAngle,
  generateFullArticleDraft,
  generateSeoMetaAndSchema,
} from '@/lib/ai/claudeClient';

const ADMIN_HEADER = 'authorization';
const ALT_HEADER = 'x-admin-secret';
const EXPECTED = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    // Auth (accept Authorization: Bearer <secret> or x-admin-secret)
    const rawAuth =
      (req.headers.get(ADMIN_HEADER) || req.headers.get(ALT_HEADER) || '') as string;
    const auth = rawAuth.startsWith('Bearer ')
      ? rawAuth.replace('Bearer ', '')
      : rawAuth;

    if (!EXPECTED || auth !== EXPECTED) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({} as any));

    // --------------------------------
    // Load or use provided topic
    // --------------------------------
    let topic: any = null;

    if (body.topicId) {
      // Case 1: client passed an existing topicId
      topic = await topicRepo.getTopicById(body.topicId);
      if (!topic) {
        return NextResponse.json(
          { success: false, message: 'Topic not found' },
          { status: 404 }
        );
      }
    } else if (body.topic) {
      // Case 2: client passed raw topic data
      topic = body.topic;

      // If topic has no _id, auto-create it in the topics collection
      if (!topic._id) {
        const title: string = topic.title || 'Untitled Topic';
        const baseSlugSource: string = topic.slug || title;
        const slug = baseSlugSource
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        const created = await topicRepo.createTopic({
          title,
          slug,
          primaryKeyword: topic.primaryKeyword || title.toLowerCase(),
          secondaryKeywords: topic.secondaryKeywords || [],
          trendScore:
            typeof topic.trendScore === 'number' ? topic.trendScore : 50,
          monetizationScore:
            typeof topic.monetizationScore === 'number'
              ? topic.monetizationScore
              : 50,
          difficultyScore:
            typeof topic.difficultyScore === 'number'
              ? topic.difficultyScore
              : 30,
          // 👇 use valid enum values from your schema
          ideaType: topic.ideaType || 'evergreen',
          status: 'used',
          source: topic.source || 'manual',
          relatedProductIds: topic.relatedProductIds || [],
        });

        topic = created;
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Missing topicId or topic data' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Select related products
    // -------------------------------
    let products: any[] = [];

    if (topic.relatedProductIds && topic.relatedProductIds.length) {
      if (typeof productRepo.getSkincareProductsByIds === 'function') {
        products = await productRepo.getSkincareProductsByIds(
          topic.relatedProductIds.map(String)
        );
      }
    } else if (body.productIds && body.productIds.length) {
      if (typeof productRepo.getSkincareProductsByIds === 'function') {
        products = await productRepo.getSkincareProductsByIds(
          body.productIds.map(String)
        );
      }
    } else {
      // Fallback search by keyword
      const q = topic.primaryKeyword || topic.title || '';
      if (typeof productRepo.searchSkincareProducts === 'function') {
        const found = await productRepo.searchSkincareProducts(q);
        products = Array.isArray(found) ? found : [];
      } else {
        products = [];
      }
    }

    // extra safety – never let products be undefined/null
    if (!Array.isArray(products)) {
      products = [];
    }

    // -------------------------------
    // Ensure product scores (best-effort)
    // -------------------------------
    const productScores: any[] = [];
    for (const p of products) {
      let score: any = null;

      // your current repo exports getProductScoreByProductId/updateProductScore,
      // but NOT getScoreForProduct, so this will usually push nulls for now.
      if (
        productScoreRepo &&
        typeof (productScoreRepo as any).getScoreForProduct === 'function'
      ) {
        const getScoreForProduct = (productScoreRepo as any)
          .getScoreForProduct as (id: string) => Promise<any>;
        score = await getScoreForProduct(String(p._id || p.id));
      }

      productScores.push(score || null);
    }

    // -------------------------------
    // Call Claude to generate an outline
    // -------------------------------
    const outline = await generateOutlineAndAngle(
      topic,
      products,
      productScores
    );

    // Generate full article
    const bodyRaw = await generateFullArticleDraft(
      topic,
      outline,
      products,
      productScores
    );

    // Generate SEO + schema
    const seo = await generateSeoMetaAndSchema(
      bodyRaw,
      topic,
      products
    );

    // -------------------------------
    // Build draft object and save
    // -------------------------------
    const safeProducts = Array.isArray(products) ? products : [];

    const draftObj = {
      topicId: topic._id || null,
      productIds: safeProducts
        .map((p: any) => p._id || p.id)
        .filter(Boolean),
      postType: 'blog',
      title: seo?.seoTitle || topic.title,
      slug:
        seo?.slug ||
        (topic.slug ||
          (topic.title || '')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')),
      excerpt: seo?.seoDescription || (bodyRaw ? bodyRaw.slice(0, 160) : ''),
      coverImageUrl: undefined,
      categorySlug: body.categorySlug || 'skincare',
      tagSlugs: body.tagSlugs || [],
      seoTitle: seo?.seoTitle || '',
      seoDescription: seo?.seoDescription || '',
      schemaJson: seo?.schema || {},
      faq: seo?.faq || [],
      outline: outline || [],
      bodyRaw,
      wordCount: bodyRaw ? bodyRaw.split(/\s+/).length : 0,
      status: 'draft',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If repo doesn't have helper, just return draft (no DB write)
    if (
      !draftRepo ||
      typeof (draftRepo as any).createDraftFromGeneration !== 'function'
    ) {
      return NextResponse.json(
        {
          success: true,
          draft: draftObj,
          saved: false,
          message:
            'Draft created but not saved: draftRepo.createDraftFromGeneration missing',
        },
        { status: 200 }
      );
    }

    const createDraftFromGeneration = (draftRepo as any)
      .createDraftFromGeneration as (data: any) => Promise<any>;

    const saved = await createDraftFromGeneration(draftObj);

    return NextResponse.json({ success: true, draft: saved }, { status: 200 });
  } catch (err: any) {
    console.error('Generate-now error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
