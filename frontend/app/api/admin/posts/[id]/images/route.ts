import { NextRequest, NextResponse } from 'next/server';
import { updatePostImages } from '@/lib/db/repositories/posts';
import { Post } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { images } = body;

    if (!images) {
      return NextResponse.json(
        { success: false, message: 'images object is required' },
        { status: 400 }
      );
    }

    const post = await updatePostImages(id, images as Post['images']);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error updating post images:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
