"use client";

import { useState } from "react";
import BlogSection from "@/components/BlogSection";
import type { PostMeta } from "@/lib/content";

export default function ThoughtsCard({
  posts,
  blogContent,
}: {
  posts: PostMeta[];
  blogContent: Record<string, React.ReactNode>;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const isOpen = !!activeSlug;

  return (
    <div
      className="h-full"
      style={{
        display: "grid",
        gridTemplateColumns: isOpen ? "320px 1fr 320px" : "1fr",
        fontFamily: "var(--font-display)",
      }}
    >
      {/* Timeline — always rendered */}
      <div
        className="relative overflow-y-auto"
        style={{
          paddingBottom: "var(--footer-safe)",
          paddingLeft: isOpen ? "2rem" : "1.5rem",
          paddingRight: isOpen ? "0.75rem" : "1.5rem",
        }}
      >
        {/* Sticky header with blur */}
        <div
          className="sticky top-0 z-20"
          style={{ paddingTop: "var(--header-safe)", background: "var(--color-bg)" }}
        >
          <div
            style={{
              width: isOpen ? "100%" : "36rem",
              maxWidth: "100%",
              margin: isOpen ? "0" : "0 auto",
            }}
          >
            <h2 className="subheading" style={{ paddingBottom: "0.25rem" }}>thoughts</h2>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)", paddingBottom: "0.75rem" }}>
              a peek into my mind
            </p>
          </div>
          {/* Blur fade under the sticky header */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: "-2rem",
              height: "2rem",
              background: "linear-gradient(to bottom, var(--color-bg), transparent)",
            }}
          />
        </div>

        {/* Timeline content scrolls under */}
        <div
          style={{
            width: isOpen ? "100%" : "36rem",
            maxWidth: "100%",
            margin: isOpen ? "0" : "0 auto",
            paddingTop: "1.5rem",
          }}
        >
          <BlogSection
            posts={posts}
            activeSlug={activeSlug}
            onSelect={(slug) => setActiveSlug(activeSlug === slug ? null : slug)}
          />
        </div>
      </div>

      {/* Post content — only in DOM when open */}
      {isOpen && (() => {
        const activePost = posts.find((p) => p.slug === activeSlug);
        const formattedDate = activePost
          ? new Date(activePost.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toLowerCase()
          : "";
        return (
          <>
            <div
              className="relative overflow-y-auto"
              style={{
                paddingBottom: "var(--footer-safe)",
                animation: "expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              {/* Sticky post header */}
              <div
                className="sticky top-0 z-20"
                style={{ paddingTop: "var(--header-safe)", background: "var(--color-bg)" }}
              >
                <div className="flex justify-center" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                  <div style={{ width: "33rem", maxWidth: "100%" }}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveSlug(null)}
                        className="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
                      >
                        &larr; back
                      </button>
                      <span className="text-muted text-xs">{formattedDate}</span>
                    </div>
                    <h2 className="subheading" style={{ paddingTop: "0.5rem", paddingBottom: "0.25rem" }}>
                      {activePost?.title.toLowerCase()}
                    </h2>
                    {activePost?.description && (
                      <p className="text-muted text-sm" style={{ paddingBottom: "0.25rem" }}>
                        {activePost.description.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
                {/* Blur fade under header */}
                <div
                  className="pointer-events-none"
                  style={{
                    height: "3rem",
                    background: "linear-gradient(to bottom, var(--color-bg) 20%, transparent)",
                  }}
                />
              </div>

              {/* Post body — tight to header */}
              <div className="flex justify-center" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                <div style={{ width: "33rem", maxWidth: "100%" }}>
                  {activeSlug && blogContent[activeSlug]}
                  <button
                    onClick={() => setActiveSlug(null)}
                    className="mt-8 mb-4 text-sm text-muted hover:text-fg transition-colors cursor-pointer"
                  >
                    &larr; back
                  </button>
                </div>
              </div>
            </div>
            {/* Balance column */}
            <div />
          </>
        );
      })()}
    </div>
  );
}
