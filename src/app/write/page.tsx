"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllLocalPosts, type LocalPost } from "@/hooks/useLocalSave";

interface PostEntry {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  description: string;
  source: "local" | "remote" | "both";
  syncStatus?: "synced" | "pending" | "conflict";
}

function getPassword() {
  return localStorage.getItem("write-pw") ?? "";
}

function formatDate(d: string | number) {
  if (!d) return "";
  const date = typeof d === "number" ? new Date(d) : new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toLowerCase();
}

export default function WritePage() {
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      // Load from both sources in parallel
      const [localPosts, remotePosts] = await Promise.all([
        getAllLocalPosts().catch(() => [] as LocalPost[]),
        fetch("/api/write", {
          headers: { "x-write-password": getPassword() },
        })
          .then((r) => r.json())
          .then((d) => d.posts ?? [])
          .catch(() => []),
      ]);

      // Merge: local takes priority, remote fills gaps
      const merged = new Map<string, PostEntry>();

      // Add remote posts first
      for (const p of remotePosts) {
        merged.set(p.slug, {
          slug: p.slug,
          title: p.title || p.slug,
          date: p.date || "",
          draft: p.draft ?? true,
          description: p.description || "",
          source: "remote",
        });
      }

      // Overlay local posts (they're more up-to-date)
      for (const p of localPosts) {
        const existing = merged.get(p.slug);
        merged.set(p.slug, {
          slug: p.slug,
          title: p.title || p.slug,
          date: p.date || "",
          draft: p.isDraft,
          description: p.description || "",
          source: existing ? "both" : "local",
          syncStatus: p.syncStatus,
        });
      }

      // Sort by date desc
      const sorted = Array.from(merged.values()).sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      });

      setPosts(sorted);
      setLoading(false);
    }

    loadPosts();
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
        <div className="mb-8">
          <h1 className="text-lg text-fg" style={{ letterSpacing: "-0.02em" }}>thoughts</h1>
        </div>

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
                      {post.syncStatus === "pending" && (
                        <span className="text-xs text-muted" style={{ fontSize: "10px" }}>○</span>
                      )}
                      {post.source === "local" && (
                        <span className="text-xs text-muted" style={{ fontSize: "10px" }}>local</span>
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
