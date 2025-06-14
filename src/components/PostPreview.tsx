
type Props = {
  post: { title: string; content: string; tags?: string[] };
};

export default function PostPreview({ post }: Props) {
  return (
    <div className="rounded-lg border bg-background p-6 shadow flex flex-col gap-2">
      <div className="text-xl font-bold text-primary">{post.title}</div>
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
