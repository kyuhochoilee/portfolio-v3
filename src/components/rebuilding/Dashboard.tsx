import Link from "next/link";
import type { Day, Schema, RunKey } from "@/lib/notion";
import { TOTAL_DAYS } from "@/lib/notion";
import HabitGrid from "./HabitGrid";
import PhotoGrid from "./PhotoGrid";
import WeightChart from "./WeightChart";
import Tabs from "./Tabs";

interface Props {
  run: RunKey;
  schema: Schema;
  days: Day[];
}

export default function Dashboard({ run, schema, days }: Props) {
  const today = days.length ? Math.max(...days.map((d) => d.day)) : 1;
  const baseHref = run === "kyu" ? "/rebuilding" : `/rebuilding/${run}`;

  // habit grids: every checkbox + every select
  const habitProps = [...schema.checkboxProps, ...schema.selectProps];

  // weight goal: hardcode 163 for kyu; let chart auto-range for others
  const weightGoal = run === "kyu" && schema.weightProp === "weight" ? 163 : undefined;

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

      <Tabs current={run} />

      <div className="rb-section-head"><h2>habits</h2></div>
      <div className="rb-habits">
        {habitProps.map((p) => (
          <HabitGrid key={p.name} prop={p} days={days} today={today} total={TOTAL_DAYS} />
        ))}
      </div>

      {schema.fileProp && (
        <>
          <div className="rb-section-head"><h2>photos</h2></div>
          <PhotoGrid days={days} total={TOTAL_DAYS} baseHref={baseHref} />
        </>
      )}

      {schema.numberProps
        .filter((p) => days.some((d) => typeof d.values[p.name] === "number"))
        .map((p) => (
          <div key={p.name}>
            <div className="rb-section-head"><h2>{p.name}</h2></div>
            <WeightChart
              days={days}
              total={TOTAL_DAYS}
              propName={p.name}
              goal={p.name === schema.weightProp ? weightGoal : undefined}
            />
          </div>
        ))}
    </div>
  );
}
