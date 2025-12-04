import { connectToDatabase } from '../mongoose';
import Post from '../models/Post';
import Category from '../models/Category';
import Author from '../models/Author';
import Tag from '../models/Tag';
import { IPostPopulated } from '@/lib/types';
import { calculateReadingTime } from '@/lib/utils';

// Ensure models are registered by referencing them
const _registeredModels = { Category, Author, Tag };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ensureModels = () => _registeredModels;

interface GetPostsOptions {
  type?: 'blog' | 'review';
  category?: string;
  tag?: string;
  featured?: boolean;
  popular?: boolean;
  limit?: number;
  page?: number;
  excludeSlug?: string;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<{
  posts: IPostPopulated[];
  total: number;
}> {
  await connectToDatabase();
  ensureModels();

  const {
    type,
    category,
    tag,
    featured,
    popular,
    limit = 10,
    page = 1,
    excludeSlug,
  } = options;

  const query: Record<string, unknown> = {};

  if (type) query.type = type;
  if (featured !== undefined) query.isFeatured = featured;
  if (popular !== undefined) query.isPopular = popular;
  if (excludeSlug) query.slug = { $ne: excludeSlug };

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
  }

  if (tag) {
    const tagDoc = await Tag.findOne({ slug: tag });
    if (tagDoc) {
      query.tags = tagDoc._id;
    }
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('category')
      .populate('author')
      .populate('tags')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return {
    posts: posts as unknown as IPostPopulated[],
    total,
  };
}

export async function getPostBySlug(
  slug: string
): Promise<IPostPopulated | null> {
  await connectToDatabase();
  ensureModels();

  const post = await Post.findOne({ slug })
    .populate('category')
    .populate('author')
    .populate('tags')
    .lean();

  return post as unknown as IPostPopulated | null;
}

export async function getFeaturedPost(): Promise<IPostPopulated | null> {
  await connectToDatabase();
  ensureModels();

  const post = await Post.findOne({ isFeatured: true })
    .populate('category')
    .populate('author')
    .populate('tags')
    .sort({ publishedAt: -1 })
    .lean();

  return post as unknown as IPostPopulated | null;
}

export async function getPopularPosts(
  limit: number = 5
): Promise<IPostPopulated[]> {
  await connectToDatabase();
  ensureModels();

  const posts = await Post.find({ isPopular: true })
    .populate('category')
    .populate('author')
    .populate('tags')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return posts as unknown as IPostPopulated[];
}

export async function getNewPosts(limit: number = 5): Promise<IPostPopulated[]> {
  await connectToDatabase();
  ensureModels();

  const posts = await Post.find()
    .populate('category')
    .populate('author')
    .populate('tags')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return posts as unknown as IPostPopulated[];
}

export async function getRelatedPosts(
  postSlug: string,
  categoryId: string,
  limit: number = 3
): Promise<IPostPopulated[]> {
  await connectToDatabase();
  ensureModels();

  const posts = await Post.find({
    slug: { $ne: postSlug },
    category: categoryId,
  })
    .populate('category')
    .populate('author')
    .populate('tags')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return posts as unknown as IPostPopulated[];
}

export async function searchPosts(query: string): Promise<IPostPopulated[]> {
  await connectToDatabase();
  ensureModels();

  const posts = await Post.find({
    $text: { $search: query },
  })
    .populate('category')
    .populate('author')
    .populate('tags')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();

  return posts as unknown as IPostPopulated[];
}

export async function getAllPostSlugs(): Promise<string[]> {
  await connectToDatabase();
  const posts = await Post.find().select('slug').lean();
  return posts.map((post) => post.slug);
}

export async function createPost(
  data: Omit<IPostPopulated, '_id' | 'category' | 'author' | 'tags'> & {
    category: string;
    author: string;
    tags: string[];
  }
): Promise<IPostPopulated> {
  await connectToDatabase();
  ensureModels();

  const readingTime = calculateReadingTime(data.body);

  const post = await Post.create({
    ...data,
    readingTime,
  });

  const populated = await Post.findById(post._id)
    .populate('category')
    .populate('author')
    .populate('tags')
    .lean();

  return populated as unknown as IPostPopulated;
}
