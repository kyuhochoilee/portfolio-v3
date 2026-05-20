import {
  Dumbbell,
  Droplet,
  BookOpen,
  PenLine,
  Waves,
  Sparkles,
  Leaf,
  Users,
  Briefcase,
  Heart,
  Moon,
  Apple,
  Footprints,
  Smartphone,
  Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Droplet,
  BookOpen,
  PenLine,
  Waves,
  Sparkles,
  Leaf,
  Users,
  Briefcase,
  Heart,
  Moon,
  Apple,
  Footprints,
  Smartphone,
  Circle,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Circle;
}
