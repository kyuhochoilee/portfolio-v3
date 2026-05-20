"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
  type PanInfo,
} from "framer-motion";
import type { Day, Schema, RunKey } from "@/lib/notion";
import { TOTAL_DAYS } from "@/lib/notion";
import DayPager from "./DayPager";

const ENTER = { type: "spring", stiffness: 380, damping: 42, mass: 0.9 } as const;
const SETTLE = { type: "spring", stiffness: 520, damping: 44 } as const;
// exit is quicker than entrance and ease-in-biased — standard for dismissals
const EXIT = { duration: 0.26, ease: [0.32, 0.72, 0, 1] } as const;
const DISMISS_OFFSET = 130;
const DISMISS_VELOCITY = 680;

interface Props {
  run: RunKey;
  schema: Schema;
  days: Day[];
  initialDay: number;
  onRequestClose: () => void;
  onDayChange: (day: number) => void;
}

/* iOS-style bottom sheet. Springs up on mount; the header acts as a drag
   handle (onPan → sheet y) so drag-to-dismiss never competes with the
   pager's vertical scroll. Exit is owned by the parent <AnimatePresence>. */
export default function DaySheet({
  run,
  schema,
  days,
  initialDay,
  onRequestClose,
  onDayChange,
}: Props) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900,
  );
  const y = useMotionValue(vh);
  const [currentDay, setCurrentDay] = useState(initialDay);

  const backdropOpacity = useTransform(y, [0, vh], [0.45, 0], { clamp: true });

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // move focus into the dialog on open, restore it to the opener on close
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    rootRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRequestClose]);

  const onPan = useCallback(
    (_: unknown, info: PanInfo) => {
      y.set(Math.max(0, info.offset.y));
    },
    [y],
  );

  const onPanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
        onRequestClose();
      } else {
        animate(y, 0, SETTLE);
      }
    },
    [onRequestClose, y],
  );

  const handleDayChange = useCallback(
    (d: number) => {
      setCurrentDay(d);
      onDayChange(d);
    },
    [onDayChange],
  );
  const pad = String(currentDay).padStart(2, "0");

  return (
    <div
      className="rb-sheet-root"
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`day ${pad}`}
    >
      <motion.div
        className="rb-backdrop"
        style={{ opacity: backdropOpacity }}
        onClick={onRequestClose}
      />

      <motion.div
        className="rb-sheet"
        style={{ y }}
        initial={{ y: vh }}
        animate={{ y: 0 }}
        exit={{ y: vh, transition: reduce ? { duration: 0 } : EXIT }}
        transition={reduce ? { duration: 0 } : ENTER}
      >
        <motion.header
          className="rb-sheet-head"
          onPan={onPan}
          onPanEnd={onPanEnd}
        >
          <div className="rb-sheet-grab" aria-hidden />
          <div className="rb-sheet-titles">
            <span className="rb-sheet-day">day {pad}</span>
            <span className="rb-sheet-of">of {TOTAL_DAYS}</span>
          </div>
          <button
            type="button"
            className="rb-sheet-close"
            aria-label="close"
            onClick={onRequestClose}
          >
            ✕
          </button>
        </motion.header>

        <DayPager
          run={run}
          schema={schema}
          days={days}
          initialDay={initialDay}
          onDayChange={handleDayChange}
        />
      </motion.div>
    </div>
  );
}
