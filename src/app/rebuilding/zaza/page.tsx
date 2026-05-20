import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getRunsData } from "@/lib/notion";
import RebuildingApp from "@/components/rebuilding/RebuildingApp";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import "../rebuilding.css";

export const revalidate = 60;

export const metadata = {
  title: "zaza — rebuilding in 50",
};

export default async function ZazaPage() {
  if (!(await isThoughtsUnlocked())) return <PasswordGate />;

  const runs = await getRunsData();
  if (!runs.zaza.schema) return <div className="rb-wrap">schema unavailable</div>;

  return <RebuildingApp runs={runs} initialRun="zaza" />;
}
