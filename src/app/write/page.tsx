"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PostEntry {
  slug: string;
  sha: string;
  title: string;
  date: string;
  draft: boolean;
  description: string;
}

function getPassword() {
  return sessionStorage.getItem("write-pw") ?? "";
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toLowerCase();
}

export default function WritePage() {
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/write", {
      headers: { "x-write-password": getPassword() },
    })
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "var(--font-display)",
        background: "var(--color-bg)",
        padding: "var(--header-safe) 1.5rem var(--footer-safe) 1.5rem",
      }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg text-fg" style={{ letterSpacing: "-0.02em" }}>thoughts</h1>
        </div>

        {/* Post list */}
        {loading ? (
          <p className="text-muted text-sm">loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted text-sm">no posts yet.</p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/write/posts/${post.slug}`}
                className="group block py-4 border-b transition-colors"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-fg text-sm group-hover:text-[var(--color-orange)] transition-colors">
                      {post.title}
                      {post.draft && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: "color-mix(in srgb, var(--color-purple) 15%, transparent)",
                            color: "var(--color-purple)",
                            fontSize: "10px",
                          }}
                        >
                          draft
                        </span>
                      )}
                    </div>
                    {post.description && (
                      <div className="text-muted text-xs mt-0.5 truncate">{post.description}</div>
                    )}
                  </div>
                  <span className="text-muted text-xs shrink-0 mt-0.5">
                    {formatDate(post.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
