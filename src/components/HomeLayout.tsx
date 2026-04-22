"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import AboutSection from "@/components/AboutSection";
import HalftoneHero from "@/components/HalftoneHero";
import ProjectCard from "@/components/ProjectCard";
import CreativeBasement from "@/components/CreativeBasement";
import ThoughtsCard from "@/components/ThoughtsCard";
import ProjectsCard from "@/components/ProjectsCard";
import Container from "@/components/ui/Container";
import { useScrollContext } from "@/context/ScrollContext";
import type { ProjectMeta, PostMeta } from "@/lib/content";

const SECTIONS = ["thoughts", "about", "home", "projects", "creative"] as const;

function getInitialSection(): string {
  if (typeof window === "undefined") return "home";

  // Check ?s= param first (coming from /blog or other pages)
  const params = new URLSearchParams(window.location.search);
  const s = params.get("s");
  if (s && SECTIONS.includes(s as typeof SECTIONS[number])) return s;

  // Check hash
  const hash = window.location.hash.slice(1);
  if (hash && SECTIONS.includes(hash as typeof SECTIONS[number])) return hash;

  return "home";
}

export default function HomeLayout({
  projects,
  posts = [],
  blogContent = {},
  projectContent = {},
}: {
  projects: ProjectMeta[];
  posts?: PostMeta[];
  blogContent?: Record<string, React.ReactNode>;
  projectContent?: Record<string, React.ReactNode>;
}) {
  const { scrollerRef: scrollRef, openDetails } = useScrollContext();
  const currentSection = useRef("home");
  const isProgrammatic = useRef(false);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hasOpenDetail = openDetails.length > 0;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll to a section by ID, optionally with smooth behavior.
  // On mobile, scrolls horizontally (sections laid out in a row).
  // On desktop, scrolls vertically (sections stacked as snap pages).
  const scrollToSection = useCallback((id: string, smooth = false) => {
    const scroller = scrollRef.current;
    const el = document.getElementById(id);
    if (!scroller || !el) return;

    const horizontal = scroller.dataset.layout === "horizontal";

    // Reset inner scroll of this section to top
    if (el.scrollTop > 0) el.scrollTop = 0;

    isProgrammatic.current = true;
    if (!smooth) {
      scroller.style.scrollBehavior = "auto";
    }
    if (horizontal) {
      scroller.scrollLeft = el.offsetLeft;
    } else {
      scroller.scrollTop = el.offsetTop;
    }
    if (!smooth) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scroller) scroller.style.scrollBehavior = "smooth";
          isProgrammatic.current = false;
        });
      });
    } else {
      setTimeout(() => { isProgrammatic.current = false; }, 600);
    }
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    // Jump to initial section instantly, then reveal
    const initial = getInitialSection();
    currentSection.current = initial;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(initial, false);
        setTimeout(() => setReady(true), 50);
      });
    });

    // Safety fallback — always reveal after 1s even if scroll fails
    const safetyTimer = setTimeout(() => setReady(true), 1000);

    // Clean up URL to just hash
    const cleanUrl = initial === "home" ? "/" : `/#${initial}`;
    window.history.replaceState({ section: initial }, "", cleanUrl);

    // Track scroll position → update URL + history
    // Axis depends on layout: horizontal on mobile, vertical on desktop
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const horizontal = scroller.dataset.layout === "horizontal";
        const scrollCenter = horizontal
          ? scroller.scrollLeft + scroller.clientWidth / 2
          : scroller.scrollTop + scroller.clientHeight / 2;

        let active = "home";
        for (const id of SECTIONS) {
          const el = document.getElementById(id);
          if (!el) continue;
          const start = horizontal ? el.offsetLeft : el.offsetTop;
          const size = horizontal ? el.offsetWidth : el.offsetHeight;
          if (scrollCenter >= start && scrollCenter < start + size) {
            active = id;
            break;
          }
        }

        if (active !== currentSection.current && !isProgrammatic.current) {
          currentSection.current = active;
          const url = active === "home" ? "/" : `/#${active}`;
          window.history.pushState({ section: active }, "", url);
        }
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });

    // Handle back/forward button
    const onPopState = (e: PopStateEvent) => {
      const section = e.state?.section || "home";
      currentSection.current = section;
      scrollToSection(section, true);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      clearTimeout(safetyTimer);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
    };
    // Re-run when isMobile flips so the layout-axis switch also re-anchors the
    // scroll position to the current section (offsetLeft vs. offsetTop differ
    // between flex-row mobile layout and block desktop layout).
  }, [scrollToSection, isMobile]);

  return (
    <>
      {/* Loading overlay — covers everything until scroll is positioned */}
      {!ready && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "var(--color-bg)" }}
        >
          <span
            className="text-muted animate-pulse"
            style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-sm)" }}
          >
            · · ·
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        data-snap-container
        data-layout={isMobile ? "horizontal" : "vertical"}
        className={
          isMobile
            ? hasOpenDetail
              ? "overflow-hidden"
              : "overflow-x-auto overflow-y-hidden"
            : "overflow-y-auto"
        }
        style={{
          width: isMobile ? "100vw" : undefined,
          height: isMobile ? "100dvh" : "100svh",
          display: isMobile ? "flex" : undefined,
          flexDirection: isMobile ? "row" : undefined,
          scrollSnapType: hasOpenDetail
            ? "none"
            : isMobile
              ? "x mandatory"
              : "y mandatory",
          scrollBehavior: "smooth",
          overscrollBehavior: "contain",
        }}
      >
      {/* Card: Thoughts */}
      <div
        id="thoughts"
        className="snap-section shrink-0 overflow-clip"
        style={{
          background: "var(--color-bg)",
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100%" : "100svh",
          overflowY: isMobile ? "auto" : undefined,
          scrollSnapAlign: "start",
          contentVisibility: "auto",
          containIntrinsicSize: isMobile ? "100vw 100dvh" : "100vw 100svh",
        }}
      >
        <ThoughtsCard posts={posts} blogContent={blogContent} />
      </div>

      {/* Card: About */}
      <div
        id="about"
        className="snap-section shrink-0"
        style={{
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100%" : "100svh",
          overflowY: isMobile ? "auto" : undefined,
          scrollSnapAlign: "start",
          contentVisibility: "auto",
          containIntrinsicSize: isMobile ? "100vw 100dvh" : "100vw 100svh",
        }}
      >
        <AboutSection />
      </div>

      {/* Card: Home */}
      <div
        id="home"
        className="snap-section shrink-0"
        style={{
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100%" : "100svh",
          overflowY: isMobile ? "auto" : undefined,
          scrollSnapAlign: "start",
          contentVisibility: "auto",
          containIntrinsicSize: isMobile ? "100vw 100dvh" : "100vw 100svh",
        }}
      >
        <HalftoneHero />
      </div>

      {/* Card: Projects */}
      <div
        id="projects"
        className="snap-section shrink-0 overflow-clip"
        style={{
          background: "var(--color-bg)",
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100%" : "100svh",
          overflowY: isMobile ? "auto" : undefined,
          scrollSnapAlign: "start",
          contentVisibility: "auto",
          containIntrinsicSize: isMobile ? "100vw 100dvh" : "100vw 100svh",
          scrollSnapStop: "always",
        }}
      >
        <ProjectsCard projects={projects} projectContent={projectContent} />
      </div>

      {/* Card: Creative Basement */}
      <div
        id="creative"
        className="snap-section shrink-0"
        style={{
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100%" : "100svh",
          overflowY: isMobile ? "auto" : undefined,
          scrollSnapAlign: "start",
          contentVisibility: "auto",
          containIntrinsicSize: isMobile ? "100vw 100dvh" : "100vw 100svh",
        }}
      >
        <CreativeBasement />
      </div>
    </div>
    </>
  );
}
