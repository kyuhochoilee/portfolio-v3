import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getRunsData } from "@/lib/notion";
import RebuildingApp from "@/components/rebuilding/RebuildingApp";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import "./rebuilding.css";

export const revalidate = 60;

export const metadata = {
  title: "rebuilding in 50",
  description: "50-day rebuild — habit tracker + progress dashboard.",
};

export default async function RebuildingPage() {
  if (!(await isThoughtsUnlocked())) return <PasswordGate />;

  const runs = await getRunsData();
  if (!runs.kyu.schema) return <div className="rb-wrap">schema unavailable</div>;

  return <RebuildingApp runs={runs} initialRun="kyu" />;
}
