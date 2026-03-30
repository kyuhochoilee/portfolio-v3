"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import { ProjectSummary } from "@/lib/notion";

interface ProjectGridProps {
  projects: ProjectSummary[];
  selectedProject: ProjectSummary | null;
  setSelectedProject: (project: ProjectSummary | null) => void;
}

export default function ProjectGrid({
  projects,
  selectedProject,
  setSelectedProject,
}: ProjectGridProps) {
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags || []))
  ).sort();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredProjects =
    selectedTag === null
      ? projects
      : projects.filter((p) => p.tags?.includes(selectedTag));

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden card-glass p-4 sm:p-5">
      <h2 className="text-xl font-semibold text-gray-600 tracking-tight leading-relaxed">
        Selected Works
      </h2>
      <div className="flex transition-all duration-300 h-[calc(100vh-32px)]">
        <div
          className={`flex flex-col gap-4 h-full w-full transition-all duration-300`}
        >
          <div className="sticky top-0 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full border transition-colors
  ${
    selectedTag === null
      ? "bg-white text-gray-900 border-gray-400"
      : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-100"
  }`}
            >
              All Categories
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTag((prev) => (prev === tag ? null : tag))
                }
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full border transition-colors
  ${
    selectedTag === tag
      ? "bg-white text-gray-900 border-gray-400"
      : "bg-transparent text-gray-500 border-gray-200 hover:bg-gray-100"
  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="overflow-y-scroll pb-17 flex-grow scrollbar-hide">
            <div
              className={`grid gap-4 overflow-hidden mb-4 ${
                selectedProject ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="cursor-pointer relative w-full overflow-hidden"
                >
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
