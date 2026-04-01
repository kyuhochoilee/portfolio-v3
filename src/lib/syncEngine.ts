// Background sync engine: push/pull posts between IndexedDB and GitHub
// Uses the same /api/write endpoints and MDX format as the existing system

import {
  type LocalPost,
  openDB,
  getPost,
  getAllPosts,
  savePost,
  markSynced,
  getPendingPosts,
} from "./localStore";

// ── Helpers ────────────────────────────────────────────────────────

export function getPassword(): string {
  return sessionStorage.getItem("write-pw") ?? "";
}

function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── MDX content building ───────────────────────────────────────────

function buildMdxContent(post: LocalPost): string {
  const body = post.blocks
    .map((b) => {
      if (b.type === "image") return b.content ? `![${b.caption || ""}](${b.content})` : "";
      return b.content;
    })
    .filter(Boolean)
    .join("\n\n");

  const postDate = post.date || new Date().toISOString().split("T")[0];
  let frontmatter = `---
title: "${post.title}"
description: "${post.description}"
date: ${postDate}
tags: []`;

  if (post.headerImage && post.headerImage !== "uploading...") {
    frontmatter += `\nimage: "${post.headerImage}"`;
  }
  if (post.isDraft) {
    frontmatter += "\ndraft: true";
  }
  frontmatter += "\n---";

  return `${frontmatter}\n\n${body}`;
}

// ── MDX content parsing ────────────────────────────────────────────

function parseFrontmatter(raw: string): {
  title: string;
  description: string;
  date: string;
  isDraft: boolean;
  headerImage: string;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { title: "", description: "", date: "", isDraft: true, headerImage: "", body: raw };
  }

  const fm = match[1];
  const body = match[2].trim();

  const titleMatch = fm.match(/title:\s*"?([^"\n]*)"?/);
  const descMatch = fm.match(/description:\s*"?([^"\n]*)"?/);
  const dateMatch = fm.match(/date:\s*(\S+)/);
  const imageMatch = fm.match(/image:\s*"?([^"\n]*)"?/);
  const isDraft = /draft:\s*true/.test(fm);

  return {
    title: titleMatch ? titleMatch[1] : "",
    description: descMatch ? descMatch[1] : "",
    date: dateMatch ? dateMatch[1] : "",
    isDraft,
    headerImage: imageMatch ? imageMatch[1] : "",
    body,
  };
}

function parseBodyToBlocks(
  body: string
): { id: string; type: "text" | "image"; content: string; caption?: string }[] {
  const blocks: { id: string; type: "text" | "image"; content: string; caption?: string }[] = [];
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(body)) !== null) {
    const textBefore = body.slice(lastIndex, match.index).trim();
    if (textBefore) {
      blocks.push({ id: newId(), type: "text", content: textBefore });
    }
    blocks.push({ id: newId(), type: "image", content: match[2], caption: match[1] || "" });
    lastIndex = match.index + match[0].length;
  }

  const remaining = body.slice(lastIndex).trim();
  if (remaining) {
    blocks.push({ id: newId(), type: "text", content: remaining });
  }

  if (blocks.length === 0) {
    blocks.push({ id: newId(), type: "text", content: "" });
  }

  return blocks;
}

function parseMdxToPost(slug: string, raw: string, sha: string): LocalPost {
  const { title, description, date, isDraft, headerImage, body } = parseFrontmatter(raw);
  return {
    slug,
    title,
    description,
    blocks: parseBodyToBlocks(body),
    headerImage,
    date,
    isDraft,
    sha,
    lastModified: Date.now(),
    syncStatus: "synced",
  };
}

// ── Push to GitHub ─────────────────────────────────────────────────

export async function syncToGitHub(
  post: LocalPost
): Promise<{ ok: boolean; sha?: string }> {
  const content = buildMdxContent(post);
  const payload: Record<string, string> = { slug: post.slug, content };
  if (post.sha) payload.sha = post.sha;

  try {
    const res = await fetch("/api/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-write-password": getPassword(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return { ok: false };

    const data = await res.json();
    return { ok: true, sha: data.sha };
  } catch {
    // Network error — keep as pending
    return { ok: false };
  }
}

// ── Pull from GitHub ───────────────────────────────────────────────

export async function syncFromGitHub(): Promise<LocalPost[]> {
  try {
    const listRes = await fetch("/api/write", {
      headers: { "x-write-password": getPassword() },
    });

    if (!listRes.ok) return [];

    const { posts } = await listRes.json();
    const remotePosts: LocalPost[] = [];

    for (const entry of posts as { slug: string }[]) {
      const post = await pullPost(entry.slug);
      if (post) remotePosts.push(post);
    }

    return remotePosts;
  } catch {
    return [];
  }
}

// ── Full two-way sync ──────────────────────────────────────────────

export async function syncAll(): Promise<void> {
  // 1. Push all pending local posts to GitHub
  const pending = await getPendingPosts();
  for (const post of pending) {
    const result = await syncToGitHub(post);
    if (result.ok && result.sha) {
      await markSynced(post.slug, result.sha);
    }
    // If push failed (network down etc), leave as pending — will retry next sync
  }

  // 2. Pull all remote posts
  let remotePosts: LocalPost[];
  try {
    remotePosts = await syncFromGitHub();
  } catch {
    // Network error during pull — skip
    return;
  }

  // 3. Merge remote into local
  for (const remote of remotePosts) {
    const local = await getPost(remote.slug);

    if (!local) {
      // Post only exists on GitHub — pull it in
      await saveAndPreserveSync(remote);
      continue;
    }

    if (local.syncStatus === "synced") {
      // Local is synced — if remote SHA differs, remote is newer
      if (local.sha !== remote.sha) {
        await saveAndPreserveSync(remote);
      }
      continue;
    }

    if (local.syncStatus === "pending") {
      // Both modified — compare timestamps, mark loser as conflict
      if (local.sha !== remote.sha) {
        if (remote.lastModified > local.lastModified) {
          // Remote is newer — overwrite local, mark old local as conflict
          const conflictLocal: LocalPost = {
            ...local,
            slug: `${local.slug}-conflict-${Date.now()}`,
            syncStatus: "conflict",
          };
          await savePostRaw(conflictLocal);
          await saveAndPreserveSync(remote);
        } else {
          // Local is newer — keep local as pending, it will be pushed next sync
          // nothing to do
        }
      }
      continue;
    }
  }
}

// ── Pull single post ──────────────────────────────────────────────

export async function pullPost(slug: string): Promise<LocalPost | null> {
  try {
    const res = await fetch(`/api/write?slug=${slug}`, {
      headers: { "x-write-password": getPassword() },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.content) return null;

    return parseMdxToPost(slug, data.content, data.sha ?? "");
  } catch {
    return null;
  }
}

// ── Internal helpers ───────────────────────────────────────────────

/** Save post to IndexedDB without overriding syncStatus to "pending" */
async function saveAndPreserveSync(post: LocalPost): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    const store = tx.objectStore("posts");
    store.put(post);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Save post to IndexedDB as-is, without modifying syncStatus or lastModified */
async function savePostRaw(post: LocalPost): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("posts", "readwrite");
    const store = tx.objectStore("posts");
    store.put(post);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
