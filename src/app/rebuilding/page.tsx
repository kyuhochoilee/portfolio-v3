import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getAllDays } from "@/lib/notion";
import Dashboard from "@/components/rebuilding/Dashboard";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import "./rebuilding.css";

export const metadata = {
  title: "rebuilding in 50",
  description: "50-day rebuild — habit tracker + progress dashboard.",
};

export default async function RebuildingPage() {
  const unlocked = await isThoughtsUnlocked();
  if (!unlocked) return <PasswordGate />;

  const days = await getAllDays();
  return <Dashboard days={days} />;
}
