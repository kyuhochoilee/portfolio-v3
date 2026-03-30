"use client";

import { createContext, useContext, useRef, type RefObject } from "react";

type ScrollContextValue = {
  scrollerRef: RefObject<HTMLDivElement | null>;
};

const ScrollContext = createContext<ScrollContextValue>({
  scrollerRef: { current: null },
});

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  return (
    <ScrollContext.Provider value={{ scrollerRef }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  return useContext(ScrollContext);
}
