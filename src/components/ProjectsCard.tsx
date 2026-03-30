"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProjectMeta } from "@/lib/content";

export default function ProjectsCard({
  projects,
  projectContent,
}: {
  projects: ProjectMeta[];
  projectContent: Record<string, React.ReactNode>;
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const isOpen = !!activeSlug;
  const activeProject = projects.find((p) => p.slug === activeSlug);

  return (
    <div
      className="h-full"
      style={{
        display: "grid",
        gridTemplateColumns: isOpen ? "320px 1fr 320px" : "1fr",
        fontFamily: "var(--font-display)",
      }}
    >
      {/* Project list / grid */}
      <div
        className="relative overflow-y-auto"
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
            className="pointer-events-none"
            style={{
              height: "2rem",
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
                  <div className="shrink-0 pt-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{
                        background: activeSlug === project.slug ? "var(--color-orange)" : "var(--color-border)",
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
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
      </div>

      {/* Project content — only when open */}
      {isOpen && (() => {
        return (
          <>
            <div
              className="relative overflow-y-auto"
              style={{
                paddingBottom: "var(--footer-safe)",
                animation: "expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              {/* Sticky project header */}
              <div
                className="sticky top-0 z-20"
                style={{ paddingTop: "var(--header-safe)", background: "var(--color-bg)" }}
              >
                <div className="flex justify-center" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                  <div style={{ width: "33rem", maxWidth: "100%" }}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveSlug(null)}
                        className="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
                      >
                        &larr; back
                      </button>
                      {activeProject?.timeline && (
                        <span className="text-muted text-xs">{activeProject.timeline.toLowerCase()}</span>
                      )}
                    </div>
                    <h2 className="subheading" style={{ paddingTop: "0.5rem", paddingBottom: "0.25rem" }}>
                      {activeProject?.title.toLowerCase()}
                    </h2>
                    {activeProject?.description && (
                      <p className="text-muted text-sm" style={{ paddingBottom: "0.25rem" }}>
                        {activeProject.description.toLowerCase()}
                      </p>
                    )}
                    {activeProject?.role && (
                      <p className="text-muted text-xs" style={{ paddingBottom: "0.25rem" }}>
                        {activeProject.role.toLowerCase()}
                        {activeProject.tools && activeProject.tools.length > 0 && (
                          <> · {activeProject.tools.join(", ").toLowerCase()}</>
                        )}
                      </p>
                    )}
                    {activeProject?.link && (
                      <a
                        href={activeProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs transition-colors"
                        style={{ color: "var(--color-orange)" }}
                      >
                        view project &rarr;
                      </a>
                    )}
                  </div>
                </div>
                <div
                  className="pointer-events-none"
                  style={{
                    height: "3rem",
                    background: "linear-gradient(to bottom, var(--color-bg) 20%, transparent)",
                  }}
                />
              </div>

              {/* Project body */}
              <div className="flex justify-center" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
                <div style={{ width: "33rem", maxWidth: "100%" }}>
                  {activeSlug && projectContent[activeSlug]}
                  <button
                    onClick={() => setActiveSlug(null)}
                    className="mt-8 mb-4 text-sm text-muted hover:text-fg transition-colors cursor-pointer"
                  >
                    &larr; back
                  </button>
                </div>
              </div>
            </div>
            <div />
          </>
        );
      })()}
    </div>
  );
}
