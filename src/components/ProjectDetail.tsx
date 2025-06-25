"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ProjectDetail as ProjectDetailType } from "@/lib/notion";
import {
  X,
  ExternalLink,
  Palette,
  Package,
  Code as CodeIcon,
  Star,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "react-notion-x/src/styles.css";

// Tag‑specific color classes and icons
const TAG_STYLES: Record<string, string> = {
  Creative: "bg-pink-100 text-pink-700",
  "Product Design": "bg-green-100 text-green-700",
  Code: "bg-blue-100 text-blue-700",
  Brand: "bg-orange-100 text-orange-700",
};

const TAG_ICONS: Record<string, React.ElementType | undefined> = {
  Creative: Palette,
  "Product Design": Package,
  Code: CodeIcon,
  Brand: Star,
};

// Dynamically import heavy third-party blocks only on the client
const NotionRenderer = dynamic(
  () => import("react-notion-x").then((m) => m.NotionRenderer),
  { ssr: false }
);
const Code = dynamic(
  () => import("react-notion-x/build/third-party/code").then((m) => m.Code),
  { ssr: false }
);
const Collection = dynamic(
  () =>
    import("react-notion-x/build/third-party/collection").then(
      (m) => m.Collection
    ),
  { ssr: false }
);
const Equation = dynamic(
  () =>
    import("react-notion-x/build/third-party/equation").then((m) => m.Equation),
  { ssr: false }
);
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  { ssr: false }
);

interface Props {
  project: ProjectDetailType;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: Props) {
  // Detect whether this pageContent is a raw Notion recordMap or static HTML
  const isStaticHtml =
    (project as any).pageContent &&
    (project as any).pageContent.type === "static";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={project.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 30,
          duration: 0.4,
        }}
        className="relative h-full w-full flex flex-col gap-6 overflow-hidden card-glass"
      >
        {/* Back button */}
        <button
          aria-label="Back"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-lg bg-gray-50 opacity-90 transition hover:bg-gray-100 border-gray-200 border-1"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>

        {/* Close button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-50 opacity-90 transition hover:bg-gray-100 border-gray-200 border-1"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Header & Detail */}
        <div className="flex-1 overflow-y-auto prose max-w-none flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            {project.headerImage && (
              <img src={project.headerImage} alt="" className="w-max" />
            )}
          </div>
          <div className="flex flex-col gap-2 px-4 sm:px-8 md:px-24 lg:px-56 mt-4">
            {/* Header section */}
            <div className="flex flex-col gap-0">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight leading-relaxed">
                {project.name}
              </h2>
              {project.description && (
                <h3 className="text-lg font-inter font-normal text-gray-500 max-w-prose text-md">
                  {project.description}
                </h3>
              )}
              {project.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                        TAG_STYLES[tag] ?? "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {TAG_ICONS[tag]
                        ? React.createElement(TAG_ICONS[tag]!, {
                            className: "w-3 h-3",
                          })
                        : null}
                      {tag}
                    </span>
                  ))}

                  {/* External link sits in‑line with the tags */}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 underline hover:no-underline text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View project
                    </a>
                  )}
                </div>
              )}
              <div className="h-px my-4 bg-gradient-to-r from-gray-300 to-transparent" />
              <div className="flex flex-col md:flex-row mb-3 gap-4 md:gap-8">
                {/* My Role */}
                {project.role && (
                  <div className="flex flex-row gap-4">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                      My Role
                    </div>
                    <div className="text-sm text-gray-700">{project.role}</div>
                  </div>
                )}

                {/* Tools */}
                {project.tools?.length ? (
                  <div className="flex flex-row gap-4">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                      Tools
                    </div>
                    <div className="text-sm text-gray-700">
                      {project.tools.join(", ")}
                    </div>
                  </div>
                ) : null}

                {/* Timeline */}
                {project.timeline?.length ? (
                  <div className="flex flex-row gap-4">
                    <div className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                      Timeline
                    </div>
                    <div className="text-sm text-gray-700">
                      {project.timeline}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Detailed content */}
            {isStaticHtml ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: (project as any).pageContent.html,
                }}
                className="project-detail"
              />
            ) : project.pageContent ? (
              <NotionRenderer
                recordMap={project.pageContent as any}
                fullPage={false}
                darkMode={false}
                components={{ Code, Collection, Equation, Modal }}
              />
            ) : (
              <p className="text-gray-500 text-sm">
                No detailed content available for this project.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
