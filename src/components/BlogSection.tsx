"use client";

import type { PostMeta } from "@/lib/content";

function TimelineItem({
  post,
  isActive,
  isCollapsed,
  onClick,
}: {
  post: PostMeta;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 w-full text-left cursor-pointer py-2"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <div className="shrink-0 pt-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{
            background: isActive ? "var(--color-orange)" : "var(--color-border)",
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="text-sm transition-opacity group-hover:opacity-60"
            style={{ color: isActive ? "var(--color-orange)" : "var(--color-fg)" }}
          >
            {post.title.toLowerCase()}
          </span>
        </div>
      </div>
    </button>
  );
}

function groupByMonth(posts: PostMeta[]) {
  const groups: { label: string; posts: PostMeta[] }[] = [];
  let currentLabel = "";

  for (const post of posts) {
    const d = new Date(post.date);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toLowerCase();
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, posts: [] });
    }
    groups[groups.length - 1].posts.push(post);
  }

  return groups;
}

export default function BlogSection({
  posts,
  activeSlug,
  onSelect,
}: {
  posts: PostMeta[];
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
}) {
  const sortedPosts = [...posts];
  const grouped = groupByMonth(sortedPosts);
  const isCollapsed = !!activeSlug;

  return (
    <div
      className="w-full"
      style={{ fontFamily: "var(--font-display)" }}
    >

      <div className="relative" style={{ marginLeft: "2px" }}>
        <div
          className="absolute left-[2.5px] top-0 bottom-0 w-px"
          style={{ background: "var(--color-border)" }}
        />

        {grouped.map((group) => (
          <div key={group.label} className="relative mb-3">
            <div
              className="text-xs text-muted mb-1 pl-5"
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-orange)",
                fontSize: "10px",
              }}
            >
              {group.label}
            </div>

            {group.posts.map((post) => (
              <TimelineItem
                key={post.slug}
                post={post}
                isActive={activeSlug === post.slug}
                isCollapsed={isCollapsed}
                onClick={() => {
                  if (onSelect) {
                    onSelect(post.slug);
                  } else {
                    // no-op — onSelect should handle this
                  }
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
