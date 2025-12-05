import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicsByStatus,
} from '@/lib/db/repositories/topics';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'new' | 'selected' | 'used' | 'rejected' | null;
    const id = searchParams.get('id');

    if (id) {
      const topic = await getTopicById(id);
      if (!topic) {
        return NextResponse.json(
          { success: false, message: 'Topic not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, topic });
    }

    const topics = status ? await getTopicsByStatus(status) : await getAllTopics();
    return NextResponse.json({ success: true, topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, primaryKeyword, secondaryKeywords, ideaType, source, trendScore, monetizationScore, difficultyScore, relatedProductIds } = body;

    if (!title || !primaryKeyword || !ideaType || !source) {
      return NextResponse.json(
        { success: false, message: 'title, primaryKeyword, ideaType, and source are required' },
        { status: 400 }
      );
    }

    const topic = await createTopic({
      title,
      slug: slugify(title),
      primaryKeyword,
      secondaryKeywords: secondaryKeywords || [],
      ideaType,
      source,
      trendScore: trendScore || 50,
      monetizationScore: monetizationScore || 50,
      difficultyScore,
      status: 'new',
      relatedProductIds: relatedProductIds || [],
    });

    return NextResponse.json({ success: true, topic }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
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

    const topic = await updateTopic(id, updateData);
    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error('Error updating topic:', error);
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

    const deleted = await deleteTopic(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
