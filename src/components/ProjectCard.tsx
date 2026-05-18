"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProjectMeta } from "@/lib/content";

export default function ProjectCard({ project }: { project: ProjectMeta }) {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(
    project.featuredImage.split("?")[0]
  );
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-border bg-surface">
        {isVideo ? (
          <video
            src={project.featuredImage}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
          />
        ) : project.featuredImage ? (
          <>
            {!imgLoaded && <div className="img-skeleton absolute inset-0" aria-hidden="true" />}
            <Image
              src={project.featuredImage}
              alt={project.title}
              fill
              quality={65}
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setImgLoaded(true)}
              className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
              style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.25s ease" }}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-border text-muted text-sm">
            no image
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-base group-hover:opacity-60 transition-opacity" style={{ color: "var(--color-orange)" }}>
          {project.title.toLowerCase()}
        </h3>
        <p className="text-sm text-muted line-clamp-2">
          {project.description.toLowerCase()}
        </p>
      </div>
    </Link>
  );
}
