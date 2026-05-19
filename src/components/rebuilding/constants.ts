import type { HabitKey } from "@/lib/notion";

export interface HabitDef {
  key: HabitKey | "sleep" | "eating";
  label: string;
  icon: string; // lucide-react icon name
  color: string;
  grad: [string, string];
  tiered?: boolean;
}

// shadergradient-inspired palette: primary color + 2-stop gradient per habit
export const HABITS: HabitDef[] = [
  { key: "workout",    label: "workout",    icon: "Dumbbell",       color: "#ff6f61", grad: ["#ff6f61", "#ffb627"] },
  { key: "hydration",  label: "hydration",  icon: "Droplet",        color: "#4d96ff", grad: ["#4d96ff", "#4ecdc4"] },
  { key: "read",       label: "read",       icon: "BookOpen",       color: "#9b5de5", grad: ["#9b5de5", "#f15bb5"] },
  { key: "journal",    label: "journal",    icon: "PenLine",        color: "#00bbf9", grad: ["#00bbf9", "#9b5de5"] },
  { key: "stretch",    label: "stretch",    icon: "Waves",          color: "#06d6a0", grad: ["#06d6a0", "#00bbf9"] },
  { key: "skin",       label: "skin",       icon: "Sparkles",       color: "#ff85a1", grad: ["#ff85a1", "#ffd6a5"] },
  { key: "meditation", label: "meditation", icon: "Leaf",           color: "#10b981", grad: ["#10b981", "#86efac"] },
  { key: "friend",     label: "friend",     icon: "Users",          color: "#ffb627", grad: ["#ffb627", "#ff85a1"] },
  { key: "building",   label: "building",   icon: "Briefcase",      color: "#6366f1", grad: ["#6366f1", "#9b5de5"] },
  { key: "zaza",       label: "zaza",       icon: "Heart",          color: "#e63946", grad: ["#e63946", "#ff85a1"] },
  { key: "sleep",      label: "sleep",      icon: "Moon",           color: "#6b7280", grad: ["#6b7280", "#6b7280"], tiered: true },
  { key: "eating",     label: "eating",     icon: "Apple",          color: "#6b7280", grad: ["#6b7280", "#6b7280"], tiered: true },
];

export const TIER_GRAD: Record<"good" | "mid" | "bad", [string, string]> = {
  good: ["#06d6a0", "#4ade80"],
  mid:  ["#fbbf24", "#f59e0b"],
  bad:  ["#f87171", "#ef4444"],
};

export function sleepTier(value: string | null): "good" | "mid" | "bad" | null {
  if (!value) return null;
  if (value === "7-9 hours" || value === "10+ hours") return "good";
  if (value === "4-6 hours") return "mid";
  if (value === "1-3 hours" || value === "all nighter") return "bad";
  return null;
}

export function eatingTier(value: string | null): "good" | "mid" | "bad" | null {
  if (!value) return null;
  if (value === "great - healthy") return "good";
  if (value === "ok - average") return "mid";
  if (value === "bad - unhealthy") return "bad";
  return null;
}

export function gradCss([a, b]: [string, string]): string {
  return `linear-gradient(135deg, ${a}, ${b})`;
}
