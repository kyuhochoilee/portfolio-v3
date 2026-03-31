"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { isDarkMode } from "@/lib/theme";

const GRID_SIZE = 28;
const DOT_SPACING = 14;
const BASE_SIZE = 11;

const GLYPHS = [
  "#", "+", "x", "*", "%", "@", "=", "~",
  "/", "\\", "|", "-", ":", ";", "^", "!",
  "[", "]", "{", "}", "<", ">", "&", "$",
];

const PALETTE_LIGHT = [
  { pos: 0, r: 255, g: 210, b: 100 },
  { pos: 0.25, r: 255, g: 170, b: 80 },
  { pos: 0.5, r: 255, g: 140, b: 120 },
  { pos: 0.75, r: 255, g: 180, b: 140 },
  { pos: 1, r: 255, g: 220, b: 130 },
];

const PALETTE_DARK = [
  { pos: 0, r: 30, g: 160, b: 150 },
  { pos: 0.25, r: 35, g: 185, b: 170 },
  { pos: 0.5, r: 45, g: 212, b: 191 },
  { pos: 0.75, r: 40, g: 190, b: 175 },
  { pos: 1, r: 30, g: 165, b: 155 },
];

const TIME_SPEED = 0.025;
const GLYPH_SPEED = 1.5;
const FLICKER_SPEED = 1.2;
const BORDER = 4;
const BURST_LIFETIME = 60;

// Split-flap config
const FLAP_WORDS = ["product manager", "growth hacker", "designer", "engineer", "creative"];
const FLAP_HOLD_MS = 3000;
const FLAP_TICK_START_MS = 60;  // speed of first tick
const FLAP_TICK_END_MS = 220;   // speed of last tick (ease-out)
const FLAP_SCRAMBLE_MIN = 6;    // ticks of pure scramble before resolving starts
const FLAP_STAGGER = 2;         // ticks between each letter resolving

type ColorStop = { pos: number; r: number; g: number; b: number };
type Burst = { x: number; y: number; age: number };

function lerpColor(stops: ColorStop[], t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].pos < clamped) i++;
  if (i >= stops.length - 1) {
    const s = stops[stops.length - 1];
    return { r: s.r, g: s.g, b: s.b };
  }
  const a = stops[i];
  const b = stops[i + 1];
  const local = (clamped - a.pos) / (b.pos - a.pos);
  return {
    r: Math.round(a.r + (b.r - a.r) * local),
    g: Math.round(a.g + (b.g - a.g) * local),
    b: Math.round(a.b + (b.b - a.b) * local),
  };
}

// Expose grid bounds so AsciiCursor knows where the grid is
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__heroGridRect = null;
}

