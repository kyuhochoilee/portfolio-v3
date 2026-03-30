"use client";

import { useRef, useCallback, useEffect, useState, type RefObject } from "react";
import NowPlaying from "./NowPlaying";
import SongSuggest from "./SongSuggest";
import FooterClock from "./FooterClock";
import { useScrollContext } from "@/context/ScrollContext";

// Map DOM section IDs → index in NAV_ITEMS array
// NAV_ITEMS: [thoughts=0, about=1, home=2, projects=3, creative=4]
const SECTION_TO_NAV: Record<string, number> = {
  thoughts: 0,
  about: 1,
  home: 2,
  projects: 3,
  creative: 4,
};

const size = 16;

const GLYPHS = [
  "#", "+", "x", "*", "%", "@", "=", "~",
  "/", "\\", "|", "-", ":", ";", "^", "!",
  "[", "]", "{", "}", "<", ">", "&", "$",
];

const FLAP_TICK_START = 30;
const FLAP_TICK_END = 90;
const FLAP_SCRAMBLE_MIN = 3;
const FLAP_STAGGER = 2;

function IconHome() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M14.0208 1.79299L21 8.77217V23.0858H14V17.0858C14 15.9812 13.1046 15.0858 12 15.0858C10.8954 15.0858 10 15.9812 10 17.0858V23.0858H3V8.57116L9.77817 1.79299C10.9497 0.621413 12.8492 0.621414 14.0208 1.79299Z" fill="currentColor" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M2 3.5C2 2.39543 2.89543 1.5 4 1.5H8C9.86384 1.5 11.4299 2.77477 11.874 4.5H21C22.6569 4.5 24 5.84315 24 7.5V19.5C24 21.1569 22.6569 22.5 21 22.5H3C1.34315 22.5 0 21.1569 0 19.5V7.5C0 6.19118 0.838141 5.07811 2.00698 4.66825C2.00236 4.61278 2 4.55666 2 4.5V3.5Z" fill="currentColor" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M14.98 20C19.4 20 22.98 16.42 22.98 12C22.98 7.58 19.4 4 14.98 4C12.45 4 10.2 5.17 8.74 7H7.52C3.93 7 1.02 9.91 1.02 13.5C1.02 17.09 3.93 20 7.52 20H14.98Z" fill="currentColor" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.8284 22 13.5 21.3284 13.5 20.5C13.5 20.1216 13.3517 19.7782 13.1135 19.5177C12.8804 19.2628 12.75 18.9336 12.75 18.5C12.75 17.6716 13.4216 17 14.25 17H16C19.3137 17 22 14.3137 22 11C22 6.02944 17.5228 2 12 2ZM6.5 11C7.32843 11 8 10.3284 8 9.5C8 8.67157 7.32843 8 6.5 8C5.67157 8 5 8.67157 5 9.5C5 10.3284 5.67157 11 6.5 11ZM11 7.5C11 8.32843 10.3284 9 9.5 9C8.67157 9 8 8.32843 8 7.5C8 6.67157 8.67157 6 9.5 6C10.3284 6 11 6.67157 11 7.5ZM14.5 9C15.3284 9 16 8.32843 16 7.5C16 6.67157 15.3284 6 14.5 6C13.6716 6 13 6.67157 13 7.5C13 8.32843 13.6716 9 14.5 9ZM19 9.5C19 10.3284 18.3284 11 17.5 11C16.6716 11 16 10.3284 16 9.5C16 8.67157 16.6716 8 17.5 8C18.3284 8 19 8.67157 19 9.5Z" fill="currentColor" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1C5.92487 1 1 5.92487 1 12C1 14.6244 1.85206 17.0505 3.29959 18.9965C5.12608 16.1451 8.35204 14.25 12 14.25C15.648 14.25 18.8739 16.1451 20.7004 18.9965C22.1479 17.0505 23 14.6244 23 12C23 5.92487 18.0751 1 12 1ZM12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z" fill="currentColor" />
    </svg>
  );
}

