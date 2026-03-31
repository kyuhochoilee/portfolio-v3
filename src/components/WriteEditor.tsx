"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutoSave } from "@/hooks/useAutoSave";
import Markdown from "react-markdown";

function getPassword() {
  return sessionStorage.getItem("write-pw") ?? "";
}

interface Block {
  id: string;
  type: "text" | "image";
  content: string; // text content or image URL
  caption?: string;
}

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function WriteEditor({
  initialTitle = "",
  initialDescription = "",
  initialBody = "",
  initialHeaderImage = "",
  slug: existingSlug,
  sha,
  initialDraft = true,
}: {
  initialTitle?: string;
  initialDescription?: string;
  initialBody?: string;
  initialHeaderImage?: string;
  slug?: string;
  sha?: string;
  initialDraft?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (initialBody) {
      // Parse existing body into blocks using matchAll for robustness
      const parsed: Block[] = [];
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = imageRegex.exec(initialBody)) !== null) {
        // Text before this image
        const textBefore = initialBody.slice(lastIndex, match.index).trim();
        if (textBefore) {
          parsed.push({ id: newId(), type: "text", content: textBefore });
        }
        // The image itself
        parsed.push({ id: newId(), type: "image", content: match[2], caption: match[1] || "" });
        lastIndex = match.index + match[0].length;
      }

      // Text after the last image (or the entire body if no images)
      const remaining = initialBody.slice(lastIndex).trim();
      if (remaining) {
        parsed.push({ id: newId(), type: "text", content: remaining });
      }

      if (parsed.length === 0) parsed.push({ id: newId(), type: "text", content: "" });
      return parsed;
    }
    return [{ id: newId(), type: "text", content: "" }];
  });

  const [headerImage, setHeaderImage] = useState(initialHeaderImage);
  const [isDraft, setIsDraft] = useState(initialDraft);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [date] = useState(() => existingSlug ? "" : new Date().toISOString().split("T")[0]);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const headerFileRef = useRef<HTMLInputElement>(null);

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => { autoResize(titleRef.current); }, [title, autoResize]);

  // Build the full MDX content
  const buildContent = useCallback((draft: boolean) => {
    const body = blocks
      .map((b) => {
        if (b.type === "image") return b.content ? `![${b.caption || ""}](${b.content})` : "";
        return b.content;
      })
      .filter(Boolean)
      .join("\n\n");

    const postDate = date || new Date().toISOString().split("T")[0];
    return `---
title: "${title}"
description: "${description}"
date: ${postDate}
tags: []${headerImage && headerImage !== "uploading..." ? `\nimage: "${headerImage}"` : ""}${draft ? "\ndraft: true" : ""}
---

${body}`;
  }, [title, description, blocks, headerImage, date]);

  // Auto-save hook
  const { status: draftStatus, markChanged, saveNow, deletePost } = useAutoSave({
    existingSlug,
    initialSha: sha,
    buildContent,
    title,
  });

  // Mark changes for auto-save
  useEffect(() => { markChanged(); }, [title, blocks, headerImage, markChanged]);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addBlock = (type: "text" | "image", afterId?: string) => {
    const block: Block = { id: newId(), type, content: "", caption: "" };
    if (afterId) {
      setBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === afterId);
        const next = [...prev];
        next.splice(idx + 1, 0, block);
        return next;
      });
    } else {
      setBlocks((prev) => [...prev, block]);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const ok = await saveNow(false);
    if (ok) {
      setIsDraft(false);
      setSaved(true);
      setTimeout(() => router.push("/write"), 1000);
    }
    setSaving(false);
  };

  const handleUnpublish = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const ok = await saveNow(true);
    if (ok) {
      setIsDraft(true);
    }
    setSaving(false);
  };

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
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/write")}
            className="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
          >
            &larr; back
          </button>
          <div className="flex items-center gap-3">
            {existingSlug && (
              <button
                onClick={async () => {
                  if (!confirm("delete this post?")) return;
                  const ok = await deletePost();
                  if (ok) router.push("/write");
                }}
                className="text-sm text-muted hover:text-[red] transition-colors cursor-pointer"
              >
                delete
              </button>
            )}
            <button
              onClick={() => setPreview(!preview)}
              className="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
            >
              {preview ? "edit" : "preview"}
            </button>
            {!isDraft && (
              <button
                onClick={handleUnpublish}
                disabled={saving}
                className="text-sm text-muted hover:text-fg transition-colors cursor-pointer disabled:opacity-30"
              >
                unpublish
              </button>
            )}
            <button
              onClick={handlePublish}
              disabled={saving || !title.trim()}
              className="text-sm cursor-pointer transition-colors disabled:opacity-30 px-3 py-1 rounded-full"
              style={{
                background: saved ? "var(--color-purple)" : "var(--color-orange)",
                color: "var(--color-bg)",
              }}
            >
              {saved ? "published ✓" : saving ? "publishing..." : "publish"}
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="text-muted">{date || "new"}</span>
          <span
            className="px-1.5 py-0.5 rounded-full"
            style={{
              fontSize: "10px",
              background: isDraft
                ? "color-mix(in srgb, var(--color-purple) 15%, transparent)"
                : "color-mix(in srgb, var(--color-orange) 15%, transparent)",
              color: isDraft ? "var(--color-purple)" : "var(--color-orange)",
            }}
          >
            {isDraft ? "draft" : "published"}
          </span>
          {draftStatus && (
            <span
              style={{
                color: draftStatus === "failed" || draftStatus === "retrying..."
                  ? "var(--color-orange)"
                  : "var(--color-muted)",
                transition: "color 0.2s",
              }}
            >
              {draftStatus === "saving..." && "saving..."}
              {draftStatus === "saved" && "✓ saved"}
              {draftStatus === "failed" && "✗ save failed"}
              {draftStatus === "retrying..." && "retrying..."}
            </span>
          )}
        </div>

        {preview ? (
          /* ====== PREVIEW MODE — matches prose styles exactly ====== */
          <div>
            {/* Header image */}
            {headerImage && headerImage !== "uploading..." && (
              <div className="relative aspect-[16/10] mb-6 overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
                <img
                  src={headerImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1
              className="text-fg mb-2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: "var(--leading-tight)",
              }}
            >
              {title || "untitled"}
            </h1>

            {/* Subtitle */}
            {description && (
              <p
                className="text-muted mb-6"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-base)",
                }}
              >
                {description}
              </p>
            )}

            {/* Body — rendered as prose using react-markdown */}
            <div className="prose">
              <Markdown>
                {blocks
                  .map((b) => {
                    if (b.type === "image" && b.content) {
                      return `![${b.caption || ""}](${b.content})`;
                    }
                    return b.content;
                  })
                  .filter(Boolean)
                  .join("\n\n")}
              </Markdown>
            </div>
          </div>
        ) : (
          /* ====== EDIT MODE ====== */
          <div>
            {/* Header image */}
            {headerImage ? (
              <div className="relative mb-4 rounded-lg overflow-hidden aspect-[16/10]" style={{ border: "1px solid var(--color-border)" }}>
                {headerImage === "uploading..." ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">uploading...</div>
                ) : (
                  <img src={headerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <button
                  onClick={() => setHeaderImage("")}
                  className="absolute top-2 right-2 text-xs text-muted hover:text-fg cursor-pointer rounded-full w-6 h-6 flex items-center justify-center"
                  style={{ background: "color-mix(in srgb, var(--color-surface) 80%, transparent)", backdropFilter: "blur(4px)" }}
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => headerFileRef.current?.click()}
                className="w-full mb-4 py-6 flex items-center justify-center gap-2 rounded-lg text-muted hover:text-fg transition-colors cursor-pointer"
                style={{ border: "1px dashed var(--color-border)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="8" cy="8" r="2" fill="currentColor" />
                  <path d="M2 16L8 10L14 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="text-xs">add header image</span>
              </button>
            )}
            <input
              ref={headerFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setHeaderImage("uploading...");
                const form = new FormData();
                form.append("file", file);
                form.append("header", "true");
                try {
                  const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "x-write-password": getPassword() },
                    body: form,
                  });
                  const data = await res.json();
                  if (data.url) setHeaderImage(data.url);
                  else setHeaderImage("");
                } catch {
                  setHeaderImage("");
                }
              }}
            />

            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title"
              rows={1}
              className="w-full bg-transparent text-fg text-2xl outline-none resize-none mb-1 placeholder:text-border"
              style={{ letterSpacing: "-0.03em", lineHeight: "1.2" }}
            />

            {/* Subtitle / description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="add a subtitle..."
              rows={1}
              className="w-full bg-transparent text-muted text-sm outline-none resize-none mb-4 placeholder:text-border"
              style={{ lineHeight: "1.4" }}
              ref={(el) => { if (el) autoResize(el); }}
            />

            <div className="h-px mb-4" style={{ background: "var(--color-border)" }} />

            {/* Blocks */}
            <DragList
              blocks={blocks}
              setBlocks={setBlocks}
              renderBlock={(block, idx, isLast) => (
                <>
                  {block.type === "text" ? (
                    <TextBlock
                      block={block}
                      onChange={(content) => updateBlock(block.id, { content })}
                      onEnter={(before, after) => {
                        const newBlock: Block = { id: newId(), type: "text", content: after };
                        setBlocks((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], content: before };
                          next.splice(idx + 1, 0, newBlock);
                          return next;
                        });
                        setTimeout(() => {
                          const els = document.querySelectorAll<HTMLTextAreaElement>("[data-block-text]");
                          const newEl = els[idx + 1];
                          if (newEl) {
                            newEl.focus();
                            newEl.selectionStart = 0;
                            newEl.selectionEnd = 0;
                          }
                        }, 10);
                      }}
                      onBackspaceEmpty={() => {
                        if (blocks.length <= 1) return;
                        removeBlock(block.id);
                        setTimeout(() => {
                          const els = document.querySelectorAll<HTMLTextAreaElement>("[data-block-text]");
                          const prev = Math.max(0, idx - 1);
                          els[prev]?.focus();
                        }, 10);
                      }}
                      autoResize={autoResize}
                    />
                  ) : (
                    <ImageBlock
                      block={block}
                      onChange={(updates) => updateBlock(block.id, updates)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  )}

                  {/* Add text/image — only on last block */}
                  {isLast && (
                    <div className="mt-2 flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => addBlock("text", block.id)}
                        className="text-xs text-muted hover:text-fg transition-colors cursor-pointer"
                      >
                        + text
                      </button>
                      <button
                        onClick={() => addBlock("image", block.id)}
                        className="text-xs transition-colors cursor-pointer"
                        style={{ color: "var(--color-purple)" }}
                      >
                        + image
                      </button>
                    </div>
                  )}
                </>
              )}
            />

            {/* Add first block if empty */}
            {blocks.length === 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => addBlock("text")}
                  className="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
                >
                  + text
                </button>
                <button
                  onClick={() => addBlock("image")}
                  className="text-sm transition-colors cursor-pointer"
                  style={{ color: "var(--color-purple)" }}
                >
                  + image
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== DRAG LIST ====== */
function DragList({
  blocks,
  setBlocks,
  renderBlock,
}: {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  renderBlock: (block: Block, idx: number, isLast: boolean) => React.ReactNode;
}) {
  const dragState = useRef<{
    id: string;
    startY: number;
    pointerId: number;
    rects: Map<string, DOMRect>;
  } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Blur any focused textarea
    (document.activeElement as HTMLElement)?.blur();

    const rects = new Map<string, DOMRect>();
    containerRef.current?.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) => {
      const bid = el.getAttribute("data-block-id");
      if (bid) rects.set(bid, el.getBoundingClientRect());
    });

    dragState.current = { id, startY: e.clientY, pointerId: e.pointerId, rects };
    setDragId(id);
    setDragY(0);
    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    setDragY(e.clientY - dragState.current.startY);
  }, []);

  const onPointerUp = useCallback(() => {
    const ds = dragState.current;
    if (!ds) return;

    const dragRect = ds.rects.get(ds.id);
    if (dragRect) {
      const dragCenter = dragRect.top + dragRect.height / 2 + dragY;
      const fromIdx = blocks.findIndex((b) => b.id === ds.id);
      let targetIdx = fromIdx;

      // Walk through blocks in order, find where drag center falls
      const sortedEntries = blocks.map((b) => ({
        id: b.id,
        center: (ds.rects.get(b.id)?.top ?? 0) + (ds.rects.get(b.id)?.height ?? 0) / 2,
      }));

      for (let i = 0; i < sortedEntries.length; i++) {
        if (sortedEntries[i].id === ds.id) continue;
        if (dragCenter < sortedEntries[i].center) {
          targetIdx = i;
          if (i > fromIdx) targetIdx--;
          break;
        }
        targetIdx = i;
        if (i < fromIdx) targetIdx++;
      }

      if (fromIdx !== targetIdx) {
        setBlocks((prev) => {
          const next = [...prev];
          const [moved] = next.splice(fromIdx, 1);
          next.splice(targetIdx, 0, moved);
          return next;
        });
      }
    }

    dragState.current = null;
    setDragId(null);
    setDragY(0);
  }, [blocks, dragY, setBlocks]);

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ touchAction: dragId ? "none" : "auto" }}
    >
      {blocks.map((block, idx) => {
        const isDragging = dragId === block.id;
        return (
          <div
            key={block.id}
            data-block-id={block.id}
            className="group relative"
            style={{
              marginBottom: block.type === "image" ? "0.75rem" : "0.125rem",
              transform: isDragging ? `translateY(${dragY}px)` : "translateY(0)",
              transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: isDragging ? 50 : 1,
              opacity: isDragging ? 0.85 : 1,
              cursor: isDragging ? "grabbing" : undefined,
            }}
          >
            {/* Drag handle — always visible on mobile, hover on desktop */}
            <div
              className="absolute -left-6 top-0 bottom-0 w-6 flex items-start pt-1 justify-center opacity-40 md:opacity-0 md:group-hover:opacity-40 cursor-grab select-none touch-none"
              onPointerDown={(e) => startDrag(e, block.id)}
            >
              <span className="text-muted text-xs">⠿</span>
            </div>

            {renderBlock(block, idx, idx === blocks.length - 1)}
          </div>
        );
      })}
    </div>
  );
}

