"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  animate,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import type { Day, Schema, RunKey } from "@/lib/notion";
import { TOTAL_DAYS } from "@/lib/notion";
import DayCard from "./DayCard";

const SLIDE = { type: "spring", stiffness: 360, damping: 40, mass: 0.9 } as const;
const AXIS_LOCK = 6; // px before a gesture commits

interface Props {
  run: RunKey;
  schema: Schema;
  days: Day[];
  initialDay: number; // 1-based
  onDayChange: (day: number) => void;
  onPull: (offsetY: number) => void; // content pulled down at scroll-top
  onPullEnd: (offsetY: number, velocityY: number) => void;
}

/* One day at a time. Navigation is by the bottom bar (or arrow keys); the
   track still slides between days for a tactile transition. A downward pan
   while the page is at its scroll-top is forwarded to the sheet as a
   pull-to-dismiss — with no horizontal swipe there is nothing to fight. */
export default function DayPager({
  run,
  schema,
  days,
  initialDay,
  onDayChange,
  onPull,
  onPullEnd,
}: Props) {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [pageW, setPageW] = useState(0);
  const clampedInitial = Math.max(1, Math.min(TOTAL_DAYS, initialDay)) - 1;
  const [index, setIndex] = useState(clampedInitial);
  const indexRef = useRef(index);
  indexRef.current = index;

  // mount only the current day on open; widen once warm
  const [warm, setWarm] = useState(false);
  const win = warm ? 2 : 0;

  const dayMap = useMemo(() => {
    const m = new Map<number, Day>();
    for (const d of days) m.set(d.day, d);
    return m;
  }, [days]);

  const blocksCache = useRef<Map<number, any[]>>(new Map());
  const loadingRef = useRef<Set<number>>(new Set());
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const fetchBlocks = useCallback(
    async (dayNum: number) => {
      if (dayNum < 1 || dayNum > TOTAL_DAYS) return;
      if (blocksCache.current.has(dayNum) || loadingRef.current.has(dayNum)) return;
      if (!dayMap.has(dayNum)) {
        blocksCache.current.set(dayNum, []);
        bump();
        return;
      }
      loadingRef.current.add(dayNum);
      bump();
      try {
        const res = await fetch(`/api/rebuilding/blocks?run=${run}&day=${dayNum}`);
        const json = await res.json();
        blocksCache.current.set(dayNum, Array.isArray(json.blocks) ? json.blocks : []);
      } catch {
        blocksCache.current.set(dayNum, []);
      } finally {
        loadingRef.current.delete(dayNum);
        bump();
      }
    },
    [run, dayMap],
  );

  // measure viewport → page width; reposition track on resize
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setPageW(w);
        x.set(-indexRef.current * w);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [x]);

  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 280);
    return () => clearTimeout(t);
  }, []);

  // current + neighbors: fetch blocks, report active day
  useEffect(() => {
    const d = index + 1;
    fetchBlocks(d);
    fetchBlocks(d - 1);
    fetchBlocks(d + 1);
    onDayChange(d);
  }, [index, fetchBlocks, onDayChange]);

  const goTo = useCallback(
    (target: number) => {
      const t = Math.max(0, Math.min(TOTAL_DAYS - 1, target));
      setWarm(true);
      setIndex(t);
      indexRef.current = t;
      if (reduce || pageW === 0) x.set(-t * pageW);
      else animate(x, -t * pageW, SLIDE);
    },
    [pageW, reduce, x],
  );

  // ----- pull-to-dismiss (downward drag from a page's scroll-top) -----
  const decided = useRef(false);
  const pulling = useRef(false);
  const startScrollTop = useRef(0);

  const activeScrollTop = useCallback(() => {
    const pages = viewportRef.current?.querySelectorAll<HTMLElement>(".rb-page");
    return pages?.[indexRef.current]?.scrollTop ?? 0;
  }, []);

  const onPanStart = useCallback(() => {
    decided.current = false;
    pulling.current = false;
    startScrollTop.current = activeScrollTop();
  }, [activeScrollTop]);

  const onPan = useCallback(
    (_: unknown, info: PanInfo) => {
      if (!decided.current) {
        if (Math.abs(info.offset.x) < AXIS_LOCK && Math.abs(info.offset.y) < AXIS_LOCK) return;
        decided.current = true;
        pulling.current =
          info.offset.y > Math.abs(info.offset.x) &&
          info.offset.y > 0 &&
          startScrollTop.current <= 0;
      }
      if (pulling.current) onPull(info.offset.y);
    },
    [onPull],
  );

  const onPanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (pulling.current) onPullEnd(info.offset.y, info.velocity.y);
      decided.current = false;
      pulling.current = false;
    },
    [onPullEnd],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(indexRef.current + 1);
      else if (e.key === "ArrowLeft") goTo(indexRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  return (
    <div className="rb-pager-root">
      <motion.div
        className="rb-pager-viewport"
        ref={viewportRef}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
      >
        {pageW > 0 && (
          <motion.div className="rb-pager-track" style={{ x }}>
            {Array.from({ length: TOTAL_DAYS }, (_, i) => {
              const dayNum = i + 1;
              const near = Math.abs(i - index) <= win;
              return (
                <div className="rb-page" key={dayNum} style={{ width: pageW }}>
                  {near && (
                    <DayCard
                      schema={schema}
                      dayNum={dayNum}
                      day={dayMap.get(dayNum) ?? null}
                      blocks={blocksCache.current.get(dayNum) ?? null}
                      loading={loadingRef.current.has(dayNum)}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      <nav className="rb-daynav" aria-label="day navigation">
        <button
          type="button"
          className="rb-daynav-btn"
          aria-label="previous day"
          disabled={index <= 0}
          onClick={() => goTo(index - 1)}
        >
          ←
        </button>
        <span className="rb-daynav-label">
          day {String(index + 1).padStart(2, "0")} / {TOTAL_DAYS}
        </span>
        <button
          type="button"
          className="rb-daynav-btn"
          aria-label="next day"
          disabled={index >= TOTAL_DAYS - 1}
          onClick={() => goTo(index + 1)}
        >
          →
        </button>
      </nav>
    </div>
  );
}
