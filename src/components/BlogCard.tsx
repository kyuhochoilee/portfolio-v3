"use client";

import { useRef } from "react";
import { PostMeta } from "@/lib/content";

export default function BlogCard({
  post,
  isOpen,
  onToggle,
}: {
  post: PostMeta;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const dateRef = useRef<HTMLSpanElement>(null);

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).toLowerCase();

  return (
    <button
      onClick={onToggle}
      className={`group block w-full text-left py-4 border-b transition-colors cursor-pointer ${
        isOpen ? "border-fg/20" : "border-border hover:border-fg/20"
      }`}
      style={{ fontFamily: '"GT Alpina Typewriter Trial", serif' }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-fg text-base group-hover:opacity-60 transition-opacity">
          {post.title.toLowerCase()}
        </span>
        <span ref={dateRef} className="text-muted text-xs shrink-0">
          {formattedDate}
        </span>
      </div>
      {post.description && (
        <p className="text-muted text-sm mt-1 line-clamp-1">
          {post.description.toLowerCase()}
        </p>
      )}
      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
        <span>{post.readingTime}</span>
        {post.tags?.map((tag) => (
          <span key={tag}>#{tag.toLowerCase()}</span>
        ))}
      </div>
    </button>
  );
}
