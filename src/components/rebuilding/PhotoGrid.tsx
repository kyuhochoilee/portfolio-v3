"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Day } from "@/lib/notion";

interface Props {
  days: Day[];
  total: number;
  onOpenDay: (day: number) => void;
}

export default function PhotoGrid({ days, total, onOpenDay }: Props) {
  const dayMap = new Map<number, Day>();
  for (const d of days) dayMap.set(d.day, d);

  return (
    <div className="rb-photos">
      {Array.from({ length: total }, (_, i) => {
        const dayNum = i + 1;
        const day = dayMap.get(dayNum);
        const photo = day?.photos?.[0];
        const pad = String(dayNum).padStart(2, "0");
        return (
          <motion.button
            type="button"
            key={dayNum}
            className={`rb-photo ${photo ? "rb-photo-has" : ""}`}
            onClick={() => onOpenDay(dayNum)}
            aria-label={`open day ${pad}`}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.05, zIndex: 2 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
          >
            {photo && (
              <Image
                src={photo}
                alt={`day ${pad}`}
                fill
                sizes="(max-width: 640px) 20vw, 100px"
                style={{ objectFit: "cover" }}
              />
            )}
            <span className="rb-photo-label">{pad}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
