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

const SPRING = { type: "spring", stiffness: 320, damping: 38, mass: 0.9 } as const;
const WINDOW = 2; // mount DayCard content for |i - index| <= WINDOW

interface Props {
  run: RunKey;
  schema: Schema;
  days: Day[];
  initialDay: number; // 1-based
  onDayChange: (day: number) => void;
}

/* Horizontal drag pager across all 50 days. One page per swipe (velocity-
   biased), virtualized content, lazy block fetch with neighbor prefetch. */
export default function DayPager({ run, schema, days, initialDay, onDayChange }: Props) {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [pageW, setPageW] = useState(0);
  const clampedInitial = Math.max(1, Math.min(TOTAL_DAYS, initialDay)) - 1;
  const [index, setIndex] = useState(clampedInitial);
  const indexRef = useRef(index);
  indexRef.current = index;

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
      setIndex(t);
      indexRef.current = t;
      if (reduce || pageW === 0) x.set(-t * pageW);
      else animate(x, -t * pageW, SPRING);
    },
    [pageW, reduce, x],
  );

  const onDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const start = indexRef.current;
      let target = start;
      if (info.offset.x < -pageW * 0.22 || info.velocity.x < -450) target = start + 1;
      else if (info.offset.x > pageW * 0.22 || info.velocity.x > 450) target = start - 1;
      goTo(target);
    },
    [pageW, goTo],
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
    <div className="rb-pager-viewport" ref={viewportRef}>
      {pageW > 0 && (
        <motion.div
          className="rb-pager-track"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -(TOTAL_DAYS - 1) * pageW, right: 0 }}
          dragElastic={0.16}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {Array.from({ length: TOTAL_DAYS }, (_, i) => {
            const dayNum = i + 1;
            const near = Math.abs(i - index) <= WINDOW;
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
    </div>
  );
}
