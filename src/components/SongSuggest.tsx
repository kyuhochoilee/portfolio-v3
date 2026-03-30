"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  uri: string;
}

type Phase = "closed" | "search" | "collapse" | "card" | "crossfade" | "ascii" | "rise" | "done" | "fadeout";

const GLYPHS = ["#", "+", "x", "*", "%", "@", "=", "~", "/", "\\", "|", "-", ":", "&"];
const CARD_SZ = 160;
const GRID = 10;
const CELL = CARD_SZ / GRID;
const FALLBACK_COLORS = [
  "rgb(255, 210, 100)", "rgb(255, 170, 80)", "rgb(255, 140, 120)",
  "rgb(255, 180, 140)", "rgb(255, 220, 130)",
];
const RISE_STEPS = 14;
const RISE_STEP_PX = 55;
const RISE_INTERVAL = 65;

function noise(x: number, y: number, t: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + t * 53.3) * 43758.5453;
  return n - Math.floor(n);
}
function snoise(x: number, y: number, t: number) {
  return noise(x, y, t) * 2 - 1;
}

// Extract dominant colors from an image URL
function extractColors(url: string, count: number = 5): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const sz = 50; // sample at low res
      canvas.width = sz;
      canvas.height = sz;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(FALLBACK_COLORS); return; }
      ctx.drawImage(img, 0, 0, sz, sz);
      const data = ctx.getImageData(0, 0, sz, sz).data;

      // Sample colors from a grid of points, pick the most vibrant
      const samples: [number, number, number][] = [];
      const step = Math.floor(sz / 7);
      for (let y = step; y < sz; y += step) {
        for (let x = step; x < sz; x += step) {
          const i = (y * sz + x) * 4;
          samples.push([data[i], data[i + 1], data[i + 2]]);
        }
      }

      // Sort by saturation (most colorful first)
      samples.sort((a, b) => {
        const satA = Math.max(...a) - Math.min(...a);
        const satB = Math.max(...b) - Math.min(...b);
        return satB - satA;
      });

      // Pick spread-out colors (avoid near-duplicates)
      const picked: string[] = [];
      for (const [r, g, b] of samples) {
        if (picked.length >= count) break;
        const isDupe = picked.some((c) => {
          const m = c.match(/\d+/g)!.map(Number);
          return Math.abs(m[0] - r) + Math.abs(m[1] - g) + Math.abs(m[2] - b) < 80;
        });
        if (!isDupe) picked.push(`rgb(${r}, ${g}, ${b})`);
      }

      // Fill remaining slots if needed
      while (picked.length < count) {
        picked.push(samples[picked.length % samples.length]
          ? `rgb(${samples[picked.length % samples.length].join(", ")})`
          : FALLBACK_COLORS[picked.length % FALLBACK_COLORS.length]);
      }

      resolve(picked);
    };
    img.onerror = () => resolve(FALLBACK_COLORS);
    img.src = url;
  });
}

function FlapText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = text;
    let tick = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function step() {
      tick++;
      let result = "";
      let done = true;
      for (let i = 0; i < target.length; i++) {
        const resolveAt = 3 + i * 1.5;
        if (target[i] === " ") {
          result += " ";
        } else if (tick >= resolveAt) {
          result += target[i];
        } else {
          done = false;
          result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el!.textContent = result;
      if (!done) {
        const progress = tick / (3 + target.length * 1.5);
        const delay = 40 + progress * progress * 80;
        timer = setTimeout(step, delay);
      }
    }

    timer = setTimeout(step, 30);
    return () => { if (timer) clearTimeout(timer); };
  }, [text]);

  return (
    <p
      ref={ref}
      className="absolute text-fg text-center"
      style={{
        fontFamily: '"GT Alpina Typewriter Trial", serif',
        fontSize: "var(--text-sm)",
      }}
    />
  );
}

