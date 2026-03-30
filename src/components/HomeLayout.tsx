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
  const { scrollerRef: scrollRef } = useScrollContext();
  const currentSection = useRef("home");
  const isProgrammatic = useRef(false);
  const [ready, setReady] = useState(false);

  // Scroll to a section by ID, optionally with smooth behavior
  const scrollToSection = useCallback((id: string, smooth = false) => {
    const scroller = scrollRef.current;
    const el = document.getElementById(id);
    if (!scroller || !el) return;

    // Reset inner scroll to top
    if (el.scrollTop > 0) {
      el.scrollTop = 0;
    }

    isProgrammatic.current = true;
    if (!smooth) {
      scroller.style.scrollBehavior = "auto";
    }
    scroller.scrollTop = el.offsetTop;
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
        // Small delay to ensure scroll has settled
        setTimeout(() => setReady(true), 50);
      });
    });

    // Clean up URL to just hash
    const cleanUrl = initial === "home" ? "/" : `/#${initial}`;
    window.history.replaceState({ section: initial }, "", cleanUrl);

    // Track scroll position → update URL + history
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollCenter = scroller.scrollTop + window.innerHeight / 2;

        let active = "home";
        for (const id of SECTIONS) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (scrollCenter >= el.offsetTop && scrollCenter < el.offsetTop + el.offsetHeight) {
            active = id;
            break;
          }
        }

        if (active !== currentSection.current && !isProgrammatic.current) {
          // Reset the new section's inner scroll to top
          const activeEl = document.getElementById(active);
          if (activeEl) {
            activeEl.scrollTop = 0;
            // Also reset any scrollable children
            activeEl.querySelectorAll('[class*="overflow-y"]').forEach((child) => {
              (child as HTMLElement).scrollTop = 0;
            });
          }
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
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
    };
  }, [scrollToSection]);

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
        className="h-screen overflow-y-auto snap-mandatory-desktop"
        style={{
          scrollSnapType: "y proximity",
          scrollBehavior: "smooth",
        }}
      >
      {/* Card: Thoughts */}
      <div
        id="thoughts"
        className="h-screen w-full shrink-0 overflow-hidden"
        style={{ scrollSnapAlign: "start", background: "var(--color-bg)" }}
      >
        <ThoughtsCard posts={posts} blogContent={blogContent} />
      </div>

      {/* Card: About */}
      <div
        id="about"
        className="h-screen w-full shrink-0"
        style={{ scrollSnapAlign: "start" }}
      >
        <AboutSection />
      </div>

      {/* Card: Home */}
      <div
        id="home"
        className="h-screen w-full shrink-0"
        style={{ scrollSnapAlign: "start" }}
      >
        <HalftoneHero />
      </div>

      {/* Card: Projects */}
      <div
        id="projects"
        className="h-screen w-full shrink-0 overflow-hidden"
        style={{ scrollSnapAlign: "start", scrollSnapStop: "always", background: "var(--color-bg)" }}
      >
        <ProjectsCard projects={projects} projectContent={projectContent} />
      </div>

      {/* Card: Creative Basement */}
      <div
        id="creative"
        className="h-screen w-full shrink-0"
        style={{ scrollSnapAlign: "start" }}
      >
        <CreativeBasement />
      </div>
    </div>
    </>
  );
}