/* ====== TEXT BLOCK ====== */
function TextBlock({
  block,
  onChange,
  onEnter,
  onBackspaceEmpty,
  autoResize,
}: {
  block: Block;
  onChange: (content: string) => void;
  onEnter: (before: string, after: string) => void;
  onBackspaceEmpty: () => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { autoResize(ref.current); }, [block.content, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const el = ref.current;
      const pos = el?.selectionStart ?? block.content.length;
      const before = block.content.slice(0, pos);
      const after = block.content.slice(pos);
      onEnter(before, after);
    }
    if (e.key === "Backspace" && block.content === "") {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  // Detect markdown formatting — only apply if block is a single line
  const c = block.content;
  const singleLine = !c.includes("\n");
  const h1 = singleLine && /^# /.test(c);
  const h2 = singleLine && /^## /.test(c);
  const h3 = singleLine && /^### /.test(c);
  const isList = /^[-*] /.test(c);
  const isNumbered = /^\d+\. /.test(c);
  const isQuote = /^> /.test(c);
  const isCode = /^```/.test(c);
  const isHr = singleLine && /^---\s*$/.test(c);

  let blockStyle: React.CSSProperties = {
    fontSize: "var(--text-base)",
    lineHeight: "var(--leading-relaxed)",
    minHeight: "1.7rem",
  };

  let wrapperStyle: React.CSSProperties = {};

  if (h3) {
    blockStyle = { ...blockStyle, fontSize: "var(--text-lg)", fontWeight: 600, lineHeight: "1.3" };
  } else if (h2) {
    blockStyle = { ...blockStyle, fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: "1.3" };
  } else if (h1) {
    blockStyle = { ...blockStyle, fontSize: "var(--text-2xl)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: "1.2" };
  } else if (isQuote) {
    wrapperStyle = { borderLeft: "2px solid var(--color-purple)", paddingLeft: "1rem" };
    blockStyle = { ...blockStyle, color: "var(--color-muted)", fontStyle: "italic" };
  } else if (isList || isNumbered) {
    wrapperStyle = { paddingLeft: "1rem" };
  } else if (isCode) {
    blockStyle = { ...blockStyle, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", background: "var(--color-surface)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" };
  } else if (isHr) {
    blockStyle = { ...blockStyle, textAlign: "center" as const, color: "var(--color-border)" };
  }

  return (
    <div style={wrapperStyle}>
      <textarea
        ref={ref}
        data-block-text
        value={block.content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="start writing..."
        rows={1}
        className="w-full bg-transparent text-fg outline-none resize-none placeholder:text-border"
        style={blockStyle}
      />
    </div>
  );
}

/* ====== IMAGE BLOCK ====== */
function ImageBlock({
  block,
  onChange,
  onRemove,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-write-password": getPassword() },
        body: form,
      });
      const data = await res.json();
      if (data.url) onChange({ content: data.url });
    } catch { /* silent */ }
    setUploading(false);
  };

  return (
    <div
      className="relative border rounded-lg overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {block.content ? (
        <>
          <img src={block.content} alt={block.caption || ""} className="w-full block" />
          <div className="p-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <input
              type="text"
              value={block.caption || ""}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="add a caption..."
              className="w-full bg-transparent text-muted text-xs outline-none placeholder:text-border"
            />
          </div>
        </>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-12 flex flex-col items-center gap-2 text-muted hover:text-fg transition-colors cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-xs">{uploading ? "uploading..." : "add image"}</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-xs text-muted hover:text-fg transition-colors cursor-pointer bg-surface/80 rounded-full w-6 h-6 flex items-center justify-center"
        style={{ backdropFilter: "blur(4px)" }}
      >
        ×
      </button>
    </div>
  );
}
