"use client";

import type { CellValue, Day, PropDef, Schema } from "@/lib/notion";
import { NOTION_COLOR_GRAD, habitDef } from "./constants";
import { getIcon } from "./icons";
import DayBlocks from "./DayBlocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toLowerCase();
}

const TYPE_ORDER: Record<string, number> = { checkbox: 0, select: 1, number: 2 };

/* One property as a compact pill — icon + state. Reuses the habit icon/colour
   vocabulary from the dashboard so a day reads at a glance. */
function Pill({ prop, value }: { prop: PropDef; value: CellValue }) {
  const def = habitDef(prop.name);
  const Icon = getIcon(def.icon);

  if (prop.type === "checkbox") {
    const done = value === true;
    return (
      <span
        className={`rb-pill ${done ? "rb-pill-on" : ""}`}
        style={done ? { background: def.color + "1f", color: def.color } : undefined}
      >
        <Icon size={11} strokeWidth={2.5} />
        <span className="rb-pill-label">{prop.name}</span>
      </span>
    );
  }

  if (prop.type === "select") {
    const has = typeof value === "string";
    const opt = has ? prop.options?.find((o) => o.name === value) : undefined;
    const grad = NOTION_COLOR_GRAD[opt?.color ?? "default"] ?? NOTION_COLOR_GRAD.default;
    return (
      <span className={`rb-pill rb-pill-stat ${has ? "" : "rb-pill-empty"}`}>
        <Icon size={11} strokeWidth={2.5} style={{ color: def.color }} />
        <span className="rb-pill-label" style={has ? { color: grad[1] } : undefined}>
          {has ? (value as string) : prop.name}
        </span>
      </span>
    );
  }

  // number
  const has = typeof value === "number";
  return (
    <span className={`rb-pill rb-pill-stat ${has ? "" : "rb-pill-empty"}`}>
      <Icon size={11} strokeWidth={2.5} style={{ color: def.color }} />
      <span className="rb-pill-label">{has ? (value as number) : prop.name}</span>
    </span>
  );
}

interface Props {
  schema: Schema;
  dayNum: number;
  day: Day | null;
  blocks: any[] | null; // null → not loaded yet
  loading: boolean;
}

/* One day's content — the scrollable page inside the sheet pager. */
export default function DayCard({ schema, dayNum, day, blocks, loading }: Props) {
  const pad = String(dayNum).padStart(2, "0");
  const values = day?.values ?? {};

  // checkbox / select / number only — title, date (shown in the hero) and
  // files are dropped so nothing is repeated.
  const pills = schema.props
    .filter((p) => p.type === "checkbox" || p.type === "select" || p.type === "number")
    .sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9));

  return (
    <div className="rb-daycard-scroll">
      <div className="rb-day-hero">
        <div className="rb-day-num">{pad}</div>
        <div className="rb-day-info">
          <div className="rb-day-title">
            {day?.date ? formatDate(day.date) : <span className="rb-dim">no entry yet</span>}
          </div>
        </div>
      </div>

      <div className="rb-pills">
        {pills.map((p) => (
          <Pill key={p.name} prop={p} value={values[p.name] ?? null} />
        ))}
      </div>

      <div className="rb-day-right">
        {blocks && blocks.length > 0 ? (
          <DayBlocks blocks={blocks} />
        ) : loading ? (
          <div className="rb-skeleton" aria-hidden>
            <span className="rb-skeleton-line" style={{ width: "92%" }} />
            <span className="rb-skeleton-line" style={{ width: "78%" }} />
            <span className="rb-skeleton-line" style={{ width: "85%" }} />
            <span className="rb-skeleton-line" style={{ width: "60%" }} />
          </div>
        ) : (
          <p className="rb-block-empty">nothing logged for this day</p>
        )}
      </div>
    </div>
  );
}
