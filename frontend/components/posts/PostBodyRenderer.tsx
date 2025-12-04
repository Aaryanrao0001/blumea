interface PostBodyRendererProps {
  content: string;
}

export function PostBodyRenderer({ content }: PostBodyRendererProps) {
  // Simple markdown-like rendering
  // In production, you might use react-markdown or similar
  
  return (
    <div
      className="prose prose-invert prose-lg max-w-none
        prose-headings:font-heading prose-headings:text-text-primary
        prose-p:text-text-secondary prose-p:leading-relaxed
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text-primary
        prose-blockquote:border-accent prose-blockquote:text-text-secondary
        prose-ul:text-text-secondary prose-ol:text-text-secondary
        prose-li:marker:text-accent"
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  );
}

function formatContent(content: string): string {
  // Basic markdown-like formatting
  let formatted = content
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br />');

  // Wrap in paragraph if not already wrapped
  if (!formatted.startsWith('<')) {
    formatted = `<p>${formatted}</p>`;
  }

  return formatted;
}

export default PostBodyRenderer;
