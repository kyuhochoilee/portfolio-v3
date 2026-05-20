import type { Day, PropDef } from "@/lib/notion";
import {
  habitDef,
  NOTION_COLOR_GRAD,
  gradCss,
} from "./constants";
import { getIcon } from "./icons";

interface Props {
  prop: PropDef;
  days: Day[];
  today: number;
  total: number;
}

interface CellRender {
  done: boolean;
  gradient: string | null;
}

function cellFor(prop: PropDef, value: unknown): CellRender {
  if (prop.type === "checkbox") {
    if (value === true) {
      const def = habitDef(prop.name);
      return { done: true, gradient: gradCss(def.grad) };
    }
    return { done: false, gradient: null };
  }
  if (prop.type === "select") {
    if (typeof value !== "string") return { done: false, gradient: null };
    const option = prop.options?.find((o) => o.name === value);
    const color = option?.color ?? "default";
    const grad = NOTION_COLOR_GRAD[color] ?? NOTION_COLOR_GRAD.default;
    return { done: true, gradient: gradCss(grad) };
  }
  return { done: false, gradient: null };
}

export default function HabitGrid({ prop, days, today, total }: Props) {
  const dayMap = new Map<number, Day>();
  for (const d of days) dayMap.set(d.day, d);

  const def = habitDef(prop.name);
  const Icon = getIcon(def.icon);

  let completed = 0;
  const cells: React.ReactNode[] = [];
  for (let d = 1; d <= total; d++) {
    const isFuture = d > today;
    const day = dayMap.get(d);
    const { done, gradient } = isFuture
      ? { done: false, gradient: null }
      : cellFor(prop, day?.values[prop.name]);
    if (done) completed++;
    const cls = [
      "rb-cell",
      isFuture && "rb-cell-future",
      d === today && "rb-cell-today",
    ]
      .filter(Boolean)
      .join(" ");
    cells.push(
      <div
        key={d}
        className={cls}
        style={gradient ? { background: gradient } : undefined}
      />,
    );
  }

  return (
    <div className="rb-habit">
      <div className="rb-habit-head">
        <span className="rb-habit-icon" style={{ color: def.color }}>
          <Icon size={12} strokeWidth={2} fill="currentColor" />
        </span>
        <span className="rb-habit-name">{def.label}</span>
        <span className="rb-habit-count">{completed}/{total}</span>
      </div>
      <div className="rb-grid">{cells}</div>
    </div>
  );
}
