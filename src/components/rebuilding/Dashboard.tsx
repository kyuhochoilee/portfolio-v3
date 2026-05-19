import Link from "next/link";
import type { Day } from "@/lib/notion";
import { TOTAL_DAYS } from "@/lib/notion";
import { HABITS } from "./constants";
import HabitGrid from "./HabitGrid";
import PhotoGrid from "./PhotoGrid";
import WeightChart from "./WeightChart";

interface Props {
  days: Day[];
}

export default function Dashboard({ days }: Props) {
  const today = days.length ? Math.max(...days.map((d) => d.day)) : 1;

  return (
    <div className="rb-wrap">
      <header className="rb-header">
        <Link href="/rebuilding/rules" className="rb-brand rb-brand-link">
          rebuilding in 50
        </Link>
        <div className="rb-meta">
          day <b>{String(today).padStart(2, "0")}</b> of {TOTAL_DAYS}
        </div>
      </header>

      <div className="rb-section-head">
        <h2>habits</h2>
      </div>
      <div className="rb-habits">
        {HABITS.map((h) => (
          <HabitGrid key={h.key} habit={h} days={days} today={today} total={TOTAL_DAYS} />
        ))}
      </div>

      <div className="rb-section-head">
        <h2>photos</h2>
      </div>
      <PhotoGrid days={days} total={TOTAL_DAYS} />

      <div className="rb-section-head">
        <h2>weight</h2>
      </div>
      <div className="rb-weight-wrap">
        <WeightChart days={days} total={TOTAL_DAYS} />
      </div>
    </div>
  );
}
