import { notFound } from "next/navigation";
import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getDay, getDayBlocks, getSchema, TOTAL_DAYS } from "@/lib/notion";
import DayView from "@/components/rebuilding/DayView";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import "../../rebuilding.css";

interface PageProps {
  params: Promise<{ day: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => ({
    day: String(i + 1).padStart(2, "0"),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { day } = await params;
  const n = parseInt(day, 10);
  return { title: `zaza · day ${String(n).padStart(2, "0")} — rebuilding` };
}

export default async function ZazaDayPage({ params }: PageProps) {
  const unlocked = await isThoughtsUnlocked();
  if (!unlocked) return <PasswordGate />;

  const { day: dayParam } = await params;
  const dayNum = parseInt(dayParam, 10);
  if (!dayNum || dayNum < 1 || dayNum > TOTAL_DAYS) notFound();

  const schema = await getSchema("zaza");
  if (!schema) return <div className="rb-wrap">schema unavailable</div>;
  const day = await getDay("zaza", dayNum);

  if (!day) {
    const empty = {
      id: "",
      day: dayNum,
      date: null,
      photos: [],
      values: {},
      notes: null,
    };
    return <DayView run="zaza" schema={schema} day={empty} blocks={[]} />;
  }

  const blocks = await getDayBlocks(day.id);
  return <DayView run="zaza" schema={schema} day={day} blocks={blocks} />;
}
