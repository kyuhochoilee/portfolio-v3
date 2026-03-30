"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WriteEditor from "@/components/WriteEditor";

function getPassword() {
  return sessionStorage.getItem("write-pw") ?? "";
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { title: "", body: raw, draft: true };

  const frontmatter = match[1];
  const body = match[2];

  const titleMatch = frontmatter.match(/title:\s*"?([^"\n]*)"?/);
  const title = titleMatch ? titleMatch[1] : "";
  const descMatch = frontmatter.match(/description:\s*"?([^"\n]*)"?/);
  const description = descMatch ? descMatch[1] : "";
  const draft = /draft:\s*true/.test(frontmatter);

  return { title, description, body: body.trim(), draft };
}

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<{ title: string; description: string; body: string; sha: string; draft: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/write?slug=${slug}`, {
      headers: { "x-write-password": getPassword() },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.content) {
          const { title, description, body, draft } = parseFrontmatter(d.content);
          setData({ title, description: description || "", body, sha: d.sha ?? "", draft });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      slug={slug}
      sha={data.sha}
      initialDraft={data.draft}
    />
  );
}
