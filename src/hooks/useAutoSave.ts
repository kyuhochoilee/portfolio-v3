import { useEffect, useRef, useState, useCallback } from "react";

function getPassword() {
  return localStorage.getItem("write-pw") ?? "";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface AutoSaveOptions {
  existingSlug?: string;
  initialSha?: string;
  buildContent: (isDraft: boolean) => string;
  title: string;
  intervalMs?: number;
}

export function useAutoSave({
  existingSlug,
  initialSha,
  buildContent,
  title,
  intervalMs = 4000,
}: AutoSaveOptions) {
  const shaRef = useRef(initialSha || "");
  const slugRef = useRef(existingSlug || "");
  const changeCounter = useRef(0);
  const pausedRef = useRef(false);
  const [status, setStatus] = useState("");

  const markChanged = useCallback(() => {
    changeCounter.current++;
  }, []);

  const getSha = useCallback(() => shaRef.current, []);
  const getSlug = useCallback(() => slugRef.current, []);

  // Save immediately (for publish/unpublish)
  const saveNow = useCallback(async (isDraft: boolean): Promise<boolean> => {
    // Pause auto-save so it doesn't overwrite this save with draft: true
    pausedRef.current = true;
    changeCounter.current = 0;

    const slug = slugRef.current || slugify(title);
    slugRef.current = slug;
    const payload: Record<string, string> = { slug, content: buildContent(isDraft) };
    if (shaRef.current) payload.sha = shaRef.current;

    try {
      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-write-password": getPassword() },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sha) shaRef.current = data.sha;
        // Reset change counter again so auto-save doesn't immediately re-save
        changeCounter.current = 0;
        pausedRef.current = false;
        return true;
      }
    } catch { /* silent */ }
    pausedRef.current = false;
    return false;
  }, [title, buildContent]);

  const deletePost = useCallback(async (): Promise<boolean> => {
    const slug = existingSlug || slugRef.current;
    const sha = shaRef.current;
    if (!slug || !sha) return false;

    try {
      const res = await fetch("/api/write", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-write-password": getPassword() },
        body: JSON.stringify({ slug, sha }),
      });
      return res.ok;
    } catch { return false; }
  }, [existingSlug]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (pausedRef.current) return;
      if (changeCounter.current === 0) return;
      if (!title.trim()) return;
      changeCounter.current = 0;

      const slug = slugRef.current || slugify(title);
      slugRef.current = slug;
      setStatus("saving...");

      try {
        const payload: Record<string, string> = { slug, content: buildContent(true) };
        if (shaRef.current) payload.sha = shaRef.current;
        const res = await fetch("/api/write", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-write-password": getPassword() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sha) shaRef.current = data.sha;
          setStatus("saved");
        } else if (res.status === 422 && !shaRef.current) {
          const getRes = await fetch(`/api/write?slug=${slug}`, {
            headers: { "x-write-password": getPassword() },
          });
          if (getRes.ok) {
            const getData = await getRes.json();
            if (getData.sha) shaRef.current = getData.sha;
          }
          setStatus("retrying...");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }

      setTimeout(() => setStatus(""), 3000);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [title, buildContent, intervalMs]);

  return { status, markChanged, saveNow, deletePost, getSha, getSlug };
}
