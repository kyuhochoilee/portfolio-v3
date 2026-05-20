"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  nextHref?: string; // swipe left → navigate here
  prevHref?: string; // swipe right → navigate here
  children: React.ReactNode;
}

const THRESHOLD = 60; // min horizontal px
const RATIO = 1.4; // dx must dominate dy by this factor

export default function SwipeNav({ nextHref, prevHref, children }: Props) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < THRESHOLD) return;
    if (Math.abs(dx) < Math.abs(dy) * RATIO) return; // mostly vertical → ignore
    if (dx < 0 && nextHref) router.push(nextHref);
    else if (dx > 0 && prevHref) router.push(prevHref);
  }

  return (
    <div className="rb-swipe" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  );
}
