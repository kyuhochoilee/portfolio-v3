import Link from "next/link";
import type { Day } from "@/lib/notion";
import { TOTAL_DAYS } from "@/lib/notion";
import { HABITS, sleepTier, eatingTier } from "./constants";
import DayBlocks from "./DayBlocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toLowerCase();
}

interface Props {
  day: Day;
  blocks: any[];
}

export default function DayView({ day, blocks }: Props) {
  const pad = String(day.day).padStart(2, "0");
  const sleepLabel = day.sleep || "—";
  const eatingLabel = day.eating || "—";

  const sleepT = sleepTier(day.sleep);
  const eatingT = eatingTier(day.eating);
  const sleepColor =
    sleepT === "good" ? "var(--rb-good)" : sleepT === "mid" ? "var(--rb-mid)" : sleepT === "bad" ? "var(--rb-bad)" : "var(--rb-ink-dimmer)";
  const eatingColor =
    eatingT === "good" ? "var(--rb-good)" : eatingT === "mid" ? "var(--rb-mid)" : eatingT === "bad" ? "var(--rb-bad)" : "var(--rb-ink-dimmer)";

  const prev = day.day > 1 ? String(day.day - 1).padStart(2, "0") : null;
  const next = day.day < TOTAL_DAYS ? String(day.day + 1).padStart(2, "0") : null;

  return (
    <div className="rb-wrap">
      <header className="rb-header">
        <Link href="/rebuilding" className="rb-brand rb-brand-link">
          <span className="rb-arrow">←</span>rebuilding in 50
        </Link>
        <div className="rb-day-nav-top">
          {prev ? (
            <Link href={`/rebuilding/${prev}`} className="rb-nav-link" aria-label={`day ${prev}`}>
              ←
            </Link>
          ) : (
            <span className="rb-nav-spacer" />
          )}
          {next ? (
            <Link href={`/rebuilding/${next}`} className="rb-nav-link" aria-label={`day ${next}`}>
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
          <div className="rb-prop">
            <span className="rb-prop-k">weight</span>
            <span className="rb-prop-v">
              {typeof day.weight === "number" ? `${day.weight} lbs` : <span className="rb-dim">—</span>}
            </span>
          </div>
          <div className="rb-prop">
            <span className="rb-prop-k">sleep</span>
            <span className="rb-prop-v" style={{ color: sleepColor }}>{sleepLabel}</span>
          </div>
          <div className="rb-prop">
            <span className="rb-prop-k">eating</span>
            <span className="rb-prop-v" style={{ color: eatingColor }}>{eatingLabel}</span>
          </div>
          {HABITS.filter((h) => h.key !== "sleep" && h.key !== "eating").map((h) => {
            const done = day.checks[h.key as keyof typeof day.checks];
            return (
              <div className="rb-prop" key={h.key}>
                <span className="rb-prop-k">{h.label}</span>
                <span className="rb-prop-v" style={{ color: done ? h.color : "var(--rb-ink-dimmer)" }}>
                  {done ? "✓" : "—"}
                </span>
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
