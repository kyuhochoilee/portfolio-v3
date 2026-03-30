"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import BlogSection from "@/components/BlogSection";
import type { PostMeta } from "@/lib/content";

export default function BlogPageClient({
  posts,
  postContent,
}: {
  posts: PostMeta[];
  postContent: Record<string, React.ReactNode>;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  if (!activeSlug) {
    // Exact same structure as AboutSection
    return (
      <section
        className="flex items-center justify-center w-full min-h-screen"
        style={{
          background: "var(--color-bg)",
          paddingTop: "calc(var(--header-safe) + 2rem)",
          paddingBottom: "var(--footer-safe)",
        }}
      >
        <Container className="max-w-xl">
          <BlogSection
            posts={posts}
            activeSlug={null}
            onSelect={(slug) => setActiveSlug(slug)}
          />
        </Container>
      </section>
    );
  }

  // Post selected — split view
  return (
    <div
      className="flex h-screen"
      style={{ fontFamily: "var(--font-display)", background: "var(--color-bg)" }}
    >
      <div
        className="shrink-0 overflow-y-auto"
        style={{
          width: "200px",
          padding: "var(--header-safe) 1rem var(--footer-safe) 1.5rem",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <BlogSection
          posts={posts}
          activeSlug={activeSlug}
          onSelect={(slug) => setActiveSlug(activeSlug === slug ? null : slug)}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: "var(--header-safe) 3rem var(--footer-safe) 3rem",
          animation: "expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <div className="max-w-2xl">
          {postContent[activeSlug]}

          <button
            onClick={() => setActiveSlug(null)}
            className="mt-8 text-sm text-muted hover:text-fg transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            &larr; back
          </button>
        </div>
      </div>
    </div>
  );
}
