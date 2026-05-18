"use client";

import { useEffect, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { useScrollContext } from "@/context/ScrollContext";

const HEADER_H = 56;

function IconBack() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AsciiHeader() {
  const [mounted, setMounted] = useState(false);
  const { openDetails, detailBacksRef, currentSection } = useScrollContext();
  // Show back only if the current section is the one with the open detail.
  // Swiping away to a different section hides the arrow.
  const showBack = openDetails.includes(currentSection);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 md:h-24"
      style={{ pointerEvents: "none" }}
    >
      {/* Always-visible blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, transparent, var(--color-bg))",
          maskImage: "linear-gradient(to bottom, var(--color-bg) 50%, transparent)",
          WebkitBackdropFilter: "blur(6px)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Back button — top left, mobile only, only when a detail is open */}
      <div
        className="absolute left-6 flex md:hidden items-center"
        style={{
          height: HEADER_H,
          top: 0,
          opacity: showBack && mounted ? 1 : 0,
          transform: showBack && mounted ? "translateX(0) scale(1)" : "translateX(-6px) scale(0.9)",
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s",
          pointerEvents: showBack && mounted ? "auto" : "none",
        }}
      >
        <button
          onClick={() => detailBacksRef.current[currentSection]?.()}
          className="text-muted hover:text-fg cursor-pointer p-2 -m-2"
          aria-label="Back"
        >
          <IconBack />
        </button>
      </div>

      {/* Dark mode toggle — top right */}
      <div
        className="absolute right-6 flex items-center"
        style={{
          height: HEADER_H,
          top: 0,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.9)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s",
          pointerEvents: mounted ? "auto" : "none",
          fontFamily: "var(--font-display)",
          fontSize: "14px",
        }}
      >
        <DarkModeToggle />
      </div>
    </header>
  );
}