export default function HalftoneHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const burstsRef = useRef<Burst[]>([]);
  const darkRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });
  const visibleRef = useRef(true);
  const sectionRef = useRef<HTMLElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const leftFlapRef = useRef<HTMLSpanElement>(null);
  const rightTextRef = useRef<HTMLParagraphElement>(null);
  const [, rerender] = useState(0);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    darkRef.current = isDarkMode();
    // Watch system preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => { darkRef.current = isDarkMode(); rerender((n) => n + 1); };
    mq.addEventListener("change", onMq);
    // Watch .dark class toggle on <html>
    const observer = new MutationObserver(() => {
      darkRef.current = isDarkMode();
      rerender((n) => n + 1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { mq.removeEventListener("change", onMq); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const onResize = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      sizeRef.current = { w: 0, h: 0 };
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      (window as unknown as Record<string, unknown>).__heroGridRect = null;
    };
  }, []);

  // Pause when off-screen — delay observer so initial scroll to "home" lands first
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let obs: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      obs = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = visibleRef.current;
          visibleRef.current = entry.isIntersecting;
          if (!wasVisible && entry.isIntersecting) {
            animRef.current = requestAnimationFrame(draw);
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
    }, 800);
    return () => {
      clearTimeout(timer);
      obs?.disconnect();
    };
  }, []);

  // Split-flap animation for left label
  useEffect(() => {
    const el = leftFlapRef.current;
    if (!el) return;

    let wordIdx = 0;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let flipTimer: ReturnType<typeof setTimeout> | null = null;

    function startHold() {
      el!.textContent = FLAP_WORDS[wordIdx];
      holdTimer = setTimeout(startScramble, FLAP_HOLD_MS);
    }

    function startScramble() {
      const prev = FLAP_WORDS[wordIdx];
      wordIdx = (wordIdx + 1) % FLAP_WORDS.length;
      const next = FLAP_WORDS[wordIdx];
      const len = Math.max(prev.length, next.length);
      const totalTicks = FLAP_SCRAMBLE_MIN + len * FLAP_STAGGER;
      let tick = 0;

      function step() {
        tick++;
        let result = "";
        let done = true;

        for (let i = 0; i < len; i++) {
          const resolveAt = FLAP_SCRAMBLE_MIN + i * FLAP_STAGGER;
          if (tick >= resolveAt) {
            result += i < next.length ? next[i] : "";
          } else {
            done = false;
            result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }

        el!.textContent = result;

        if (done) {
          flipTimer = null;
          startHold();
        } else {
          // Ease out: fast at start, slow near end
          const progress = tick / totalTicks;
          const eased = progress * progress; // quadratic ease-in for delay = ease-out for speed
          const delay = FLAP_TICK_START_MS + (FLAP_TICK_END_MS - FLAP_TICK_START_MS) * eased;
          flipTimer = setTimeout(step, delay);
        }
      }

      flipTimer = setTimeout(step, FLAP_TICK_START_MS);
    }

    startHold();

    return () => {
      if (holdTimer) clearTimeout(holdTimer);
      if (flipTimer) clearInterval(flipTimer);
    };
  }, []);

  const lastFrameRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Keep scheduling even when off-screen, just skip the actual drawing
    if (!visibleRef.current) {
      animRef.current = requestAnimationFrame(draw);
      return;
    }

    // Throttle to ~30fps
    const now = performance.now();
    if (now - lastFrameRef.current < 33) {
      animRef.current = requestAnimationFrame(draw);
      return;
    }
    lastFrameRef.current = now;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dark = darkRef.current;
    const PALETTE = dark ? PALETTE_DARK : PALETTE_LIGHT;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const pixelW = Math.round(rect.width * dpr);
    const pixelH = Math.round(rect.height * dpr);

    // Only reallocate canvas buffer when size actually changes
    if (sizeRef.current.w !== pixelW || sizeRef.current.h !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
      sizeRef.current = { w: pixelW, h: pixelH };
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const viewW = rect.width;
    const viewH = rect.height;

    // Scale grid to fit the viewport — leave padding
    const rawGridSpan = (GRID_SIZE - 1) * DOT_SPACING;
    const maxGridSize = Math.min(viewW, viewH) * 0.85;
    const scale = maxGridSize < rawGridSpan ? maxGridSize / rawGridSpan : 1;
    const gridSpan = rawGridSpan * scale;
    const dotSpacing = DOT_SPACING * scale;
    const baseSize = BASE_SIZE * scale;

    const centerX = viewW / 2;
    const centerY = viewH / 2;
    const gridOffsetX = centerX - gridSpan / 2;
    const gridOffsetY = centerY - gridSpan / 2;

    // Position flanking text — above/below grid on mobile, left/right on desktop
    const isMobile = viewW < 768;
    if (leftTextRef.current) {
      if (isMobile) {
        // Center between header blur (~70px) and grid top
        const topMid = (70 + gridOffsetY) / 2;
        leftTextRef.current.style.left = '50%';
        leftTextRef.current.style.right = '';
        leftTextRef.current.style.top = `${topMid}px`;
        leftTextRef.current.style.transform = 'translate(-50%, -50%)';
      } else {
        leftTextRef.current.style.left = `${gridOffsetX / 2}px`;
        leftTextRef.current.style.right = '';
        leftTextRef.current.style.top = '50%';
        leftTextRef.current.style.transform = 'translateX(-50%) translateY(-50%)';
      }
    }
    if (rightTextRef.current) {
      if (isMobile) {
        // Center between grid bottom and footer area (~80px from bottom)
        const bottomMid = (gridOffsetY + gridSpan + (viewH - 80)) / 2;
        rightTextRef.current.style.left = '50%';
        rightTextRef.current.style.right = '';
        rightTextRef.current.style.top = `${bottomMid}px`;
        rightTextRef.current.style.transform = 'translate(-50%, -50%)';
      } else {
        rightTextRef.current.style.left = '';
        rightTextRef.current.style.right = `${gridOffsetX / 2}px`;
        rightTextRef.current.style.top = '50%';
        rightTextRef.current.style.transform = 'translateX(50%) translateY(-50%)';
      }
    }

    // Publish grid screen bounds so AsciiCursor can check overlap
    (window as unknown as Record<string, unknown>).__heroGridRect = {
      left: rect.left + gridOffsetX,
      top: rect.top + (centerY - gridSpan / 2),
      right: rect.left + gridOffsetX + gridSpan,
      bottom: rect.top + (centerY - gridSpan / 2) + gridSpan,
    };

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const time = timeRef.current;
    timeRef.current += TIME_SPEED;

    // Age bursts
    for (let i = burstsRef.current.length - 1; i >= 0; i--) {
      burstsRef.current[i].age++;
      if (burstsRef.current[i].age > BURST_LIFETIME) {
        burstsRef.current.splice(i, 1);
      }
    }

    // --- Name ---
    const midT = 0.5 + Math.sin(time * 0.6) * 0.15;
    const nameC = lerpColor(PALETTE, midT);

    const fontSize = gridSpan * 0.21;
    ctx.save();
    ctx.font = `400 ${fontSize}px "GT Alpina Typewriter Trial", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = `${fontSize * -0.15}px`;
    ctx.fillStyle = `rgb(${nameC.r}, ${nameC.g}, ${nameC.b})`;
    ctx.fillText("kyuho", centerX, centerY - fontSize * 0.28);
    ctx.fillText("lee", centerX, centerY + fontSize * 0.52);
    ctx.restore();

    // --- ASCII grid ---
    const hoverRadius = gridSpan * 0.25;
    const burstWaveSpeed = gridSpan / BURST_LIFETIME * 0.8;
    const burstRingWidth = gridSpan * 0.15;
    const brightTarget = dark ? 220 : 255;

    // Set font properties once — only change font when size differs
    const baseFontSize = Math.max(4, Math.round(baseSize));
    ctx.font = `bold ${baseFontSize}px "GT Alpina Typewriter Trial", "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let currentFontSize = baseFontSize;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const distFromEdge = Math.min(col, row, GRID_SIZE - 1 - col, GRID_SIZE - 1 - row);

        if (distFromEdge < BORDER) {
          const tick = Math.floor(time * FLICKER_SPEED);
          const hash = Math.sin(col * 127.1 + row * 311.7 + tick * 17.3) * 43758.5453;
          const rand = hash - Math.floor(hash);
          if (rand > distFromEdge / BORDER) continue;
        }

        const x = gridOffsetX + col * dotSpacing;
        const y = gridOffsetY + row * dotSpacing;

        const tColor = (row + Math.sin(time * 0.6 + col * 0.1) * 1.5) / (GRID_SIZE - 1);
        const c = lerpColor(PALETTE, tColor);

        const mdx = x - mx;
        const mdy = y - my;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const hoverInfluence = Math.max(0, 1 - mDist / hoverRadius);

        let burstInfluence = 0;
        let burstGlyphJolt = 0;
        for (const burst of burstsRef.current) {
          const bdx = x - burst.x;
          const bdy = y - burst.y;
          const bDist = Math.sqrt(bdx * bdx + bdy * bdy);
          const waveRadius = burst.age * burstWaveSpeed;
          const distFromWave = Math.abs(bDist - waveRadius);
          if (distFromWave < burstRingWidth) {
            const waveFade = 1 - burst.age / BURST_LIFETIME;
            const ringStrength = (1 - distFromWave / burstRingWidth) * waveFade;
            burstInfluence = Math.max(burstInfluence, ringStrength);
            burstGlyphJolt += burst.age * 2;
          }
        }

        const totalInfluence = Math.min(1, hoverInfluence + burstInfluence);
        const size = Math.max(4, Math.round(baseSize + totalInfluence * 8 * scale));
        const alpha = 0.75 + totalInfluence * 0.25;

        // Only update font when size changes
        if (size !== currentFontSize) {
          ctx.font = `bold ${size}px "GT Alpina Typewriter Trial", "Courier New", monospace`;
          currentFontSize = size;
        }

        const glyphWave = Math.floor(time * GLYPH_SPEED + col * 0.7 + row * 0.5 + burstGlyphJolt);
        const baseIndex = (col * 7 + row * 13) % GLYPHS.length;
        const glyph = GLYPHS[(baseIndex + glyphWave) % GLYPHS.length];

        const cr = Math.min(255, c.r + burstInfluence * (brightTarget - c.r) * 0.6);
        const cg = Math.min(255, c.g + burstInfluence * (brightTarget - c.g) * 0.6);
        const cb = Math.min(255, c.b + burstInfluence * (brightTarget - c.b) * 0.6);

        ctx.fillStyle = `rgba(${Math.round(cr)}, ${Math.round(cg)}, ${Math.round(cb)}, ${alpha})`;
        ctx.fillText(glyph, x, y);
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      burstsRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        age: 0,
      });
    },
    []
  );

  return (
    <section ref={sectionRef} className="relative flex items-center justify-center w-full select-none overflow-hidden" style={{ height: "100dvh" }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      <div
        ref={leftTextRef}
        className="absolute z-10"
        style={{
          fontFamily: '"GT Alpina Typewriter Trial", serif',
          fontSize: "var(--text-sm)",
        }}
        onMouseEnter={() => setListOpen(true)}
        onMouseLeave={() => setListOpen(false)}
      >
        {/* Single cycling word */}
        <span
          ref={leftFlapRef}
          className="block text-muted text-center"
          style={{
            opacity: listOpen ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        />
        {/* Expanded list */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center pointer-events-none">
          {FLAP_WORDS.map((word, i) => {
            const mid = (FLAP_WORDS.length - 1) / 2;
            const offset = i - mid;
            return (
              <span
                key={word}
                className="text-muted block whitespace-nowrap"
                style={{
                  position: "absolute",
                  opacity: listOpen ? 1 : 0,
                  transform: listOpen
                    ? `translateY(${offset * 1.6}em) scale(1)`
                    : "translateY(0) scale(0.8)",
                  transition: `all 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${Math.abs(offset) * 40}ms`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>


      <p
        ref={rightTextRef}
        className="absolute z-10 text-muted"
        style={{
          fontFamily: '"GT Alpina Typewriter Trial", serif',
          fontSize: "var(--text-sm)",
        }}
      >
        currently @ <a href="https://speak.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-fg transition-colors">speak</a>
      </p>

    </section>
  );
}
