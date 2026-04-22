"use client";

import { useState } from "react";
import Image from "next/image";

const ITEMS = [
  { src: "/images/keynotes/after-poster.jpeg", alt: "Keynotes — After Hours" },
  { src: "/images/keynotes/sols-poster.png", alt: "Keynotes — Solstice" },
  { src: "/images/keynotes/fin-poster.png", alt: "Keynotes — Finale" },
  { src: "/images/keynotes/wes-poster.png", alt: "Keynotes — Weston" },
  { src: "/images/keynotes/rec-poster.png", alt: "Keynotes — Recruitment" },
  { src: "/images/keynotes/face-prog.png", alt: "Keynotes — program design" },
  { src: "/images/keynotes/sols-prog.png", alt: "Keynotes — Solstice program" },
  { src: "/images/keynotes/fin-prog.png", alt: "Keynotes — Finale program" },
  { src: "/images/keynotes/rec-prog.png", alt: "Keynotes — Recruitment program" },
  { src: "/images/keynotes/wes-prog.png", alt: "Keynotes — Weston program" },
  { src: "/images/keynotes/face-jason.png", alt: "Keynotes — Jason" },
  { src: "/images/keynotes/after-aliyah.png", alt: "Keynotes — Aliyah" },
  { src: "/images/keynotes/fin-brandon.png", alt: "Keynotes — Brandon" },
  { src: "/images/keynotes/sols-mic.png", alt: "Keynotes — mic" },
  { src: "/images/keynotes/wes-vaness.png", alt: "Keynotes — Vaness" },
  { src: "/images/keynotes/rec-kyu.png", alt: "Keynotes — Kyu" },
  { src: "/images/keynotes/kyuho.jpg", alt: "Keynotes — Kyuho" },
  { src: "/images/nothing/cover.jpeg", alt: "NIEW — cover" },
  { src: "/images/nothing/cover-back.jpeg", alt: "NIEW — back cover" },
  { src: "/images/nothing/film.jpeg", alt: "NIEW — film" },
  { src: "/images/nothing/matchbox-exhibit.JPG", alt: "NIEW — matchbox exhibit" },
  { src: "/images/nothing/matchbox-close.JPG", alt: "NIEW — matchbox closeup" },
  { src: "/images/nothing/matchbox-flick.JPG", alt: "NIEW — matchbox flick" },
  { src: "/images/nothing/matchbox-hand.JPG", alt: "NIEW — matchbox hand" },
  { src: "/images/nothing/matchbox-poems.jpg", alt: "NIEW — matchbox poems" },
  { src: "/images/nothing/fortuneteller.jpg", alt: "NIEW — fortune teller" },
  { src: "/images/creative/zine.jpeg", alt: "Zine" },
  { src: "/images/creative/posters.jpeg", alt: "Poster designs" },
  { src: "/images/creative/photo-self.jpg", alt: "Self portrait" },
  { src: "/images/creative/photo-s.jpeg", alt: "Photography" },
  { src: "/images/creative/photo-a.jpeg", alt: "Photography" },
  { src: "/images/creative/photo-c.jpeg", alt: "Photography" },
  { src: "/images/creative/photo-n.jpeg", alt: "Photography" },
];

const ROWS = 3;
function splitIntoRows<T>(items: T[], numRows: number): T[][] {
  const rows: T[][] = Array.from({ length: numRows }, () => []);
  items.forEach((item, i) => rows[i % numRows].push(item));
  return rows;
}

function ImageCard({ item, onClick }: { item: typeof ITEMS[number]; onClick: () => void }) {
  return (
    <button
      className="group cursor-pointer overflow-hidden shrink-0 relative h-full"
      style={{ borderRadius: "var(--radius-sm)" }}
      onClick={onClick}
    >
      <Image
        src={item.src}
        alt={item.alt}
        width={400}
        height={560}
        sizes="(max-width: 768px) 35vw, 240px"
        quality={55}
        loading="lazy"
        draggable={false}
        className="h-full w-auto block group-hover:opacity-80 transition-opacity"
      />
      <div
        className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent 40%)",
          transition: "opacity 0.2s ease",
        }}
      >
        <span className="text-white text-xs" style={{ fontFamily: "var(--font-display)" }}>
          {item.alt}
        </span>
      </div>
    </button>
  );
}

export default function CreativeBasement() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const rows = splitIntoRows(ITEMS, ROWS);

  return (
    <div className="relative w-full h-full flex flex-col overflow-clip">
      <div className="flex-1 flex flex-col gap-2 justify-center py-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="overflow-x-auto overflow-y-hidden creative-row" style={{ height: "28vh", touchAction: "pan-y" }}>
            <div
              className="flex gap-2 px-2 h-full w-max creative-scroll"
              style={{
                animation: `scrollLoop${rowIdx} ${120 + rowIdx * 20}s linear infinite`,
              }}
            >
              {[...row, ...row].map((item, dupIdx) => {
                const globalIdx = ITEMS.indexOf(item);
                return (
                  <ImageCard
                    key={`${globalIdx}-${dupIdx}`}
                    item={item}
                    onClick={() => setLightbox(globalIdx)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightbox(null)}
        >
          <Image
            src={ITEMS[lightbox].src}
            alt={ITEMS[lightbox].alt}
            width={1600}
            height={2000}
            sizes="90vw"
            quality={85}
            priority
            draggable={false}
            className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain"
            style={{ animation: "suggestModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <p className="absolute bottom-8 text-white/70 text-xs" style={{ fontFamily: "var(--font-display)" }}>
            {ITEMS[lightbox].alt}
          </p>
        </div>
      )}
    </div>
  );
}
