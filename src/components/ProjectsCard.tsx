"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useScrollContext } from "@/context/ScrollContext";
import type { ProjectMeta } from "@/lib/content";

export default function ProjectsCard({
  projects,
  projectContent,
}: {
  projects: ProjectMeta[];
  projectContent: Record<string, React.ReactNode>;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { registerDetailBack, unregisterDetailBack } = useScrollContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const isOpen = !!activeSlug;
  const activeProject = projects.find((p) => p.slug === activeSlug);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll content to top when switching projects
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeSlug]);

  useEffect(() => {
    if (isMobile && isOpen) {
      registerDetailBack("projects", () => setActiveSlug(null));
    } else {
      unregisterDetailBack("projects");
    }
    return () => unregisterDetailBack("projects");
  }, [isMobile, isOpen, registerDetailBack, unregisterDetailBack]);

  return (
    <div
      className="h-full"
      style={{
        display: "grid",
        gridTemplateColumns: isOpen && !isMobile ? "320px 1fr 320px" : "1fr",
        fontFamily: "var(--font-display)",
      }}
    >
      {/* Project list / grid — hidden on mobile when project is open */}
      {!(isMobile && isOpen) && <div
        className={`relative ${isMobile ? "overflow-hidden" : "overflow-y-auto"}`}
        style={{
          paddingBottom: "var(--footer-safe)",
          paddingLeft: isOpen ? "2rem" : "1.5rem",
          paddingRight: isOpen ? "0.75rem" : "1.5rem",
        }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-20"
          style={{ paddingTop: "var(--header-safe)", background: "var(--color-bg)" }}
        >
          <div
            style={{
              width: isOpen ? "100%" : "56rem",
              maxWidth: "100%",
              margin: isOpen ? "0" : "0 auto",
            }}
          >
            <h2 className="subheading" style={{ paddingBottom: "0.25rem" }}>selected work</h2>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)", paddingBottom: "0.75rem" }}>
              things i&apos;ve built
            </p>
          </div>
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: "-1rem",
              height: "1rem",
              background: "linear-gradient(to bottom, var(--color-bg), transparent)",
            }}
          />
        </div>

        {/* Content area */}
        <div
          style={{
            width: isOpen ? "100%" : "56rem",
            maxWidth: "100%",
            margin: isOpen ? "0" : "0 auto",
            paddingTop: "0.5rem",
          }}
        >
          {isOpen ? (
            // Collapsed timeline list
            <div className="relative" style={{ marginLeft: "2px" }}>
              <div
                className="absolute left-[2.5px] top-0 bottom-0 w-px"
                style={{ background: "var(--color-border)" }}
              />
              {projects.map((project) => (
                <button
                  key={project.slug}
                  onClick={() => setActiveSlug(activeSlug === project.slug ? null : project.slug)}
                  className="group flex items-start gap-3 w-full text-left cursor-pointer py-2"
                >
                  <div className="shrink-0 pt-1.5 relative z-10">
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{
                        background: activeSlug === project.slug ? "var(--color-orange)" : "var(--color-bg)",
                        border: activeSlug === project.slug ? "none" : "1.5px solid var(--color-border)",
                      }}
                    />
                  </div>
                  <span
                    className="text-sm transition-colors"
                    style={{ color: activeSlug === project.slug ? "var(--color-orange)" : "var(--color-fg)" }}
                  >
                    {project.title.toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            // Grid with images
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const isVideo = /\.(mp4|webm|ogg)$/i.test(project.featuredImage?.split("?")[0] || "");
                return (
                  <button
                    key={project.slug}
                    onClick={() => setActiveSlug(project.slug)}
                    className="group block text-left cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface mb-2">
                      {isVideo ? (
                        <video
                          src={project.featuredImage}
                          autoPlay loop muted playsInline preload="auto"
                          className="h-full w-full object-cover scale-[1.15] transition-transform duration-500 group-hover:scale-[1.18]"
                        />
                      ) : project.featuredImage ? (
                        <Image
                          src={project.featuredImage}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-border text-muted text-sm">
                          no image
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm" style={{ color: "var(--color-orange)" }}>
                      {project.title.toLowerCase()}
                    </h3>
                    <p className="text-xs text-muted line-clamp-1">
                      {project.description?.toLowerCase()}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>}

      {/* Project content — only when open */}
      {isOpen && (() => {
        return (
          <>
            <div
              ref={contentRef}
              className="relative overflow-y-auto mx-auto w-full"
              style={{
                paddingBottom: "var(--footer-safe)",
                animation: "expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                overscrollBehavior: "auto",
                maxWidth: isMobile ? "36rem" : undefined,
                paddingLeft: isMobile ? "1.5rem" : undefined,
                paddingRight: isMobile ? "1.5rem" : undefined,
              }}
            >
              {/* Project header — article style, scrolls with content */}
              <div style={{ paddingTop: "var(--header-safe)" }}>
                <div className="flex justify-center" style={{ paddingLeft: isMobile ? 0 : "1.5rem", paddingRight: isMobile ? 0 : "1.5rem" }}>
                  <div style={{ width: isMobile ? "100%" : "33rem", maxWidth: "100%" }}>
                    {/* Header image */}
                    {activeProject?.headerImage && (
                      <div className="relative aspect-[16/10] mb-6 overflow-hidden" style={{ borderRadius: "var(--radius-md)" }}>
                        <img
                          src={activeProject.headerImage}
                          alt={activeProject.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title — centered */}
                    <h2 className="subheading text-center" style={{ paddingBottom: "0.5rem" }}>
                      {activeProject?.title.toLowerCase()}
                    </h2>

                    {/* Description — centered */}
                    {activeProject?.description && (
                      <p className="text-muted text-sm text-center" style={{ paddingBottom: "0.5rem" }}>
                        {activeProject.description.toLowerCase()}
                      </p>
                    )}

                    {/* Metadata — centered */}
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
                      {activeProject?.role && <span>{activeProject.role.toLowerCase()}</span>}
                      {activeProject?.role && activeProject?.timeline && <span>·</span>}
                      {activeProject?.timeline && <span>{activeProject.timeline.toLowerCase()}</span>}
                    </div>

                    {/* Tags + link — centered */}
                    {((activeProject?.tags?.length ?? 0) > 0 || activeProject?.link) && (
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        {activeProject?.tags?.map((tag) => (
                          <span key={tag} className="text-xs" style={{ color: "var(--color-purple)" }}>
                            #{tag.toLowerCase()}
                          </span>
                        ))}
                        {activeProject?.link && (
                          <a
                            href={activeProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs transition-colors"
                            style={{ color: "var(--color-purple)" }}
                          >
                            view project &rarr;
                          </a>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div
                      className="mx-auto"
                      style={{
                        width: "3rem",
                        height: "1px",
                        background: "var(--color-border)",
                        marginTop: "1.5rem",
                        marginBottom: "1.5rem",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Project body */}
              <div className="flex justify-center" style={{ paddingLeft: isMobile ? 0 : "1.5rem", paddingRight: isMobile ? 0 : "1.5rem" }}>
                <div style={{ width: isMobile ? "100%" : "33rem", maxWidth: "100%" }}>
                  {activeSlug && projectContent[activeSlug]}
                </div>
              </div>
            </div>
            {!isMobile && <div />}
          </>
        );
      })()}
    </div>
  );
}
