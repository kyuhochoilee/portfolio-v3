/* Habit lookup + auto-assignment from schema.
   Known property names get curated icon/color/gradient pairs.
   Unknown ones get deterministic fallbacks. */

export interface HabitDef {
  key: string; // property name in Notion
  label: string;
  icon: string; // lucide-react icon name
  color: string;
  grad: [string, string];
}

const KNOWN_HABITS: Record<string, Omit<HabitDef, "key" | "label">> = {
  workout:    { icon: "Dumbbell",  color: "#ff6f61", grad: ["#ff6f61", "#ffb627"] },
  hydration:  { icon: "Droplet",   color: "#4d96ff", grad: ["#4d96ff", "#4ecdc4"] },
  read:       { icon: "BookOpen",  color: "#9b5de5", grad: ["#9b5de5", "#f15bb5"] },
  journal:    { icon: "PenLine",   color: "#00bbf9", grad: ["#00bbf9", "#9b5de5"] },
  stretch:    { icon: "Waves",     color: "#06d6a0", grad: ["#06d6a0", "#00bbf9"] },
  skin:       { icon: "Sparkles",  color: "#ff85a1", grad: ["#ff85a1", "#ffd6a5"] },
  skincare:   { icon: "Sparkles",  color: "#ff85a1", grad: ["#ff85a1", "#ffd6a5"] },
  meditation: { icon: "Leaf",      color: "#10b981", grad: ["#10b981", "#86efac"] },
  friend:     { icon: "Users",     color: "#ffb627", grad: ["#ffb627", "#ff85a1"] },
  building:   { icon: "Briefcase", color: "#6366f1", grad: ["#6366f1", "#9b5de5"] },
  zaza:       { icon: "Heart",     color: "#e63946", grad: ["#e63946", "#ff85a1"] },
  steps:      { icon: "Footprints", color: "#06d6a0", grad: ["#06d6a0", "#4ade80"] },
  screentime: { icon: "Smartphone", color: "#94a3b8", grad: ["#94a3b8", "#64748b"] },
  // sleep + eating render as tiered selects; these are just fallbacks if used elsewhere
  sleep:      { icon: "Moon",      color: "#6b7280", grad: ["#6b7280", "#9ca3af"] },
  eating:     { icon: "Apple",     color: "#6b7280", grad: ["#6b7280", "#9ca3af"] },
};

const FALLBACK_PALETTE: { color: string; grad: [string, string] }[] = [
  { color: "#f97316", grad: ["#f97316", "#fbbf24"] },
  { color: "#3b82f6", grad: ["#3b82f6", "#06b6d4"] },
  { color: "#a855f7", grad: ["#a855f7", "#ec4899"] },
  { color: "#10b981", grad: ["#10b981", "#22d3ee"] },
  { color: "#f59e0b", grad: ["#f59e0b", "#fb923c"] },
  { color: "#8b5cf6", grad: ["#8b5cf6", "#c084fc"] },
  { color: "#14b8a6", grad: ["#14b8a6", "#06d6a0"] },
  { color: "#ec4899", grad: ["#ec4899", "#f472b6"] },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function habitDef(name: string): HabitDef {
  const key = name.toLowerCase();
  const known = KNOWN_HABITS[key];
  if (known) return { key: name, label: name, ...known };
  const slot = FALLBACK_PALETTE[hash(key) % FALLBACK_PALETTE.length];
  return { key: name, label: name, icon: "Circle", ...slot };
}

/* Notion select-option colors → CSS gradient.
   Used to color "tiered" select-property cells (sleep, eating, mood, etc.). */
export const NOTION_COLOR_GRAD: Record<string, [string, string]> = {
  default: ["#9ca3af", "#6b7280"],
  gray:    ["#9ca3af", "#6b7280"],
  brown:   ["#a8a29e", "#78716c"],
  orange:  ["#fb923c", "#f97316"],
  yellow:  ["#fbbf24", "#f59e0b"],
  green:   ["#22c55e", "#4ade80"],
  blue:    ["#60a5fa", "#3b82f6"],
  purple:  ["#c084fc", "#a855f7"],
  pink:    ["#f9a8d4", "#ec4899"],
  red:     ["#f87171", "#ef4444"],
};

export function gradCss([a, b]: [string, string]): string {
  return `linear-gradient(135deg, ${a}, ${b})`;
}

// Heuristic: a select prop is "tiered" if its options have varying colors.
// (sleep, eating, mood, etc. all use Notion's color-coded options.)
// Used by HabitGrid to decide rendering mode. Currently we treat ALL selects as
// tiered — each option uses its own Notion color.
