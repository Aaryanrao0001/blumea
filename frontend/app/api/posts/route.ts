import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/db/repositories/posts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') as 'blog' | 'review' | null;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const featured = searchParams.get('featured');
    const popular = searchParams.get('popular');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const { posts, total } = await getPosts({
      type: type || undefined,
      category: category || undefined,
      tag: tag || undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      popular: popular === 'true' ? true : popular === 'false' ? false : undefined,
      limit,
      page,
    });

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
