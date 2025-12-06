import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPostsPhase3,
  getPostById,
  createPostPhase3,
  updatePostPhase3,
  deletePost,
} from '@/lib/db/repositories/posts';
import { slugify } from '@/lib/utils';
import { PostStatus, PostType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status') as PostStatus | null;
    const postType = searchParams.get('postType') as PostType | null;
    const source = searchParams.get('source') as 'ai' | 'manual' | 'mixed' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (id) {
      const post = await getPostById(id);
      if (!post) {
        return NextResponse.json(
          { success: false, message: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, post });
    }

    const { posts, total } = await getAllPostsPhase3({
      status: status || undefined,
      postType: postType || undefined,
      source: source || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      source,
      status,
      postType,
      title,
      excerpt,
      categorySlug,
      tagSlugs,
      seoTitle,
      seoDescription,
      canonicalUrl,
      bodyRaw,
      bodyFormat,
      images,
      review,
      topicId,
      aiGenerationMeta,
      createdBy,
      scheduledFor,
      isFeatured,
      isPopular,
    } = body;

    if (!title || !excerpt || !bodyRaw || !postType) {
      return NextResponse.json(
        { success: false, message: 'title, excerpt, bodyRaw, and postType are required' },
        { status: 400 }
      );
    }

    const wordCount = bodyRaw.split(/\s+/).length;
    const slug = slugify(title);

    const post = await createPostPhase3({
      source: source || 'manual',
      status: status || 'draft',
      postType,
      title,
      slug,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      canonicalUrl,
      categorySlug: categorySlug || '',
      tagSlugs: tagSlugs || [],
      excerpt,
      bodyFormat: bodyFormat || 'markdown',
      bodyRaw,
      wordCount,
      images: images || {},
      review,
      topicId,
      aiGenerationMeta,
      createdBy: createdBy || 'admin',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      isFeatured: isFeatured || false,
      isPopular: isPopular || false,
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    // If title is being updated, update slug too
    if (updateData.title) {
      updateData.slug = slugify(updateData.title);
    }

    // Recalculate word count if bodyRaw is being updated
    if (updateData.bodyRaw) {
      updateData.wordCount = updateData.bodyRaw.split(/\s+/).length;
    }

    const post = await updatePostPhase3(id, updateData);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    const deleted = await deletePost(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
