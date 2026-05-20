"use client";

import { motion } from "framer-motion";
import type { CellValue, Day, PropDef } from "@/lib/notion";
import { habitDef, gradCss, NOTION_COLOR_GRAD } from "./constants";

interface Props {
  days: Day[];
  total: number;
  habitProps: PropDef[]; // checkbox + select habits
  onOpenDay: (day: number) => void;
}

/* The fill colour for a day's habit dot — habit gradient for a ticked
   checkbox, the Notion option colour for a select that has a value. */
function dotFill(prop: PropDef, value: CellValue): string | undefined {
  if (prop.type === "checkbox") {
    return value === true ? gradCss(habitDef(prop.name).grad) : undefined;
  }
  if (prop.type === "select" && typeof value === "string") {
    const opt = prop.options?.find((o) => o.name === value);
    const grad = NOTION_COLOR_GRAD[opt?.color ?? "default"] ?? NOTION_COLOR_GRAD.default;
    return gradCss(grad);
  }
  return undefined;
}

/* Photo-grid stand-in for runs without a photo property. Each day is a
   square holding a mini grid of habit cells — filled with the habit's
   colour when done — so progress reads at a glance. Tap to open the day. */
export default function DayProgressGrid({ days, total, habitProps, onOpenDay }: Props) {
  const dayMap = new Map<number, Day>();
  for (const d of days) dayMap.set(d.day, d);

  const cols = habitProps.length <= 4 ? 2 : habitProps.length <= 9 ? 3 : 4;

  return (
    <div className="rb-photos">
      {Array.from({ length: total }, (_, i) => {
        const dayNum = i + 1;
        const day = dayMap.get(dayNum);
        const pad = String(dayNum).padStart(2, "0");
        return (
          <motion.button
            type="button"
            key={dayNum}
            className="rb-photo rb-progress-cell"
            onClick={() => onOpenDay(dayNum)}
            aria-label={`open day ${pad}`}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.05, zIndex: 2 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
          >
            <span
              className="rb-progress-mini"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {habitProps.map((p) => {
                const fill = dotFill(p, day?.values[p.name] ?? null);
                return (
                  <span
                    key={p.name}
                    className="rb-progress-dot"
                    style={fill ? { background: fill } : undefined}
                  />
                );
              })}
            </span>
            <span className="rb-photo-label">{pad}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
