"use client";

import { ProjectSummary } from "@/lib/notion";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  project: ProjectSummary;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  /* ——— NEW: decide if the media is a video ——— */
  const mediaSrc = project.featuredImage; // same prop for both
  const isVideo = mediaSrc
    ? /\.(mp4|webm|ogg)$/i.test(mediaSrc.split("?")[0])
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden border-1 border-gray-200 rounded-xl aspect-[1.8/1]"
    >
      <div className="relative w-full h-full group">
        {/* ——— NEW conditional: video first, else image ——— */}
        {isVideo && mediaSrc ? (
          <video
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="object-cover w-full h-full transition duration-300 group-hover:blur-xs"
          />
        ) : mediaSrc ? (
          <Image
            src={mediaSrc}
            alt={project.name}
            fill
            className="object-cover w-full h-full transition duration-300 group-hover:blur-xs"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
            <span>No image</span>
          </div>
        )}

        {/* overlay + arrow stay the same */}
        <div className="absolute inset-0 bg-black/30 text-white flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-lg font-black">{project.name}</h3>
          <p className="text-sm">{project.description}</p>
          {project.tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <ArrowUpRight className="absolute top-2 right-2 text-white w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
}
