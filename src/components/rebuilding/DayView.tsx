import Link from "next/link";
import type { Day, Schema, RunKey } from "@/lib/notion";
import { TOTAL_DAYS, RUNS } from "@/lib/notion";
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
  run: RunKey;
  schema: Schema;
  day: Day;
  blocks: any[];
}

export default function DayView({ run, schema, day, blocks }: Props) {
  const pad = String(day.day).padStart(2, "0");
  const baseHref = run === "kyu" ? "/rebuilding" : `/rebuilding/${run}`;
  const prev = day.day > 1 ? String(day.day - 1).padStart(2, "0") : null;
  const next = day.day < TOTAL_DAYS ? String(day.day + 1).padStart(2, "0") : null;

  return (
    <div className="rb-wrap">
      <header className="rb-header">
        <Link href={baseHref} className="rb-brand rb-brand-link">
          <span className="rb-arrow">←</span>{RUNS[run].label}&apos;s rebuilding in 50
        </Link>
        <div className="rb-day-nav-top">
          {prev ? (
            <Link href={`${baseHref}/${prev}`} className="rb-nav-link" aria-label={`day ${prev}`}>
              ←
            </Link>
          ) : (
            <span className="rb-nav-spacer" />
          )}
          {next ? (
            <Link href={`${baseHref}/${next}`} className="rb-nav-link" aria-label={`day ${next}`}>
              →
            </Link>
          ) : (
            <span className="rb-nav-spacer" />
          )}
        </div>
      </header>

      <div className="rb-day-hero">
        <div className="rb-day-num">{pad}</div>
        <div className="rb-day-info">
          <div className="rb-day-title">{formatDate(day.date)}</div>
        </div>
      </div>

      <div className="rb-day-body">
        <aside className="rb-props">
          {schema.props
            .filter((p) => p.type !== "title")
            .map((p) => {
              const v = day.values[p.name];
              let content: React.ReactNode = <span className="rb-dim">—</span>;
              let valueColor: string | undefined;

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
                  valueColor = grad[1];
                  content = <span style={{ color: valueColor }}>{v}</span>;
                }
              } else if (p.type === "number") {
                if (typeof v === "number") content = <span>{v}</span>;
              } else if (p.type === "date") {
                content = day.date ? <span>{day.date}</span> : <span className="rb-dim">—</span>;
              } else if (p.type === "rich_text") {
                if (typeof v === "string" && v.trim()) content = <span className="rb-dim-text">{v.length > 40 ? v.slice(0, 40) + "…" : v}</span>;
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
          <DayBlocks blocks={blocks} />
        </div>
      </div>
    </div>
  );
}
