"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";

const loadedSrcs = new Set<string>();

const ITEMS = [
  // === Spring 2022: West Coast Love ===
  { src: "/images/keynotes/wes-poster.jpg", alt: "West Coast Love — poster" },
  { src: "/images/keynotes/wes-spread.jpg", alt: "West Coast Love — spread" },
  { src: "/images/keynotes/wes-kyuho.jpg", alt: "West Coast Love — Kyuho" },
  { src: "/images/keynotes/wes-bill.jpg", alt: "West Coast Love — Bill" },
  { src: "/images/keynotes/wes-nessa.jpg", alt: "West Coast Love — Nessa" },
  { src: "/images/keynotes/wes-sops.jpg", alt: "West Coast Love — Sopranos" },

  // === Fall 2022: Finesse ===
  { src: "/images/keynotes/fin-poster.jpg", alt: "Finesse — poster" },
  { src: "/images/keynotes/fin-poster-h.jpg", alt: "Finesse — horizontal poster" },
  { src: "/images/keynotes/fin-anika.jpg", alt: "Finesse — Anika" },
  { src: "/images/keynotes/fin-danny.jpg", alt: "Finesse — Danny" },

  // === Fall 2023: Solstice ===
  { src: "/images/keynotes/sols-poster.jpg", alt: "Solstice — poster" },
  { src: "/images/keynotes/sols-group.jpg", alt: "Solstice — group" },
  { src: "/images/keynotes/sols-nessa.jpg", alt: "Solstice — Nessa" },
  { src: "/images/keynotes/sols-zara.jpg", alt: "Solstice — Zara" },

  // === Spring 2024: Face Card ===
  { src: "/images/keynotes/face-poster.jpg", alt: "Face Card — poster" },
  { src: "/images/keynotes/face-jason.jpg", alt: "Face Card — Jason" },

  // === Fall 2024: Re:collections ===
  { src: "/images/keynotes/rec-group.jpg", alt: "Re:collections — group" },
  { src: "/images/keynotes/rec-kyuho.jpg", alt: "Re:collections — Kyuho" },
  { src: "/images/keynotes/rec-zara.jpg", alt: "Re:collections — Zara" },

  // === Spring 2025: Afterglow ===
  { src: "/images/keynotes/aft-spread.jpg", alt: "Afterglow — spread" },
  { src: "/images/keynotes/aft-slide.jpg", alt: "Afterglow — slide" },

  // === Nothing Is Ever Wrong (zine + matchbox project) ===
  { src: "/images/nothing/cover.jpeg", alt: "NIEW — cover" },
  { src: "/images/nothing/cover-back.jpeg", alt: "NIEW — back cover" },
  { src: "/images/nothing/film.jpeg", alt: "NIEW — film" },
  { src: "/images/nothing/matchbox-exhibit.JPG", alt: "NIEW — matchbox exhibit" },
  { src: "/images/nothing/matchbox-close.JPG", alt: "NIEW — matchbox closeup" },
  { src: "/images/nothing/matchbox-flick.JPG", alt: "NIEW — matchbox flick" },
  { src: "/images/nothing/matchbox-hand.JPG", alt: "NIEW — matchbox hand" },
  { src: "/images/nothing/matchbox-poems.jpg", alt: "NIEW — matchbox poems" },
  { src: "/images/nothing/fortuneteller.jpg", alt: "NIEW — fortune teller" },

  // === Creative misc ===
  { src: "/images/creative/zine.jpeg", alt: "Zine" },
  { src: "/images/creative/posters.jpeg", alt: "Poster designs" },
  { src: "/images/creative/photo-self.jpg", alt: "Self portrait" },
  { src: "/images/creative/photo-s.jpeg", alt: "Sarah" },
  { src: "/images/creative/photo-a.jpeg", alt: "Andrea" },
  { src: "/images/creative/photo-c.jpeg", alt: "Callia" },
  { src: "/images/creative/photo-n.jpeg", alt: "Nikita" },
];

const ROWS = 3;
function splitIntoRows<T>(items: T[], numRows: number): T[][] {
  const rows: T[][] = Array.from({ length: numRows }, () => []);
  items.forEach((item, i) => rows[i % numRows].push(item));
  return rows;
}

const ImageCard = memo(function ImageCard({
  item,
  globalIdx,
  onSelect,
  eager,
}: {
  item: typeof ITEMS[number];
  globalIdx: number;
  onSelect: (idx: number) => void;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(() => loadedSrcs.has(item.src));

  const handleLoad = useCallback(() => {
    loadedSrcs.add(item.src);
    setLoaded(true);
  }, [item.src]);

  return (
    <button
      className="group cursor-pointer overflow-hidden shrink-0 relative h-full"
      style={{
        borderRadius: "var(--radius-sm)",
        aspectRatio: loaded ? undefined : "400 / 560",
      }}
      onClick={() => onSelect(globalIdx)}
    >
      {!loaded && (
        <div
          className="img-skeleton absolute inset-0 pointer-events-none"
          style={{ borderRadius: "var(--radius-sm)" }}
          aria-hidden="true"
        />
      )}
      <Image
        src={item.src}
        alt={item.alt}
        width={400}
        height={560}
        sizes="(max-width: 768px) 40vw, 240px"
        quality={75}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        onLoad={handleLoad}
        className="h-full w-auto block group-hover:opacity-80 transition-opacity"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.25s ease" }}
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
});

export default function CreativeBasement() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const rows = splitIntoRows(ITEMS, ROWS);
  const handleSelect = useCallback((idx: number) => setLightbox(idx), []);
  const handleClose = useCallback(() => setLightbox(null), []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-clip">
      <div className="flex-1 flex flex-col gap-2 justify-center py-2">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="overflow-x-auto overflow-y-hidden creative-row"
            style={{
              height: "28vh",
              // Only claim horizontal panning — vertical swipes/wheel bubble to
              // the parent snap scroller so the user can leave the section.
              touchAction: "pan-x",
              // Contain only the x-axis: horizontal overscroll inside the row
              // must not chain into the parent (mobile is x-mandatory snap,
              // which would otherwise page-swipe). Vertical scroll bubbles.
              overscrollBehaviorX: "contain",
            }}
          >
            <div className="flex gap-2 px-2 h-full w-max">
              {row.map((item, idx) => {
                const globalIdx = ITEMS.indexOf(item);
                const eager = idx < 3;
                return (
                  <ImageCard
                    key={globalIdx}
                    item={item}
                    globalIdx={globalIdx}
                    onSelect={handleSelect}
                    eager={eager}
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
          onClick={handleClose}
        >
          {/* Use a plain <img> so the lightbox serves the source file at full
              resolution. Next/Image's srcset picks variants based on layout
              width, which under-served when the image is height-constrained
              (portrait photos in a max-h container). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ITEMS[lightbox].src}
            alt={ITEMS[lightbox].alt}
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
