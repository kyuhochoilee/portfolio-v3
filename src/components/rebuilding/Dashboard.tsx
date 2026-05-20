"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Day, Schema, RunKey } from "@/lib/notion";
import { TOTAL_DAYS, RUNS } from "@/lib/notion";
import HabitGrid from "./HabitGrid";
import PhotoGrid from "./PhotoGrid";
import WeightChart from "./WeightChart";

interface Props {
  run: RunKey;
  schema: Schema;
  days: Day[];
  onOpenDay: (day: number) => void;
}

export default function Dashboard({ run, schema, days, onOpenDay }: Props) {
  const reduce = useReducedMotion();
  const today = days.length ? Math.max(...days.map((d) => d.day)) : 1;

  // habit grids: every checkbox + every select
  const habitProps = [...schema.checkboxProps, ...schema.selectProps];

  // weight goal: hardcode 163 for kyu; let chart auto-range for others
  const weightGoal = run === "kyu" && schema.weightProp === "weight" ? 163 : undefined;

  const sections = [
    <header className="rb-header" key="header">
      <Link href="/rebuilding/rules" className="rb-brand rb-brand-link">
        {RUNS[run].label}&apos;s rebuilding in 50
      </Link>
      <div className="rb-meta">
        day <b>{String(today).padStart(2, "0")}</b> of {TOTAL_DAYS}
      </div>
    </header>,

    <div key="habits">
      <div className="rb-section-head">
        <h2>habits</h2>
      </div>
      <div className="rb-habits">
        {habitProps.map((p) => (
          <HabitGrid key={p.name} prop={p} days={days} today={today} total={TOTAL_DAYS} />
        ))}
      </div>
    </div>,

    schema.fileProp ? (
      <div key="photos">
        <div className="rb-section-head">
          <h2>photos</h2>
          <span className="rb-hint">tap to open</span>
        </div>
        <PhotoGrid days={days} total={TOTAL_DAYS} onOpenDay={onOpenDay} />
      </div>
    ) : null,

    ...schema.numberProps
      .filter((p) => days.some((d) => typeof d.values[p.name] === "number"))
      .map((p) => (
        <div key={`num-${p.name}`}>
          <div className="rb-section-head">
            <h2>{p.name}</h2>
          </div>
          <WeightChart
            days={days}
            total={TOTAL_DAYS}
            propName={p.name}
            goal={p.name === schema.weightProp ? weightGoal : undefined}
          />
        </div>
      )),
  ].filter(Boolean);

  return (
    <div className="rb-wrap">
      {sections.map((node, i) => (
        <motion.div
          key={(node as React.ReactElement).key ?? i}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : 0.04 + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {node}
        </motion.div>
      ))}
    </div>
  );
}
