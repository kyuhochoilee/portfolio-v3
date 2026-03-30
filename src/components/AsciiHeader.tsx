"use client";

import { useEffect, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";

const HEADER_H = 56;

export default function AsciiHeader() {
  const [mounted, setMounted] = useState(false);

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
