import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedDraftById, markDraftPublished } from '@/lib/db/repositories/generatedDrafts';
import { createPost } from '@/lib/db/repositories/posts';
import { getCategoryBySlug } from '@/lib/db/repositories/categories';
import { connectToDatabase } from '@/lib/db/mongoose';
import Author from '@/lib/db/models/Author';
import Tag from '@/lib/db/models/Tag';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await getGeneratedDraftById(id);

    if (!draft) {
      return NextResponse.json(
        { success: false, message: 'Draft not found' },
        { status: 404 }
      );
    }

    if (draft.status === 'published') {
      return NextResponse.json(
        { success: false, message: 'Draft is already published' },
        { status: 400 }
      );
    }

    // Get or create category
    const category = await getCategoryBySlug(draft.categorySlug);
    if (!category) {
      return NextResponse.json(
        { success: false, message: `Category "${draft.categorySlug}" not found` },
        { status: 400 }
      );
    }

    // Get or create default author
    await connectToDatabase();
    let authorDoc = await Author.findOne({ slug: 'blumea-team' });
    if (!authorDoc) {
      authorDoc = await Author.create({
        name: 'Blumea Team',
        slug: 'blumea-team',
        bio: 'The Blumea editorial team brings you science-based skincare insights.',
      });
    }

    // Get or create tags
    const tagIds: string[] = [];
    for (const tagSlug of draft.tagSlugs) {
      let tagDoc = await Tag.findOne({ slug: tagSlug });
      if (!tagDoc) {
        tagDoc = await Tag.create({
          title: tagSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: tagSlug,
        });
      }
      tagIds.push(tagDoc._id.toString());
    }

    // Create the post
    const post = await createPost({
      title: draft.title,
      slug: draft.slug,
      type: draft.postType,
      excerpt: draft.excerpt,
      body: draft.bodyRaw,
      coverImage: {
        url: draft.coverImageUrl || 'https://placehold.co/1200x630/1A1A1A/D4AF37?text=Blumea',
        alt: draft.title,
      },
      category: category._id.toString(),
      tags: tagIds,
      author: authorDoc._id.toString(),
      publishedAt: new Date(),
      updatedAt: new Date(),
      isFeatured: false,
      isPopular: false,
    });

    // Mark draft as published
    await markDraftPublished(id, post._id.toString());

    return NextResponse.json({
      success: true,
      message: 'Draft published successfully',
      post,
    });
  } catch (error) {
    console.error('Error publishing draft:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
