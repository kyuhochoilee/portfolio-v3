// src/components/HomeContent.tsx
"use client";

import { useState } from "react";
import { ProjectSummary } from "@/lib/notion";
import ProjectGrid from "./ProjectGrid";
import NameCard from "@/components/NameCard";
import ResumeCard from "./ResumeCard";
import ProjectDetailComponent from "@/components/ProjectDetail";
import type { ProjectDetail as ProjectDetailData } from "@/lib/notion";

import { useEffect } from "react";
import { staticProjectDetails, staticProjects } from "@/data/staticProjects";

interface HomeContentProps {
  resolvedProjects: ProjectSummary[];
}

export default function HomeContent({ resolvedProjects }: HomeContentProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(
    null
  );
  const [detailProject, setDetailProject] = useState<ProjectDetailData | null>(
    null
  );

  useEffect(() => {
    if (selectedProject) {
      // Try to find expanded data in static map; otherwise just use the summary
      const detail =
        staticProjectDetails[selectedProject.slug] ??
        (selectedProject as unknown as ProjectDetailData);
      setDetailProject(detail);
    } else {
      setDetailProject(null);
    }
  }, [selectedProject]);

  // Fallback to the hard‑coded static list if the Notion fetch returns empty
  const projectsToShow =
    resolvedProjects && resolvedProjects.length > 0
      ? resolvedProjects
      : staticProjects;

  return (
    <div className="font-base tracking-tight leading-relaxed font-medium">
      <div
        className="fixed inset-0 -z-10 animate-[pulse_8s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(95.29% 95.18% at 90.54% 4.84%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 214, 230, 0.20) 36.97%, rgba(255, 208, 208, 0.20) 68.05%, rgba(255, 201, 239, 0.20) 95.11%), #F6F6F6`,
        }}
      ></div>

      {/* Mobile — NameCard at very top */}
      {!selectedProject && (
        <div className="block md:hidden mt-4 px-4">
          <NameCard />
        </div>
      )}

      <main className="flex flex-col md:flex-row w-full h-auto md:h-screen p-2.5">
        <div
          className={`${
            detailProject ? "w-0 md:w-0 border-0" : "w-full md:w-2/7 sm:p-2"
          } order-2 md:order-1 transition-all duration-300 overflow-hidden`}
        >
          {/* Sidebar – visible only on md+ */}
          {!selectedProject && (
            <div className="hidden md:flex h-full flex-col items-start gap-4">
              <NameCard />
              <ResumeCard />
            </div>
          )}
        </div>

        <div
          className={`${
            detailProject ? "w-full p-2" : "w-full md:w-5/7 p-2 h-full"
          } order-1 md:order-2`}
        >
          {projectsToShow.length === 0 ? (
            <div className="h-full overflow-hidden card-glass p-6">
              <p>No projects found.</p>
              <p>
                Make sure your Notion database is set up correctly and has
                published projects.
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row h-full gap-4">
              {/* Grid Area */}
              <div
                className={`${
                  detailProject ? "hidden md:block lg:w-2/7" : "w-full"
                } h-full`}
              >
                <ProjectGrid
                  projects={projectsToShow}
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                />
              </div>
              {/* Detail Area */}
              {detailProject && (
                <div className="w-full border-gray-200 overflow-y-auto">
                  <ProjectDetailComponent
                    project={detailProject}
                    onClose={() => setSelectedProject(null)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile — ResumeCard at very bottom */}
      {!selectedProject && (
        <div className="block md:hidden mb-4 px-4">
          <ResumeCard />
        </div>
      )}
    </div>
  );
}