function NavItem({
  section, icon: Icon, label, index, isOpen, onHover, onLeave, href, scrollerRef, detailBacksRef,
}: {
  section: string; icon: React.FC; label: string; index: number;
  isOpen: boolean; onHover: () => void; onLeave: () => void; href?: string;
  scrollerRef: RefObject<HTMLDivElement | null>;
  detailBacksRef: React.MutableRefObject<Record<string, (() => void) | undefined>>;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOpenRef = useRef(false);

  const expandedWidth = `calc(${size}px + 0.5rem + ${label.length * 0.58}em + 0.625rem)`;
  const collapsedWidth = `calc(${size}px + 1rem)`;

  useEffect(() => {
    const el = textRef.current;
    const pill = pillRef.current;
    if (!el || !pill) return;

    if (isOpen && !wasOpenRef.current) {
      // Opening — scramble in
      if (timerRef.current) clearTimeout(timerRef.current);
      pill.style.width = expandedWidth;
      pill.style.opacity = "1";
      el.style.width = `${label.length * 0.58}em`;
      el.style.opacity = "1";

      const target = label.toLowerCase();
      const totalTicks = FLAP_SCRAMBLE_MIN + target.length * FLAP_STAGGER;
      let tick = 0;

      function step() {
        tick++;
        let result = "";
        let done = true;
        for (let i = 0; i < target.length; i++) {
          const resolveAt = FLAP_SCRAMBLE_MIN + i * FLAP_STAGGER;
          if (tick >= resolveAt) {
            result += target[i];
          } else {
            done = false;
            result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        el!.textContent = result;
        if (!done) {
          const progress = tick / totalTicks;
          const eased = progress * progress;
          const delay = FLAP_TICK_START + (FLAP_TICK_END - FLAP_TICK_START) * eased;
          timerRef.current = setTimeout(step, delay);
        }
      }
      timerRef.current = setTimeout(step, FLAP_TICK_START);

    } else if (!isOpen && wasOpenRef.current) {
      // Closing — collapse
      if (timerRef.current) clearTimeout(timerRef.current);
      el.style.width = "0";
      el.style.opacity = "0";
      pill.style.width = collapsedWidth;
      pill.style.opacity = "0";
      setTimeout(() => { el.textContent = ""; }, 300);
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, label, expandedWidth, collapsedWidth]);

  const handleClick = useCallback(() => {
    if (href) {
      window.location.href = href;
      return;
    }

    // If clicking a section while its detail is open, collapse it
    if (detailBacksRef.current[section]) {
      detailBacksRef.current[section]!();
      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) {
      window.location.href = section === "home" ? "/" : `/#${section}`;
      return;
    }
    const target = document.getElementById(section);
    if (target) {
      scroller.scrollTo({ top: target.offsetTop, behavior: "smooth" });
      const url = section === "home" ? "/" : `/#${section}`;
      window.history.pushState({ section }, "", url);
    }
  }, [section, href, scrollerRef]);

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center ${isOpen ? "" : "text-muted"} hover:text-fg cursor-pointer`}
      style={{
        color: isOpen ? "var(--color-orange)" : undefined,
        height: `${size + 16}px`,
        opacity: 0,
        ["--nav-spread" as string]: `${(index - 2) * 35}px`,
        transform: "translateX(var(--nav-spread)) scale(1.3)",
        animation: `navPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards`,
      }}
      aria-label={label}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Pill background */}
      <span
        ref={pillRef}
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          background: "transparent",
          width: collapsedWidth,
          opacity: 0,
          transition: "width 0.35s var(--ease-out), opacity 0.25s var(--ease-out), background 0.3s",
        }}
      />

      {/* Icon + text content */}
      <span
        className="relative flex items-center"
        style={{ padding: "0 0.5rem" }}
      >
        <Icon />
        <span
          ref={textRef}
          style={{
            fontFamily: '"GT Alpina Typewriter Trial", serif',
            fontSize: "var(--text-sm)",
            display: "inline-block",
            width: 0,
            opacity: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            marginLeft: "0.5rem",
            transition: "width 0.3s var(--ease-out), opacity 0.2s var(--ease-out)",
          }}
        />
      </span>
    </button>
  );
}

const NAV_ITEMS = [
  { section: "thoughts", icon: IconCloud, label: "Thoughts" },
  { section: "about", icon: IconProfile, label: "About" },
  { section: "home", icon: IconHome, label: "Home" },
  { section: "projects", icon: IconFolder, label: "Projects" },
  { section: "creative", icon: IconPalette, label: "Creative" },
];

export default function Footer() {
  const { scrollerRef, detailBacksRef, openDetails } = useScrollContext();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(window.location.pathname.startsWith("/write"));
  }, []);

  const [activeNav, setActiveNav] = useState(SECTION_TO_NAV.home);
  const navRef = useRef<HTMLElement>(null);
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavHover = useCallback((i: number) => {
    if (hoverLeaveTimer.current) { clearTimeout(hoverLeaveTimer.current); hoverLeaveTimer.current = null; }
    setHoveredNav(i);
  }, []);

  const handleNavLeave = useCallback(() => {
    hoverLeaveTimer.current = setTimeout(() => setHoveredNav(null), 80);
  }, []);

  // Hover takes priority — only one label open at a time
  const openNav = hoveredNav !== null ? hoveredNav : activeNav;

  const lastNavRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const scrollCenter = scroller.scrollTop + window.innerHeight / 2;

        // Find which section contains the viewport center
        const ids = ["thoughts", "about", "home", "projects", "creative"] as const;
        // These are the DOM sections on the home page
        let next = SECTION_TO_NAV.home;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollCenter >= top && scrollCenter < bottom) {
            next = SECTION_TO_NAV[id];
            break;
          }
        }
        if (next !== lastNavRef.current) {
          lastNavRef.current = next;
          setActiveNav(next);
        }
      });
    };

    const tryAttach = () => {
      const scroller = scrollerRef.current;
      if (scroller) {
        scroller.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      }
    };

    tryAttach();
    const timer = setTimeout(tryAttach, 300);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      const scroller = scrollerRef.current;
      if (scroller) scroller.removeEventListener("scroll", onScroll);
    };
  }, [scrollerRef]);

  if (hidden) return null;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ padding: "0 1rem 1.5rem" }}
    >
      {/* Background blur for text readability */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 140,
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-bg) 60%, transparent) 40%, color-mix(in srgb, var(--color-bg) 90%, transparent) 70%, var(--color-bg))",
          maskImage:
            "linear-gradient(to top, black 40%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 80%, transparent)",
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* NowPlaying — bottom left (desktop) */}
      <div
        className="fixed bottom-0 left-0 pointer-events-auto hidden md:flex items-center"
        style={{
          fontFamily: '"GT Alpina Typewriter Trial", serif',
          fontSize: "var(--text-sm)",
          padding: "2rem 1.5rem",
          maxWidth: "35%",
        }}
      >
        <NowPlaying />
        <span className="text-muted mx-3 shrink-0">·</span>
        <SongSuggest />
      </div>

      {/* Floating command bar — center */}
      <nav
        className="pointer-events-auto flex items-center gap-1 md:gap-2"
        ref={navRef}
        style={{
          padding: "0.5rem 0.75rem",
          borderRadius: "9999px",
          background: "color-mix(in srgb, var(--color-surface) 70%, transparent)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          border: "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Back button — pops into the pill on mobile when current section has an open detail */}
        {(() => {
          const currentSection = NAV_ITEMS[activeNav]?.section;
          const showBack = currentSection && openDetails.includes(currentSection);
          return showBack ? (
            <>
              <button
                onClick={() => detailBacksRef.current[currentSection]?.()}
                className="relative flex md:hidden items-center text-muted hover:text-fg cursor-pointer"
                style={{
                  height: `${size + 16}px`,
                  opacity: 0,
                  ["--nav-spread" as string]: "-20px",
                  transform: "translateX(var(--nav-spread)) scale(1.3)",
                  animation: "navPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                }}
                aria-label="Back"
              >
                <span className="relative flex items-center" style={{ padding: "0 0.5rem" }}>
                  <IconBack />
                </span>
              </button>
              <div className="md:hidden w-px self-stretch opacity-20" style={{ background: "var(--color-border)" }} />
            </>
          ) : null;
        })()}
        {NAV_ITEMS.map((item, i) => (
          <NavItem
            key={item.section}
            {...item}
            index={i}
            isOpen={openNav === i}
            onHover={() => handleNavHover(i)}
            onLeave={handleNavLeave}
            scrollerRef={scrollerRef}
            detailBacksRef={detailBacksRef}
          />
        ))}
      </nav>

      {/* Clock — bottom right */}
      <div
        className="fixed bottom-0 right-0 pointer-events-auto hidden md:flex items-center"
        style={{
          fontFamily: '"GT Alpina Typewriter Trial", serif',
          fontSize: "var(--text-sm)",
          padding: "2rem 1.5rem",
        }}
      >
        <FooterClock />
      </div>
    </footer>
  );
}
