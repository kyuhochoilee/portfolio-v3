"use client";

import { createContext, useContext, useRef, useState, useCallback, type RefObject, type MutableRefObject } from "react";

type ScrollContextValue = {
  scrollerRef: RefObject<HTMLDivElement | null>;
  detailBacksRef: MutableRefObject<Record<string, (() => void) | undefined>>;
  openDetails: string[];
  registerDetailBack: (section: string, cb: () => void) => void;
  unregisterDetailBack: (section: string) => void;
};

const ScrollContext = createContext<ScrollContextValue>({
  scrollerRef: { current: null },
  detailBacksRef: { current: {} },
  openDetails: [],
  registerDetailBack: () => {},
  unregisterDetailBack: () => {},
});

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const detailBacksRef = useRef<Record<string, (() => void) | undefined>>({});
  const [openDetails, setOpenDetails] = useState<string[]>([]);

  const registerDetailBack = useCallback((section: string, cb: () => void) => {
    detailBacksRef.current[section] = cb;
    setOpenDetails(prev => prev.includes(section) ? prev : [...prev, section]);
  }, []);

  const unregisterDetailBack = useCallback((section: string) => {
    delete detailBacksRef.current[section];
    setOpenDetails(prev => prev.filter(s => s !== section));
  }, []);

  return (
    <ScrollContext.Provider value={{ scrollerRef, detailBacksRef, openDetails, registerDetailBack, unregisterDetailBack }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  return useContext(ScrollContext);
}
