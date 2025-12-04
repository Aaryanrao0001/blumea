import { PostCard } from './PostCard';
import { PostData } from '@/lib/types';

interface RelatedPostsProps {
  posts: PostData[];
  title?: string;
}

export function RelatedPosts({ posts, title = 'Related Posts' }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-semibold text-text-primary mb-6">
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

export default RelatedPosts;
