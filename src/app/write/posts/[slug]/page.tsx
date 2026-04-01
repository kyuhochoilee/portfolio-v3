"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WriteEditor from "@/components/WriteEditor";
import { idbGet } from "@/hooks/useLocalSave";

function getPassword() {
  return sessionStorage.getItem("write-pw") ?? "";
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { title: "", description: "", body: raw, draft: true, image: "" };

  const frontmatter = match[1];
  const body = match[2];

  const titleMatch = frontmatter.match(/title:\s*"?([^"\n]*)"?/);
  const title = titleMatch ? titleMatch[1] : "";
  const descMatch = frontmatter.match(/description:\s*"?([^"\n]*)"?/);
  const description = descMatch ? descMatch[1] : "";
  const imageMatch = frontmatter.match(/image:\s*"?([^"\n]*)"?/);
  const image = imageMatch ? imageMatch[1] : "";
  const draft = /draft:\s*true/.test(frontmatter);

  return { title, description, body: body.trim(), draft, image };
}

interface PostData {
  title: string;
  description: string;
  body: string;
  sha: string;
  draft: boolean;
  image: string;
  source: "local" | "remote";
}

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      // Try local first (instant)
      try {
        const local = await idbGet(slug);
        if (local) {
          // Serialize blocks back to body for the editor
          const body = local.blocks
            .map((b) => {
              if (b.type === "image" && b.content) return `![${b.caption || ""}](${b.content})`;
              return b.content;
            })
            .filter(Boolean)
            .join("\n\n");

          setData({
            title: local.title,
            description: local.description,
            body,
            sha: local.sha,
            draft: local.isDraft,
            image: local.headerImage,
            source: "local",
          });
          setLoading(false);

          // Still fetch remote in background to get latest SHA
          fetch(`/api/write?slug=${slug}`, {
            headers: { "x-write-password": getPassword() },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.sha) {
                // Update SHA if remote is newer, but keep local content
                setData((prev) => prev ? { ...prev, sha: d.sha } : prev);
              }
            })
            .catch(() => {}); // offline is fine

          return;
        }
      } catch {
        // IndexedDB unavailable, fall through to remote
      }

      // Fall back to remote
      try {
        const res = await fetch(`/api/write?slug=${slug}`, {
          headers: { "x-write-password": getPassword() },
        });
        const d = await res.json();
        if (d.content) {
          const { title, description, body, draft, image } = parseFrontmatter(d.content);
          setData({ title, description: description || "", body, sha: d.sha ?? "", draft, image: image || "", source: "remote" });
        }
      } catch {
        // Truly offline and no local copy
      }
      setLoading(false);
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen text-muted text-sm"
        style={{ fontFamily: "var(--font-display)", background: "var(--color-bg)" }}
      >
        loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="flex items-center justify-center h-screen text-muted text-sm"
        style={{ fontFamily: "var(--font-display)", background: "var(--color-bg)" }}
      >
        post not found
      </div>
    );
  }

  return (
    <WriteEditor
      initialTitle={data.title}
      initialDescription={data.description}
      initialBody={data.body}
      initialHeaderImage={data.image}
      slug={slug}
      sha={data.sha}
      initialDraft={data.draft}
    />
  );
}
