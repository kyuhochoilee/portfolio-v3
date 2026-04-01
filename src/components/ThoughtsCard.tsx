"use client";

import { useState, useEffect, useRef } from "react";
import BlogSection from "@/components/BlogSection";
import { useScrollContext } from "@/context/ScrollContext";
import type { PostMeta } from "@/lib/content";

export default function ThoughtsCard({
  posts,
  blogContent,
}: {
  posts: PostMeta[];
  blogContent: Record<string, React.ReactNode>;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { registerDetailBack, unregisterDetailBack } = useScrollContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const isOpen = !!activeSlug;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeSlug]);

  useEffect(() => {
    if (isMobile && isOpen) {
      registerDetailBack("thoughts", () => setActiveSlug(null));
    } else {
      unregisterDetailBack("thoughts");
    }
    return () => unregisterDetailBack("thoughts");
  }, [isMobile, isOpen, registerDetailBack, unregisterDetailBack]);

  return (
    <div
      className="h-full"
      style={{
        display: "grid",
        gridTemplateColumns: isOpen && !isMobile ? "320px 1fr 320px" : "1fr",
        fontFamily: "var(--font-display)",
      }}
    >
      {/* Timeline — hidden on mobile when post is open */}
      {!(isMobile && isOpen) && <div
        className="relative overflow-y-auto"
        style={{
          paddingBottom: "var(--footer-safe)",
          paddingLeft: isOpen ? "2rem" : "1.5rem",
          paddingRight: isOpen ? "0.75rem" : "1.5rem",
          overscrollBehavior: "contain",
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
      </div>}

      {/* Post content — only in DOM when open */}
      {isOpen && (() => {
        const activePost = posts.find((p) => p.slug === activeSlug);
        const formattedDate = activePost
          ? new Date(activePost.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toLowerCase()
          : "";
        return (
          <>
            <div
              ref={contentRef}
              className="relative overflow-y-auto mx-auto w-full"
              style={{
                paddingBottom: "var(--footer-safe)",
                animation: "expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                overscrollBehavior: "auto",
                maxWidth: isMobile ? "36rem" : undefined,
                paddingLeft: isMobile ? "1.5rem" : undefined,
                paddingRight: isMobile ? "1.5rem" : undefined,
              }}
            >
              {/* Post header — article style */}
              <div style={{ paddingTop: "var(--header-safe)" }}>
                <div className="flex justify-center" style={{ paddingLeft: isMobile ? 0 : "1.5rem", paddingRight: isMobile ? 0 : "1.5rem" }}>
                  <div style={{ width: isMobile ? "100%" : "33rem", maxWidth: "100%" }}>
                    {/* Header image */}
                    {activePost?.image && (
                      <div className="relative aspect-[16/10] mb-6 overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
                        <img
                          src={activePost.image}
                          alt={activePost.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title — centered */}
                    <h2 className="subheading text-center" style={{ paddingBottom: "0.5rem" }}>
                      {activePost?.title.toLowerCase()}
                    </h2>

                    {/* Subtitle — centered */}
                    {activePost?.description && (
                      <p className="text-muted text-sm text-center" style={{ paddingBottom: "0.5rem" }}>
                        {activePost.description.toLowerCase()}
                      </p>
                    )}

                    {/* Date — centered */}
                    <div className="text-center">
                      <span className="text-muted text-xs">{formattedDate}</span>
                    </div>

                    {/* Divider */}
                    <div
                      className="mx-auto"
                      style={{
                        width: "3rem",
                        height: "1px",
                        background: "var(--color-border)",
                        marginTop: "1.5rem",
                        marginBottom: "1.5rem",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Post body */}
              <div className="flex justify-center" style={{ paddingLeft: isMobile ? 0 : "1.5rem", paddingRight: isMobile ? 0 : "1.5rem" }}>
                <div style={{ width: isMobile ? "100%" : "33rem", maxWidth: "100%" }}>
                  {activeSlug && blogContent[activeSlug]}
                </div>
              </div>
            </div>
            {/* Balance column — desktop only */}
            {!isMobile && <div />}
          </>
        );
      })()}
    </div>
  );
}
