import { notFound } from "next/navigation";
import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getDay, getDayBlocks, TOTAL_DAYS } from "@/lib/notion";
import DayView from "@/components/rebuilding/DayView";
import PasswordGate from "@/components/rebuilding/PasswordGate";
import "../rebuilding.css";

interface PageProps {
  params: Promise<{ day: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { day } = await params;
  const n = parseInt(day, 10);
  if (!n) return { title: "day — rebuilding" };
  return { title: `day ${String(n).padStart(2, "0")} — rebuilding` };
}

export default async function DayPage({ params }: PageProps) {
  const unlocked = await isThoughtsUnlocked();
  if (!unlocked) return <PasswordGate />;

  const { day: dayParam } = await params;
  const dayNum = parseInt(dayParam, 10);
  if (!dayNum || dayNum < 1 || dayNum > TOTAL_DAYS) notFound();

  const day = await getDay(dayNum);
  if (!day) {
    // No data yet for this day — render minimal stub via DayView with empty blocks.
    return (
      <DayView
        day={{
          id: "",
          day: dayNum,
          date: null,
          weight: null,
          sleep: null,
          eating: null,
          photos: [],
          checks: {
            workout: false,
            hydration: false,
            read: false,
            journal: false,
            stretch: false,
            skin: false,
            meditation: false,
            friend: false,
            building: false,
            zaza: false,
          },
        }}
        blocks={[]}
      />
    );
  }

  const blocks = await getDayBlocks(day.id);
  return <DayView day={day} blocks={blocks} />;
}
