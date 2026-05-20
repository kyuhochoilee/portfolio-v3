import { NextResponse } from "next/server";
import { isThoughtsUnlocked } from "@/lib/thoughtsAuth";
import { getAllDays, getDayBlocks, RUNS, TOTAL_DAYS, type RunKey } from "@/lib/notion";

/* Lazy block fetch for the day sheet. Auth-gated behind the same password
   cookie as the rest of /rebuilding. Takes run + day (not a raw Notion id)
   so the client can never fetch arbitrary pages through the integration. */
export async function GET(req: Request) {
  if (!(await isThoughtsUnlocked())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const run = searchParams.get("run");
  const day = Number(searchParams.get("day"));

  if (!run || !(run in RUNS)) {
    return NextResponse.json({ error: "bad run" }, { status: 400 });
  }
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
    return NextResponse.json({ error: "bad day" }, { status: 400 });
  }

  const days = await getAllDays(run as RunKey);
  const match = days.find((d) => d.day === day);
  if (!match) return NextResponse.json({ blocks: [] });

  const blocks = await getDayBlocks(match.id);
  return NextResponse.json({ blocks });
}
