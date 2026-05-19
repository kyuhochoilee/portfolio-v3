import type { Day } from "@/lib/notion";
import {
  HABITS,
  TIER_GRAD,
  sleepTier,
  eatingTier,
  gradCss,
  type HabitDef,
} from "./constants";
import { ICONS } from "./icons";

interface Props {
  habit: HabitDef;
  days: Day[];
  today: number; // day number we're on
  total: number;
}

function cellState(habit: HabitDef, day: Day | undefined): { done: boolean; gradient: string | null } {
  if (!day) return { done: false, gradient: null };
  if (habit.key === "sleep") {
    const t = sleepTier(day.sleep);
    return t ? { done: true, gradient: gradCss(TIER_GRAD[t]) } : { done: false, gradient: null };
  }
  if (habit.key === "eating") {
    const t = eatingTier(day.eating);
    return t ? { done: true, gradient: gradCss(TIER_GRAD[t]) } : { done: false, gradient: null };
  }
  const checked = day.checks[habit.key as keyof typeof day.checks];
  return checked ? { done: true, gradient: gradCss(habit.grad) } : { done: false, gradient: null };
}

export default function HabitGrid({ habit, days, today, total }: Props) {
  const dayMap = new Map<number, Day>();
  for (const d of days) dayMap.set(d.day, d);

  const cells: React.ReactNode[] = [];
  let completed = 0;
  for (let d = 1; d <= total; d++) {
    const isFuture = d > today;
    const day = dayMap.get(d);
    const { done, gradient } = cellState(habit, day);
    if (done) completed++;
    const classes = ["rb-cell"];
    if (isFuture) classes.push("rb-cell-future");
    if (d === today) classes.push("rb-cell-today");
    cells.push(
      <div
        key={d}
        className={classes.join(" ")}
        style={gradient ? { background: gradient } : undefined}
      />,
    );
  }

  const Icon = ICONS[habit.icon];

  return (
    <div className="rb-habit">
      <div className="rb-habit-head">
        <span className="rb-habit-icon" style={{ color: habit.color }}>
          {Icon && <Icon size={12} strokeWidth={2} fill="currentColor" />}
        </span>
        <span className="rb-habit-name">{habit.label}</span>
        <span className="rb-habit-count">{completed}/{total}</span>
      </div>
      <div className="rb-grid">{cells}</div>
    </div>
  );
}
