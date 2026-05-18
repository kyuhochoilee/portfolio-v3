"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, type RefObject, type MutableRefObject } from "react";

const SECTIONS = ["thoughts", "about", "home", "projects", "creative"] as const;

type ScrollContextValue = {
  scrollerRef: RefObject<HTMLDivElement | null>;
  detailBacksRef: MutableRefObject<Record<string, (() => void) | undefined>>;
  openDetails: string[];
  registerDetailBack: (section: string, cb: () => void) => void;
  unregisterDetailBack: (section: string) => void;
  currentSection: string;
  setCurrentSection: (s: string) => void;
};

const ScrollContext = createContext<ScrollContextValue>({
  scrollerRef: { current: null },
  detailBacksRef: { current: {} },
  openDetails: [],
  registerDetailBack: () => {},
  unregisterDetailBack: () => {},
  currentSection: "home",
  setCurrentSection: () => {},
});

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const detailBacksRef = useRef<Record<string, (() => void) | undefined>>({});
  const [openDetails, setOpenDetails] = useState<string[]>([]);
  const [currentSection, _setCurrentSection] = useState<string>("home");
  // Suppress rAF section updates briefly after a user-driven setCurrentSection
  // (e.g. nav tap) so the in-flight smooth scroll doesn't flicker the highlight
  // through intermediate sections.
  const lockUntil = useRef(0);

  const setCurrentSection = useCallback((s: string) => {
    lockUntil.current = Date.now() + 700;
    _setCurrentSection(s);
  }, []);

  const registerDetailBack = useCallback((section: string, cb: () => void) => {
    detailBacksRef.current[section] = cb;
    setOpenDetails(prev => prev.includes(section) ? prev : [...prev, section]);
  }, []);

  const unregisterDetailBack = useCallback((section: string) => {
    delete detailBacksRef.current[section];
    setOpenDetails(prev => prev.filter(s => s !== section));
  }, []);

  // Poll scroller position via rAF to track which section is centered.
  // Scroll events fire unreliably on `scroll-snap-type: mandatory` scrollers
  // (especially iOS Safari after programmatic scrolls), and rAF auto-pauses
  // when the tab is backgrounded so this is cheap.
  useEffect(() => {
    let rafId = 0;
    let last = "";
    const tick = () => {
      const scroller = scrollerRef.current;
      if (scroller && Date.now() >= lockUntil.current) {
        const horizontal = scroller.dataset.layout === "horizontal";
        const center = horizontal
          ? scroller.scrollLeft + scroller.clientWidth / 2
          : scroller.scrollTop + scroller.clientHeight / 2;
        let id = "home";
        for (const candidate of SECTIONS) {
          const el = document.getElementById(candidate);
          if (!el) continue;
          const start = horizontal ? el.offsetLeft : el.offsetTop;
          const size = horizontal ? el.offsetWidth : el.offsetHeight;
          if (center >= start && center < start + size) {
            id = candidate;
            break;
          }
        }
        if (id !== last) {
          last = id;
          _setCurrentSection(id);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <ScrollContext.Provider value={{ scrollerRef, detailBacksRef, openDetails, registerDetailBack, unregisterDetailBack, currentSection, setCurrentSection }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  return useContext(ScrollContext);
}
