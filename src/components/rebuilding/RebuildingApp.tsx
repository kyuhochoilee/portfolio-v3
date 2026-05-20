"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Schema, RunKey, RunData } from "@/lib/notion";
import { TOTAL_DAYS } from "@/lib/notion";
import Dashboard from "./Dashboard";
import DaySheet from "./DaySheet";
import RunSwitcher from "./RunSwitcher";

interface Props {
  runs: Record<RunKey, RunData>;
  initialRun: RunKey;
}

const ORDER: RunKey[] = ["kyu", "zaza"];
const STAGE_SPRING = { type: "spring", stiffness: 380, damping: 44 } as const;

function baseFor(run: RunKey) {
  return run === "kyu" ? "/rebuilding" : "/rebuilding/zaza";
}

/* The open day is encoded in the URL hash (#day-NN). The hash is invisible to
   Next's router, so opening/closing the sheet never triggers an RSC refetch.
   We pass `null` to push/replaceState so Next keeps ownership of history.state. */
function hashFor(run: RunKey, day: number) {
  return `${baseFor(run)}#day-${String(day).padStart(2, "0")}`;
}

function dayFromHash(): number | null {
  if (typeof window === "undefined") return null;
  const m = window.location.hash.match(/^#day-(\d{1,2})$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 1 && n <= TOTAL_DAYS ? n : null;
}

/* Orchestrates the whole /rebuilding experience: a horizontal scroll-snap of
   both dashboards, the day sheet overlay, and URL/history sync. */
export default function RebuildingApp({ runs, initialRun }: Props) {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [run, setRun] = useState<RunKey>(initialRun);
  const runRef = useRef(run);
  runRef.current = run;

  const [ready, setReady] = useState(false);
  // Sheet is opened after mount (never SSR-ed) so a deep-linked #day- can't
  // cause a hydration mismatch on the position:fixed overlay.
  const [openDay, setOpenDay] = useState<{ run: RunKey; day: number } | null>(null);
  const openRef = useRef(openDay);
  openRef.current = openDay;

  // position the snap container on the initial run, seed history, then reveal
  useEffect(() => {
    const sc = scrollerRef.current;
    if (sc) {
      requestAnimationFrame(() => {
        const idx = ORDER.indexOf(initialRun);
        sc.scrollTo({ left: idx * sc.clientWidth, behavior: "auto" });
        setReady(true);
      });
    }
    // deep link: split into a base entry + a sheet entry so back closes the sheet
    const hashDay = dayFromHash();
    if (hashDay && runs[initialRun]?.schema) {
      window.history.replaceState(null, "", baseFor(initialRun));
      window.history.pushState(null, "", hashFor(initialRun, hashDay));
      setOpenDay({ run: initialRun, day: hashDay });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // track snap settle → update active run + clean URL
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!sc.clientWidth) return;
        const idx = Math.round(sc.scrollLeft / sc.clientWidth);
        const r = ORDER[Math.max(0, Math.min(ORDER.length - 1, idx))];
        if (r !== runRef.current) {
          runRef.current = r;
          setRun(r);
          if (!openRef.current) {
            window.history.replaceState(null, "", baseFor(r));
          }
        }
      });
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sc.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToRun = useCallback(
    (r: RunKey) => {
      const sc = scrollerRef.current;
      if (!sc) return;
      const idx = ORDER.indexOf(r);
      sc.scrollTo({ left: idx * sc.clientWidth, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce],
  );

  const openDayFor = useCallback(
    (r: RunKey, day: number) => {
      if (!runs[r]?.schema) return;
      window.history.pushState(null, "", hashFor(r, day));
      setOpenDay({ run: r, day });
    },
    [runs],
  );

  const requestClose = useCallback(() => {
    if (dayFromHash() != null) {
      window.history.back(); // hash-only pop → onPop clears openDay, no refetch
    } else {
      setOpenDay(null);
    }
  }, []);

  // keep #day- current as the pager moves (no new history entries)
  const syncDayUrl = useCallback((day: number) => {
    const cur = openRef.current;
    if (!cur) return;
    window.history.replaceState(null, "", hashFor(cur.run, day));
  }, []);

  // back/forward button — derive sheet state from the URL hash
  useEffect(() => {
    const onPop = () => {
      const hashDay = dayFromHash();
      const cur = openRef.current;
      if (hashDay && (!cur || cur.day !== hashDay)) {
        setOpenDay({ run: runRef.current, day: hashDay });
      } else if (!hashDay && cur) {
        setOpenDay(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const sheetOpen = !!openDay;

  return (
    <>
      <motion.div
        className="rb-stage"
        animate={reduce ? undefined : { scale: sheetOpen ? 0.94 : 1 }}
        transition={STAGE_SPRING}
        inert={sheetOpen}
      >
        <div
          ref={scrollerRef}
          className="rb-runscroll"
          data-ready={ready}
          style={{ overflowX: sheetOpen ? "hidden" : "auto" }}
        >
          {ORDER.map((r) => (
            <section className="rb-runpanel" key={r}>
              {runs[r]?.schema ? (
                <Dashboard
                  run={r}
                  schema={runs[r].schema as Schema}
                  days={runs[r].days}
                  onOpenDay={(d) => openDayFor(r, d)}
                />
              ) : (
                <div className="rb-wrap">schema unavailable</div>
              )}
            </section>
          ))}
        </div>
      </motion.div>

      <RunSwitcher run={run} onSelect={scrollToRun} hidden={sheetOpen} />

      <AnimatePresence>
        {openDay && runs[openDay.run]?.schema && (
          <DaySheet
            key="day-sheet"
            run={openDay.run}
            schema={runs[openDay.run].schema as Schema}
            days={runs[openDay.run].days}
            initialDay={openDay.day}
            onRequestClose={requestClose}
            onDayChange={syncDayUrl}
          />
        )}
      </AnimatePresence>
    </>
  );
}
