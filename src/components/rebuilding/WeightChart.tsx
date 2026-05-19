import type { Day } from "@/lib/notion";

interface Props {
  days: Day[];
  total: number;
  goal?: number;
}

// Layout strategy: SVG fills the chart area and uses preserveAspectRatio="none"
// so lines stretch with the container. All text + dots are HTML overlays
// positioned by percentage, so they never get distorted by the stretch.
export default function WeightChart({ days, total, goal = 163 }: Props) {
  const points = days
    .filter((d): d is Day & { weight: number } => typeof d.weight === "number")
    .map((d) => ({ x: d.day, y: d.weight }));

  const allYs = points.map((p) => p.y).concat([goal]);
  const yMax = Math.ceil(Math.max(...allYs) + 3);
  const yMin = Math.floor(goal - 2);

  // viewBox is 100×100; reserve 6 units of vertical padding so labels fit.
  const PAD_T = 6;
  const PAD_B = 6;
  const innerH = 100 - PAD_T - PAD_B;

  const xPos = (day: number) => ((day - 1) / Math.max(1, total - 1)) * 100;
  const yPos = (val: number) => PAD_T + ((yMax - val) / (yMax - yMin)) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(p.x).toFixed(2)} ${yPos(p.y).toFixed(2)}`)
    .join(" ");

  const last = points[points.length - 1];
  const projection = last
    ? `M ${xPos(last.x).toFixed(2)} ${yPos(last.y).toFixed(2)} L ${xPos(total).toFixed(2)} ${yPos(goal).toFixed(2)}`
    : null;

  // 5 y-axis ticks across the data range
  const ticks = 4;
  const yLabels = Array.from({ length: ticks + 1 }, (_, i) => {
    const v = yMax - (i * (yMax - yMin)) / ticks;
    return { value: Math.round(v), top: yPos(v) };
  });

  const goalY = yPos(goal);

  return (
    <div className="rb-weight-frame">
      {/* y-axis labels — HTML, positioned relative to the frame */}
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
          <line
            className="rb-weight-goal"
            x1={0}
            y1={goalY}
            x2={100}
            y2={goalY}
            vectorEffect="non-scaling-stroke"
          />
          {projection && (
            <path className="rb-weight-projection" d={projection} vectorEffect="non-scaling-stroke" />
          )}
          {points.length > 1 && (
            <path className="rb-weight-line" d={linePath} vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {/* data points — HTML so they stay circular on stretch */}
        {points.map((p, i) => (
          <div
            key={i}
            className="rb-weight-pt"
            style={{ left: `${xPos(p.x)}%`, top: `${yPos(p.y)}%` }}
          />
        ))}
        <div className="rb-weight-goal-label" style={{ top: `${goalY}%` }}>
          goal · {goal}
        </div>
      </div>
    </div>
  );
}
