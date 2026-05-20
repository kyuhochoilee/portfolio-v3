"use client";

import type { Day, Schema } from "@/lib/notion";
import { NOTION_COLOR_GRAD, habitDef } from "./constants";
import DayBlocks from "./DayBlocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    .toLowerCase();
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

      <aside className="rb-props">
        {schema.props
          .filter((p) => p.type !== "title")
          .map((p) => {
            const v = values[p.name];
            let content: React.ReactNode = <span className="rb-dim">—</span>;

            if (p.type === "checkbox") {
              const def = habitDef(p.name);
              content =
                v === true ? (
                  <span style={{ color: def.color }}>✓</span>
                ) : (
                  <span className="rb-dim">—</span>
                );
            } else if (p.type === "select") {
              if (typeof v === "string") {
                const option = p.options?.find((o) => o.name === v);
                const color = option?.color ?? "default";
                const grad = NOTION_COLOR_GRAD[color] ?? NOTION_COLOR_GRAD.default;
                content = <span style={{ color: grad[1] }}>{v}</span>;
              }
            } else if (p.type === "number") {
              if (typeof v === "number") content = <span>{v}</span>;
            } else if (p.type === "date") {
              content = day?.date ? <span>{day.date}</span> : <span className="rb-dim">—</span>;
            } else if (p.type === "rich_text") {
              if (typeof v === "string" && v.trim())
                content = (
                  <span className="rb-dim-text">
                    {v.length > 40 ? v.slice(0, 40) + "…" : v}
                  </span>
                );
            }

            return (
              <div className="rb-prop" key={p.name}>
                <span className="rb-prop-k">{p.name}</span>
                <span className="rb-prop-v">{content}</span>
              </div>
            );
          })}
      </aside>

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
