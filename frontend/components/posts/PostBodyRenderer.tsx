import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { ComponentPropsWithoutRef } from 'react';

interface PostBodyRendererProps {
  content: string;
}

export function PostBodyRenderer({ content }: PostBodyRendererProps) {
  return (
    <div
      className="prose prose-invert prose-lg max-w-none
        prose-headings:font-heading prose-headings:text-text-primary prose-headings:scroll-mt-20
        prose-p:text-text-secondary prose-p:leading-relaxed
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text-primary
        prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-text-secondary
        prose-ul:text-text-secondary prose-ol:text-text-secondary
        prose-li:marker:text-accent prose-li:my-1
        prose-code:text-accent prose-code:bg-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-bg-tertiary prose-pre:border prose-pre:border-border-subtle
        prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
        prose-table:border-collapse prose-table:border prose-table:border-border-subtle
        prose-th:border prose-th:border-border-subtle prose-th:bg-bg-tertiary prose-th:p-2
        prose-td:border prose-td:border-border-subtle prose-td:p-2
        prose-hr:border-border-subtle"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          // Custom link component with proper rel attributes
          a: ({ ...props }: ComponentPropsWithoutRef<'a'>) => {
            const href = props.href || '';
            const isExternal = href.startsWith('http') && !href.includes(window?.location?.hostname || '');
            return (
              <a
                {...props}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                target={isExternal ? '_blank' : undefined}
              />
            );
          },
          // Custom image component with lazy loading
          img: ({ ...props }: ComponentPropsWithoutRef<'img'>) => {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                {...props}
                loading="lazy"
                className="w-full h-auto"
                alt={props.alt || 'Article image'}
              />
            );
          },
          // Add custom heading components with anchor support
          h1: ({ ...props }: ComponentPropsWithoutRef<'h1'>) => (
            <h1 {...props} className="group relative">
              {props.children}
            </h1>
          ),
          h2: ({ ...props }: ComponentPropsWithoutRef<'h2'>) => (
            <h2 {...props} className="group relative">
              {props.children}
            </h2>
          ),
          h3: ({ ...props }: ComponentPropsWithoutRef<'h3'>) => (
            <h3 {...props} className="group relative">
              {props.children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default PostBodyRenderer;
