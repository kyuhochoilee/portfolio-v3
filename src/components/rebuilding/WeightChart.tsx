import type { Day } from "@/lib/notion";

interface Props {
  days: Day[];
  total: number;
  propName: string;
  goal?: number;
  label?: string;
}

export default function WeightChart({ days, total, propName, goal, label }: Props) {
  const points = days
    .map((d) => ({ x: d.day, y: d.values[propName] }))
    .filter((p): p is { x: number; y: number } => typeof p.y === "number");

  if (points.length === 0) return null;

  const allYs = points.map((p) => p.y).concat(goal ? [goal] : []);
  const yMax = Math.ceil(Math.max(...allYs) + Math.abs(Math.max(...allYs)) * 0.02 + 1);
  const yMin = Math.floor(Math.min(...allYs) - Math.abs(Math.min(...allYs)) * 0.02 - 1);

  const PAD_T = 6;
  const PAD_B = 6;
  const innerH = 100 - PAD_T - PAD_B;

  const xPos = (day: number) => ((day - 1) / Math.max(1, total - 1)) * 100;
  const yPos = (val: number) => PAD_T + ((yMax - val) / (yMax - yMin)) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(p.x).toFixed(2)} ${yPos(p.y).toFixed(2)}`)
    .join(" ");

  const last = points[points.length - 1];
  const projection =
    goal != null && last
      ? `M ${xPos(last.x).toFixed(2)} ${yPos(last.y).toFixed(2)} L ${xPos(total).toFixed(2)} ${yPos(goal).toFixed(2)}`
      : null;

  const ticks = 4;
  const yLabels = Array.from({ length: ticks + 1 }, (_, i) => {
    const v = yMax - (i * (yMax - yMin)) / ticks;
    return { value: Math.round(v), top: yPos(v) };
  });

  const goalY = goal != null ? yPos(goal) : null;

  return (
    <div className="rb-weight-frame">
      {yLabels.map((l) => (
        <div key={l.value} className="rb-weight-y" style={{ top: `${l.top}%` }}>
          {l.value}
        </div>
      ))}
      <div className="rb-weight-inner">
        <svg className="rb-weight" viewBox="0 0 100 100" preserveAspectRatio="none">
          {yLabels.map((l) => (
            <line
              key={l.value}
              className="rb-weight-grid"
              x1={0}
              y1={l.top}
              x2={100}
              y2={l.top}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {goalY != null && (
            <line
              className="rb-weight-goal"
              x1={0}
              y1={goalY}
              x2={100}
              y2={goalY}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {projection && (
            <path className="rb-weight-projection" d={projection} vectorEffect="non-scaling-stroke" />
          )}
          {points.length > 1 && (
            <path className="rb-weight-line" d={linePath} vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {points.map((p, i) => (
          <div
            key={i}
            className="rb-weight-pt"
            style={{ left: `${xPos(p.x)}%`, top: `${yPos(p.y)}%` }}
          />
        ))}
        {goalY != null && (
          <div className="rb-weight-goal-label" style={{ top: `${goalY}%` }}>
            {label ? `${label} · ${goal}` : `goal · ${goal}`}
          </div>
        )}
      </div>
    </div>
  );
}
