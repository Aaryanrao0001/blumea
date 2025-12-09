import { connectToDatabase } from '../mongoose';
import Post from '../models/Post';
import Category from '../models/Category';
import Author from '../models/Author';
import Tag from '../models/Tag';
import { IPostPopulated, Post as PostPhase3, PostStatus, PostType } from '@/lib/types';
import { calculateReadingTime } from '@/lib/utils';
import { Types } from 'mongoose';

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
  status?: PostStatus; // Phase 3: filter by status
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
    status = 'published', // Default to published for public pages
  } = options;

  const query: Record<string, unknown> = {};

  if (type) query.type = type;
  if (status) query.status = status;
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

  const post = await Post.findOne({ slug, status: 'published' })
    .populate('category')
    .populate('author')
    .populate('tags')
    .lean();

  return post as unknown as IPostPopulated | null;
}

export async function getFeaturedPost(): Promise<IPostPopulated | null> {
  await connectToDatabase();
  ensureModels();

  const post = await Post.findOne({ isFeatured: true, status: 'published' })
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

  const posts = await Post.find({ isPopular: true, status: 'published' })
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

  const posts = await Post.find({ status: 'published' })
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
    categorySlug: categoryId,
    status: 'published',
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

// Phase 3: New repository functions

export async function getPostsByStatus(
  status: PostStatus,
  options: { limit?: number; page?: number } = {}
): Promise<{ posts: PostPhase3[]; total: number }> {
  await connectToDatabase();

  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments({ status }),
  ]);

  return {
    posts: posts as unknown as PostPhase3[],
    total,
  };
}

export async function getPublishedBlogPosts(options: {
  limit?: number;
  page?: number;
  categorySlug?: string;
} = {}): Promise<{ posts: PostPhase3[]; total: number }> {
  await connectToDatabase();

  const { limit = 10, page = 1, categorySlug } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    status: 'published',
    postType: 'blog',
  };

  if (categorySlug) {
    query.categorySlug = categorySlug;
  }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return {
    posts: posts as unknown as PostPhase3[],
    total,
  };
}

export async function getPublishedReviews(options: {
  limit?: number;
  page?: number;
  categorySlug?: string;
} = {}): Promise<{ posts: PostPhase3[]; total: number }> {
  await connectToDatabase();

  const { limit = 10, page = 1, categorySlug } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    status: 'published',
    postType: 'review',
  };

  if (categorySlug) {
    query.categorySlug = categorySlug;
  }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return {
    posts: posts as unknown as PostPhase3[],
    total,
  };
}

export async function getLabPosts(options: {
  limit?: number;
  page?: number;
} = {}): Promise<{ posts: PostPhase3[]; total: number }> {
  return getPostsByStatus('lab', options);
}

export async function updatePostStatus(
  id: string | Types.ObjectId,
  status: PostStatus
): Promise<PostPhase3 | null> {
  await connectToDatabase();

  const update: Record<string, unknown> = { status, updatedAt: new Date() };

  // If transitioning to published, set publishedAt if not already set
  if (status === 'published') {
    const post = await Post.findById(id);
    if (post && !post.publishedAt) {
      update.publishedAt = new Date();
    }
  }

  const post = await Post.findByIdAndUpdate(id, update, { new: true }).lean();

  return post as unknown as PostPhase3 | null;
}

export async function updatePostImages(
  id: string | Types.ObjectId,
  images: PostPhase3['images']
): Promise<PostPhase3 | null> {
  await connectToDatabase();

  const post = await Post.findByIdAndUpdate(
    id,
    { images, updatedAt: new Date() },
    { new: true }
  ).lean();

  return post as unknown as PostPhase3 | null;
}

export async function getPostsForHome(): Promise<{
  featured: PostPhase3[];
  popular: PostPhase3[];
  new: PostPhase3[];
}> {
  await connectToDatabase();

  const query = { status: 'published' };

  const [featured, popular, newPosts] = await Promise.all([
    Post.find({ ...query, isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(1)
      .lean(),
    Post.find({ ...query, isPopular: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean(),
    Post.find(query)
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    featured: featured as unknown as PostPhase3[],
    popular: popular as unknown as PostPhase3[],
    new: newPosts as unknown as PostPhase3[],
  };
}

export async function createPostPhase3(
  data: Omit<PostPhase3, '_id' | 'createdAt' | 'updatedAt'>
): Promise<PostPhase3> {
  await connectToDatabase();

  const post = await Post.create({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return post.toObject() as unknown as PostPhase3;
}

export async function updatePostPhase3(
  id: string | Types.ObjectId,
  data: Partial<Omit<PostPhase3, '_id' | 'createdAt'>>
): Promise<PostPhase3 | null> {
  await connectToDatabase();

  const post = await Post.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true }
  ).lean();

  return post as unknown as PostPhase3 | null;
}

export async function getPostById(id: string | Types.ObjectId): Promise<PostPhase3 | null> {
  await connectToDatabase();

  const post = await Post.findById(id).lean();

  return post as unknown as PostPhase3 | null;
}

export async function deletePost(id: string | Types.ObjectId): Promise<boolean> {
  await connectToDatabase();

  const result = await Post.findByIdAndDelete(id);

  return !!result;
}

export async function getScheduledPosts(): Promise<PostPhase3[]> {
  await connectToDatabase();

  const now = new Date();

  const posts = await Post.find({
    status: 'scheduled',
    scheduledFor: { $lte: now },
  }).lean();

  return posts as unknown as PostPhase3[];
}

export async function getAllPostsPhase3(options: {
  status?: PostStatus;
  postType?: PostType;
  source?: 'ai' | 'manual' | 'mixed';
  limit?: number;
  page?: number;
} = {}): Promise<{ posts: PostPhase3[]; total: number }> {
  await connectToDatabase();

  const { status, postType, source, limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (postType) query.postType = postType;
  if (source) query.source = source;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return {
    posts: posts as unknown as PostPhase3[],
    total,
  };
}
