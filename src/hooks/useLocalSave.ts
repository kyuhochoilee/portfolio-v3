import { useEffect, useRef, useState, useCallback } from "react";

// Inline IndexedDB helpers (no external deps)
const DB_NAME = "write-posts";
const STORE_NAME = "posts";
const DB_VERSION = 1;

interface LocalPost {
  slug: string;
  title: string;
  description: string;
  blocks: { id: string; type: "text" | "image"; content: string; caption?: string }[];
  headerImage: string;
  date: string;
  isDraft: boolean;
  sha: string;
  lastModified: number;
  syncStatus: "synced" | "pending" | "conflict";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "slug" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSave(post: LocalPost): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(post);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(slug: string): Promise<LocalPost | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(slug);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(slug: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(slug);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function getPassword() {
  return sessionStorage.getItem("write-pw") ?? "";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface LocalSaveOptions {
  existingSlug?: string;
  initialSha?: string;
  initialDraft?: boolean;
  title: string;
  description: string;
  blocks: { id: string; type: "text" | "image"; content: string; caption?: string }[];
  headerImage: string;
  date: string;
  buildContent: (isDraft: boolean) => string;
  syncIntervalMs?: number;
}

export function useLocalSave({
  existingSlug,
  initialSha,
  initialDraft = true,
  title,
  description,
  blocks,
  headerImage,
  date,
  buildContent,
  syncIntervalMs = 8000,
}: LocalSaveOptions) {
  const slugRef = useRef(existingSlug || "");
  const shaRef = useRef(initialSha || "");
  const [status, setStatus] = useState("");
  const [syncStatus, setSyncStatus] = useState<"synced" | "pending" | "offline">("synced");
  const changeCounter = useRef(0);
  const pausedRef = useRef(false);

  const markChanged = useCallback(() => {
    changeCounter.current++;
  }, []);

  // Save to IndexedDB instantly
  const saveLocal = useCallback(async (isDraft: boolean) => {
    const slug = slugRef.current || slugify(title);
    if (!slug || !title.trim()) return;
    slugRef.current = slug;

    const post: LocalPost = {
      slug,
      title,
      description,
      blocks,
      headerImage,
      date: date || new Date().toISOString().split("T")[0],
      isDraft,
      sha: shaRef.current,
      lastModified: Date.now(),
      syncStatus: "pending",
    };

    try {
      await idbSave(post);
      setStatus("saved locally");
      setSyncStatus("pending");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("local save failed");
    }
  }, [title, description, blocks, headerImage, date]);

  // Auto-save locally on changes (instant, no network)
  useEffect(() => {
    if (changeCounter.current === 0) return;
    changeCounter.current = 0;
    saveLocal(true);
  });

  // Sync pending posts to GitHub in background
  useEffect(() => {
    const interval = setInterval(async () => {
      if (pausedRef.current) return;
      const slug = slugRef.current;
      if (!slug) return;

      const post = await idbGet(slug);
      if (!post || post.syncStatus !== "pending") return;

      setSyncStatus("pending");
      setStatus("syncing...");

      try {
        const content = buildContent(post.isDraft);
        const payload: Record<string, string> = { slug, content };
        if (shaRef.current) payload.sha = shaRef.current;

        const res = await fetch("/api/write", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-write-password": getPassword() },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sha) shaRef.current = data.sha;
          // Mark as synced in IndexedDB
          const updated = await idbGet(slug);
          if (updated) {
            updated.sha = data.sha;
            updated.syncStatus = "synced";
            await idbSave(updated);
          }
          setSyncStatus("synced");
          setStatus("synced");
        } else if (res.status === 422 && !shaRef.current) {
          // File exists on GitHub but we don't have SHA
          const getRes = await fetch(`/api/write?slug=${slug}`, {
            headers: { "x-write-password": getPassword() },
          });
          if (getRes.ok) {
            const getData = await getRes.json();
            if (getData.sha) shaRef.current = getData.sha;
          }
          setStatus("retrying...");
        } else {
          setStatus("sync failed");
        }
      } catch {
        setSyncStatus("offline");
        setStatus("offline — saved locally");
      }

      setTimeout(() => setStatus(""), 3000);
    }, syncIntervalMs);

    return () => clearInterval(interval);
  }, [buildContent, syncIntervalMs]);

  // Publish — save locally as published, then sync immediately
  const saveNow = useCallback(async (isDraft: boolean): Promise<boolean> => {
    pausedRef.current = true;
    const slug = slugRef.current || slugify(title);
    slugRef.current = slug;

    // Save locally first (instant)
    await saveLocal(isDraft);

    // Then sync to GitHub
    try {
      const content = buildContent(isDraft);
      const payload: Record<string, string> = { slug, content };
      if (shaRef.current) payload.sha = shaRef.current;

      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-write-password": getPassword() },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.sha) shaRef.current = data.sha;
        const updated = await idbGet(slug);
        if (updated) {
          updated.sha = data.sha;
          updated.isDraft = isDraft;
          updated.syncStatus = "synced";
          await idbSave(updated);
        }
        setSyncStatus("synced");
        changeCounter.current = 0;
        pausedRef.current = false;
        return true;
      }
    } catch { /* offline — local save already succeeded */ }

    pausedRef.current = false;
    return false;
  }, [title, buildContent, saveLocal]);

  // Delete — remove locally and from GitHub
  const deletePost = useCallback(async (): Promise<boolean> => {
    const slug = existingSlug || slugRef.current;
    if (!slug) return false;

    // Delete locally first
    await idbDelete(slug);

    // Then delete from GitHub
    const sha = shaRef.current;
    if (!sha) return true; // never synced, local delete is enough

    try {
      const res = await fetch("/api/write", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-write-password": getPassword() },
        body: JSON.stringify({ slug, sha }),
      });
      return res.ok;
    } catch {
      return true; // local delete succeeded, GitHub delete will happen eventually
    }
  }, [existingSlug]);

  return { status, syncStatus, markChanged, saveNow, deletePost };
}

// Export for use in the write list page
export { openDB, idbGet, idbDelete, type LocalPost };

export async function getAllLocalPosts(): Promise<LocalPost[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const posts = req.result as LocalPost[];
        posts.sort((a, b) => b.lastModified - a.lastModified);
        resolve(posts);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}
