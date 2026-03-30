"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const GLYPHS = ["#", "+", "x", "*", "%", "@", "=", "~", "/", "\\", "|", "-", ":", "&"];
const LABEL = "log a thought";
const FLAP_TICK_START = 30;
const FLAP_TICK_END = 90;
const FLAP_STAGGER = 2;
const FLAP_SCRAMBLE_MIN = 3;

export default function WriteBottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrambleIn = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    el.style.width = `${LABEL.length * 0.58}em`;
    el.style.marginLeft = "0.5rem";
    el.style.opacity = "1";

    const target = LABEL;
    const totalTicks = FLAP_SCRAMBLE_MIN + target.length * FLAP_STAGGER;
    let tick = 0;

    function step() {
      tick++;
      let result = "";
      let done = true;
      for (let i = 0; i < target.length; i++) {
        const resolveAt = FLAP_SCRAMBLE_MIN + i * FLAP_STAGGER;
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
        const progress = tick / totalTicks;
        const eased = progress * progress;
        const delay = FLAP_TICK_START + (FLAP_TICK_END - FLAP_TICK_START) * eased;
        timerRef.current = setTimeout(step, delay);
      }
    }

    timerRef.current = setTimeout(step, FLAP_TICK_START);
  }, []);

  const scrambleOut = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const el = textRef.current;
    if (!el) return;
    el.style.width = "0";
    el.style.marginLeft = "0";
    el.style.opacity = "0";
    setTimeout(() => { if (el) el.textContent = ""; }, 300);
  }, []);

  if (pathname !== "/write") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={() => router.push("/write/new")}
        onMouseEnter={() => { setHovered(true); scrambleIn(); }}
        onMouseLeave={() => { setHovered(false); scrambleOut(); }}
        className="h-12 rounded-full flex items-center cursor-pointer"
        style={{
          padding: "0 0.875rem",
          background: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          border: "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          transition: "padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M12 5V19M5 12H19" stroke="var(--color-fg)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span
          ref={textRef}
          className="text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            display: "inline-block",
            width: 0,
            opacity: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}
