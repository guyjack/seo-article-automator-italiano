
type Props = {
  post: { title: string; content: string; tags?: string[]; category?: string; imageUrl?: string };
};

export default function PostPreview({ post }: Props) {
  return (
    <div className="rounded-lg border bg-background p-6 shadow flex flex-col gap-4">
      {post.imageUrl && (
        <div className="w-full aspect-video rounded-lg overflow-hidden border">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="text-xl font-bold text-primary">{post.title}</div>
      {post.category && (
        <div className="text-sm text-muted-foreground mb-2">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-sm font-medium">
            📁 {post.category}
          </span>
        </div>
      )}
      <div className="text-base text-muted-foreground mb-3">{post.content}</div>
      {post.tags && (
        <div className="flex flex-wrap gap-2 mt-2">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-accent px-2 py-1 rounded-sm text-xs font-semibold text-accent-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
