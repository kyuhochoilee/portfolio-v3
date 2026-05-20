import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getAllDays, getSchema } from "@/lib/notion";
import Dashboard from "@/components/rebuilding/Dashboard";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import "../rebuilding.css";

export const revalidate = 60;

export const metadata = {
  title: "zaza — rebuilding in 50",
};

export default async function ZazaPage() {
  const unlocked = await isThoughtsUnlocked();
  if (!unlocked) return <PasswordGate />;

  const [schema, days] = await Promise.all([getSchema("zaza"), getAllDays("zaza")]);
  if (!schema) return <div className="rb-wrap">schema unavailable</div>;
  return <Dashboard run="zaza" schema={schema} days={days} />;
}
