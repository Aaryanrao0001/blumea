import { NextRequest, NextResponse } from 'next/server';
import {
  getAllGeneratedDrafts,
  getGeneratedDraftById,
  createGeneratedDraft,
  updateGeneratedDraft,
  deleteGeneratedDraft,
  getGeneratedDraftsByStatus,
  approveDraft,
  rejectDraft,
  getDraftsWithPagination,
} from '@/lib/db/repositories/generatedDrafts';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'draft' | 'approved' | 'rejected' | 'published' | null;
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (id) {
      const draft = await getGeneratedDraftById(id);
      if (!draft) {
        return NextResponse.json(
          { success: false, message: 'Draft not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, draft });
    }

    if (searchParams.has('page') || searchParams.has('limit')) {
      const { drafts, total } = await getDraftsWithPagination({
        status: status || undefined,
        page,
        limit,
      });
      return NextResponse.json({
        success: true,
        drafts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const drafts = status
      ? await getGeneratedDraftsByStatus(status)
      : await getAllGeneratedDrafts();
    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
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
      topicId,
      productIds,
      postType,
      title,
      excerpt,
      coverImageUrl,
      categorySlug,
      tagSlugs,
      seoTitle,
      seoDescription,
      schemaJson,
      faq,
      outline,
      bodyRaw,
      createdBy,
    } = body;

    if (!topicId || !title || !excerpt || !categorySlug || !seoTitle || !seoDescription || !bodyRaw) {
      return NextResponse.json(
        { success: false, message: 'topicId, title, excerpt, categorySlug, seoTitle, seoDescription, and bodyRaw are required' },
        { status: 400 }
      );
    }

    const wordCount = bodyRaw.split(/\s+/).length;

    const draft = await createGeneratedDraft({
      topicId,
      productIds: productIds || [],
      postType: postType || 'blog',
      title,
      slug: slugify(title),
      excerpt,
      coverImageUrl,
      categorySlug,
      tagSlugs: tagSlugs || [],
      seoTitle,
      seoDescription,
      schemaJson: schemaJson || {},
      faq: faq || [],
      outline: outline || [],
      bodyRaw,
      wordCount,
      status: 'draft',
      createdBy: createdBy || 'admin',
    });

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    let draft;
    if (action === 'approve') {
      draft = await approveDraft(id);
    } else if (action === 'reject') {
      draft = await rejectDraft(id);
    } else {
      draft = await updateGeneratedDraft(id, updateData);
    }

    if (!draft) {
      return NextResponse.json(
        { success: false, message: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error('Error updating draft:', error);
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

    const deleted = await deleteGeneratedDraft(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Draft deleted' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
