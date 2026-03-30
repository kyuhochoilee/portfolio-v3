"use client";

import { useState } from "react";

interface CreativeItem {
  src: string;
  alt: string;
  w: number; // relative width
  h: number; // relative height
  x: number; // % from left
  y: number; // % from top
}

// Scattered layout — positions are percentages on a large canvas
const ITEMS: CreativeItem[] = [
  // Keynotes
  { src: "/images/keynotes/after-poster.jpeg", alt: "Keynotes — After Hours", w: 220, h: 300, x: 5, y: 8 },
  { src: "/images/keynotes/sols-poster.png", alt: "Keynotes — Solstice", w: 200, h: 280, x: 28, y: 3 },
  { src: "/images/keynotes/fin-poster.png", alt: "Keynotes — Finale", w: 210, h: 290, x: 55, y: 10 },
  { src: "/images/keynotes/wes-poster.png", alt: "Keynotes — Weston", w: 200, h: 280, x: 80, y: 5 },
  { src: "/images/keynotes/rec-poster.png", alt: "Keynotes — Recruitment", w: 200, h: 280, x: 105, y: 15 },
  { src: "/images/keynotes/face-prog.png", alt: "Keynotes — program", w: 320, h: 200, x: 15, y: 55 },
  { src: "/images/keynotes/sols-prog.png", alt: "Keynotes — Solstice program", w: 300, h: 190, x: 48, y: 50 },
  // Nothing is Ever Wrong
  { src: "/images/nothing/cover.jpeg", alt: "NIEW — cover", w: 250, h: 250, x: 85, y: 45 },
  { src: "/images/nothing/cover-back.jpeg", alt: "NIEW — back cover", w: 250, h: 250, x: 110, y: 50 },
  { src: "/images/nothing/matchbox-exhibit.JPG", alt: "NIEW — matchbox exhibit", w: 350, h: 230, x: 5, y: 85 },
  { src: "/images/nothing/matchbox-close.JPG", alt: "NIEW — matchbox closeup", w: 240, h: 240, x: 40, y: 82 },
  { src: "/images/nothing/fortuneteller.jpg", alt: "NIEW — fortune teller", w: 220, h: 300, x: 68, y: 78 },
  { src: "/images/nothing/film.jpeg", alt: "NIEW — film", w: 340, h: 200, x: 95, y: 85 },
  { src: "/images/nothing/long-front.png", alt: "NIEW — front", w: 160, h: 350, x: 130, y: 15 },
  // Creative / Zine
  { src: "/images/creative/zine.jpeg", alt: "Zine", w: 220, h: 280, x: 140, y: 70 },
  { src: "/images/creative/posters.jpeg", alt: "Poster designs", w: 340, h: 220, x: 10, y: 115 },
  { src: "/images/creative/photo-self.jpg", alt: "Self portrait", w: 220, h: 300, x: 45, y: 110 },
  { src: "/images/creative/photo-s.jpeg", alt: "Photography", w: 240, h: 240, x: 75, y: 115 },
  { src: "/images/creative/photo-a.jpeg", alt: "Photography", w: 240, h: 240, x: 105, y: 108 },
  { src: "/images/creative/photo-n.jpeg", alt: "Photography", w: 240, h: 240, x: 135, y: 112 },
];

// Canvas is larger than viewport — scroll in any direction
const CANVAS_W = 170; // % of viewport width
const CANVAS_H = 150; // % of viewport height

export default function CreativeBasement() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="relative w-full h-full overflow-auto" style={{ cursor: "grab" }}>
      {/* Section label — fixed in corner */}
      <div
        className="sticky top-0 left-0 z-10 p-6"
        style={{ pointerEvents: "none" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-purple)",
            pointerEvents: "auto",
          }}
        >
          creative basement
        </h2>
      </div>

      {/* Scrollable canvas */}
      <div
        className="relative"
        style={{
          width: `${CANVAS_W}vw`,
          height: `${CANVAS_H}vh`,
        }}
      >
        {ITEMS.map((item, i) => (
          <button
            key={i}
            className="absolute group cursor-pointer"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `clamp(${item.w * 0.55}px, ${item.w / 16}vw + ${item.w * 0.3}px, ${item.w}px)`,
              transform: `translate(-50%, -50%)`,
            }}
            onClick={() => setLightbox(i)}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full block shadow-md"
              loading="lazy"
              style={{
                transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease",
              }}
            />
            <div
              className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 50%)",
                transition: "opacity 0.2s ease",
              }}
            >
              <span
                className="text-white text-xs"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.alt}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={ITEMS[lightbox].src}
            alt={ITEMS[lightbox].alt}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            style={{
              animation: "suggestModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          <p
            className="absolute bottom-8 text-white/70 text-xs"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {ITEMS[lightbox].alt}
          </p>
        </div>
      )}
    </div>
  );
}
