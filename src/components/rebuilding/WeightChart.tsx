import type { Day } from "@/lib/notion";

interface Props {
  days: Day[];
  total: number;
  goal?: number;
  axisMax?: number;
}

export default function WeightChart({ days, total, goal = 163, axisMax }: Props) {
  const points = days
    .filter((d): d is Day & { weight: number } => typeof d.weight === "number")
    .map((d) => ({ x: d.day, y: d.weight }));

  const allYs = points.map((p) => p.y).concat([goal]);
  const yMax = axisMax ?? Math.ceil(Math.max(...allYs) + 3);
  const yMin = Math.floor(goal - 2);

  const W = 980;
  const H = 140;
  const PAD_L = 40;
  const PAD_R = 12;
  const PAD_T = 16;
  const PAD_B = 16;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xFor = (day: number) => PAD_L + ((day - 1) / Math.max(1, total - 1)) * innerW;
  const yFor = (val: number) => PAD_T + ((yMax - val) / (yMax - yMin)) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.x).toFixed(2)} ${yFor(p.y).toFixed(2)}`)
    .join(" ");

  // projection from last logged point to goal at total
  const last = points[points.length - 1];
  const projection = last
    ? `M ${xFor(last.x).toFixed(2)} ${yFor(last.y).toFixed(2)} L ${xFor(total).toFixed(2)} ${yFor(goal).toFixed(2)}`
    : null;

  // y-axis gridlines (5 ticks)
  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => yMax - (i * (yMax - yMin)) / ticks);

  return (
    <svg className="rb-weight" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {tickValues.map((v, i) => {
        const y = yFor(v);
        return (
          <g key={i}>
            <line className="rb-weight-grid" x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} />
            <text className="rb-weight-axis" x={PAD_L - 6} y={y + 3} textAnchor="end">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      <line
        className="rb-weight-goal"
        x1={PAD_L}
        y1={yFor(goal)}
        x2={W - PAD_R}
        y2={yFor(goal)}
      />
      <text className="rb-weight-axis" x={PAD_L} y={yFor(goal) - 4}>
        goal · {goal}
      </text>
      {projection && <path className="rb-weight-projection" d={projection} />}
      {points.length > 1 && <path className="rb-weight-line" d={linePath} />}
      {points.map((p, i) => (
        <circle key={i} className="rb-weight-pt" cx={xFor(p.x)} cy={yFor(p.y)} r={2.5} />
      ))}
    </svg>
  );
}