export default function SongSuggest({ showArrow = false }: { showArrow?: boolean } = {}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [selected, setSelected] = useState<Track | null>(null);
  const [searching, setSearching] = useState(false);
  const [tick, setTick] = useState(0);
  const [colors, setColors] = useState<string[]>(FALLBACK_COLORS);
  const [resultMsg, setResultMsg] = useState("added! thanks for the rec");
  const [riseStep, setRiseStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const riseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "search") setTimeout(() => inputRef.current?.focus(), 100);

    if (["crossfade", "ascii", "rise"].includes(phase)) {
      tickRef.current = setInterval(() => setTick((t) => t + 1), 100);
    } else {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    }

    if (phase === "rise") {
      setRiseStep(0);
      let step = 0;
      riseRef.current = setInterval(() => {
        step++;
        setRiseStep(step);
        setTick((t) => t + 1);
        if (step >= RISE_STEPS && riseRef.current) clearInterval(riseRef.current);
      }, RISE_INTERVAL);
    } else {
      if (riseRef.current) { clearInterval(riseRef.current); riseRef.current = null; }
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (riseRef.current) clearInterval(riseRef.current);
    };
  }, [phase]);

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
        setResults(await res.json());
      } catch { setResults([]); }
      setSearching(false);
    }, 300);
  }, []);

  const handleSelect = async (track: Track) => {
    setSelected(track);

    // Extract colors from album art
    if (track.albumArt) {
      extractColors(track.albumArt, 5).then(setColors);
    }

    // Fire API — set result message based on response, but animation always plays
    setResultMsg("added! thanks for the rec");
    fetch("/api/spotify/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uri: track.uri }),
    })
      .then(async (res) => {
        if (res.status === 409) setResultMsg("already on the playlist! great taste");
        else if (res.status === 429) setResultMsg("slow down! try again later");
        else if (!res.ok) setResultMsg("couldn't add right now, but noted!");
      })
      .catch(() => setResultMsg("couldn't add right now, but noted!"));

    setPhase("collapse");
    setTimeout(() => setPhase("card"), 600);
    setTimeout(() => setPhase("crossfade"), 1500);
    setTimeout(() => setPhase("ascii"), 2300);
    setTimeout(() => setPhase("rise"), 2900);
    const riseEnd = 2900 + RISE_STEPS * RISE_INTERVAL + 200;
    setTimeout(() => setPhase("done"), riseEnd);
    setTimeout(() => setPhase("fadeout"), riseEnd + 3500);
    setTimeout(() => {
      setPhase("closed"); setQuery(""); setResults([]); setSelected(null); setColors(FALLBACK_COLORS);
    }, riseEnd + 4200);
  };

  const handleClose = () => { setPhase("closed"); setQuery(""); setResults([]); };

  if (phase === "closed") {
    return (
      <button
        onClick={() => setPhase("search")}
        className="text-muted hover:text-fg transition-colors cursor-pointer shrink-0"
        style={{ fontFamily: '"GT Alpina Typewriter Trial", serif', fontSize: "var(--text-sm)" }}
      >
        send me a song{showArrow && <> &rarr;</>}
      </button>
    );
  }

  const isCollapsed = !["closed", "search"].includes(phase);
  const showAscii = ["crossfade", "ascii", "rise"].includes(phase);
  const cardDissolved = ["rise", "done", "fadeout"].includes(phase);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "color-mix(in srgb, var(--color-bg) 80%, transparent)",
        backdropFilter: "blur(8px)",
        opacity: phase === "fadeout" ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && phase === "search") handleClose(); }}
    >
      {/* One single container that morphs from search panel → card → dissolves */}
      <div
        className="border border-border flex flex-col items-center"
        style={{
          fontFamily: '"GT Alpina Typewriter Trial", serif',
          fontSize: "var(--text-sm)",
          background: cardDissolved ? "transparent" : "var(--color-surface)",
          borderColor: cardDissolved ? "transparent" : undefined,
          width: isCollapsed ? CARD_SZ + 20 : "min(calc(100% - 2rem), 28rem)",
          maxHeight: isCollapsed ? CARD_SZ + 80 : "min(calc(100dvh - 4rem), 400px)",
          overflow: isCollapsed ? "visible" : "hidden",
          borderRadius: "var(--radius-lg)",
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease, border-color 0.4s ease, border-radius 0.4s ease",
          ...(phase === "search" ? { animation: "suggestModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" } : {}),
        }}
      >
        {/* Search content — fades out during collapse */}
        <div
          style={{
            width: "100%",
            opacity: isCollapsed ? 0 : 1,
            maxHeight: isCollapsed ? 0 : 400,
            overflow: "hidden",
            transition: "opacity 0.25s ease, max-height 0.4s ease",
            pointerEvents: isCollapsed ? "none" : "auto",
          }}
        >
          <div className="p-4 border-b border-border flex items-center gap-3">
            <span className="text-muted">&#9835;</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="search for a song..."
              className="flex-1 bg-transparent outline-none text-fg placeholder:text-muted"
              value={query}
              onChange={(e) => { setQuery(e.target.value); doSearch(e.target.value); }}
            />
            <button onClick={handleClose} className="text-muted hover:text-fg cursor-pointer">&#x2715;</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {searching && <div className="p-4 text-muted text-center">searching...</div>}
            {!searching && results.length === 0 && query.trim() && (
              <div className="p-4 text-muted text-center">no results</div>
            )}
            {results.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-3 p-3 hover:bg-border/50 transition-colors text-left cursor-pointer"
              >
                {track.albumArt && <img src={track.albumArt} alt="" className="w-10 h-10" />}
                <div className="flex-1 min-w-0">
                  <div className="text-fg truncate">{track.title.toLowerCase()}</div>
                  <div className="text-muted text-xs truncate">{track.artist.toLowerCase()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Card content — fades in as panel collapses */}
        {isCollapsed && selected && (
          <div className="flex flex-col items-center" style={{ padding: "10px 10px 0" }}>
            {/* Art + ASCII layer */}
            <div className="relative overflow-hidden" style={{ width: CARD_SZ, height: CARD_SZ, marginTop: 2, borderRadius: "calc(var(--radius-lg) / 2)" }}>
              {/* Album art */}
              <img
                src={selected.albumArt}
                alt=""
                style={{
                  width: CARD_SZ,
                  height: CARD_SZ,
                  display: "block",
                  opacity: phase === "collapse" ? 0 : cardDissolved ? 0 : phase === "crossfade" ? 0.3 : 1,
                  transform: phase === "collapse"
                    ? "scale(0.92) translateY(6px)"
                    : "scale(1) translateY(0)",
                  transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s",
                }}
              />

              {/* ASCII overlay */}
              {showAscii && (
                <div
                  style={{
                    position: "absolute", left: 0, top: 0,
                    width: CARD_SZ, height: CARD_SZ,
                    opacity: phase === "crossfade" ? 0.7 : 1,
                    transition: "opacity 0.6s ease",
                  }}
                >
                  {Array.from({ length: GRID * GRID }, (_, i) => {
                    const col = i % GRID;
                    const row = Math.floor(i / GRID);
                    // Use noise-based glyph selection so each cell is independent
                    const glyphIdx = Math.floor(noise(col * 17, row * 31, tick * 0.7) * GLYPHS.length);
                    const ch = GLYPHS[glyphIdx % GLYPHS.length];
                    const color = colors[Math.floor(noise(col * 11, row * 23, tick * 0.3) * colors.length) % colors.length];
                    const centerCol = (GRID - 1) / 2;
                    const rowFactor = 1 - row / GRID; // 1 at top, 0 at bottom
                    const distFromCenter = Math.abs(col - centerCol) / centerCol;
                    const t = riseStep;

                    let xPos: number, yPos: number, pOpacity: number;

                    if (phase === "rise") {
                      const progress = t / RISE_STEPS;

                      // Vertical rise — top goes fast
                      const baseRise = t * RISE_STEP_PX * (0.15 + rowFactor * 0.85);
                      const yWobble = snoise(col, row, t) * 14 * (0.3 + distFromCenter * 0.7);
                      yPos = row * CELL + CELL / 2 - baseRise + yWobble;

                      // Taper: top rows pinch tight, bottom rows stay wide (flame shape)
                      const taperAmount = 0.2 + rowFactor * 0.7; // top pinches more
                      const pinch = 1 - progress * taperAmount;
                      const xWobble = snoise(col * 3 + t, row * 5, t * 1.5) * CELL * 1.5 * progress;
                      xPos = CARD_SZ / 2 + (col - centerCol) * CELL * pinch + xWobble;

                      // Edge culling: as it tapers, outer columns disappear
                      const visibleWidth = 1 - progress * taperAmount * 0.8;
                      const edgeCull = distFromCenter > visibleWidth ? 0 : 1;
                      const flicker = distFromCenter > 0.4
                        ? (noise(col, row, t * 7) > 0.3 ? 1 : 0.1)
                        : 1;
                      pOpacity = Math.max(0, 1 - progress * (0.2 + rowFactor * 0.8)) * flicker * edgeCull;
                    } else {
                      xPos = col * CELL + CELL / 2;
                      yPos = row * CELL + CELL / 2;
                      if (phase === "ascii") {
                        xPos += snoise(col, row, tick * 0.3) * 2;
                        yPos += snoise(row, col, tick * 0.3) * 2;
                      }
                      pOpacity = 1;
                    }

                    return (
                      <span
                        key={i}
                        className="absolute"
                        style={{
                          left: xPos, top: yPos, color,
                          fontSize: "13px", fontWeight: "bold",
                          fontFamily: '"GT Alpina Typewriter Trial", monospace',
                          textAlign: "center", width: CELL,
                          marginLeft: -CELL / 2, marginTop: -7,
                          opacity: pOpacity,
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Song title — Polaroid bottom strip */}
            <div
              className="text-center w-full"
              style={{
                padding: "10px 4px 10px",
                opacity: cardDissolved ? 0 : phase === "collapse" ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              <div className="text-fg text-xs truncate" style={{ maxWidth: CARD_SZ }}>{selected.title.toLowerCase()}</div>
              <div className="text-muted text-xs truncate mt-0.5" style={{ maxWidth: CARD_SZ }}>{selected.artist.toLowerCase()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Done text — split-flap scramble */}
      {(phase === "done" || phase === "fadeout") && <FlapText text={resultMsg} />}
    </div>
  );
}
