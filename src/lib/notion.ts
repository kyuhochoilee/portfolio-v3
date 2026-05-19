import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

const token = process.env.NOTION_REBUILDING_TOKEN;
const DATA_SOURCE_ID =
  process.env.NOTION_REBUILDING_DATA_SOURCE_ID || "3632548b-647f-814d-9db4-000b7c4f304f";

const notion = token ? new Client({ auth: token }) : null;

export const HABIT_KEYS = [
  "workout",
  "hydration",
  "read",
  "journal",
  "stretch",
  "skin",
  "meditation",
  "friend",
  "building",
  "zaza",
] as const;
export type HabitKey = (typeof HABIT_KEYS)[number];

export interface Day {
  id: string;
  day: number;
  date: string | null;
  weight: number | null;
  sleep: string | null;
  eating: string | null;
  photos: string[];
  checks: Record<HabitKey, boolean>;
}

// Notion's API types are loose unions; treat property bag as any for parsing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDay(page: any): Day | null {
  const p = page.properties || {};

  const titleArr = p.day?.title || [];
  const titleText = titleArr.map((t: { plain_text?: string }) => t.plain_text || "").join("");
  const match = titleText.match(/^(\d+)/);
  if (!match) return null;
  const dayNum = parseInt(match[1], 10);

  const date = p.date?.date?.start ?? null;
  const weight = typeof p.weight?.number === "number" ? p.weight.number : null;
  const sleep = p.sleep?.select?.name ?? null;
  const eating = p.eating?.select?.name ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files: any[] = p.photo?.files || [];
  const photos = files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((f: any) => f.file?.url || f.external?.url)
    .filter((u: string | undefined): u is string => typeof u === "string");

  const checks = {} as Record<HabitKey, boolean>;
  for (const key of HABIT_KEYS) {
    checks[key] = !!p[key]?.checkbox;
  }

  return {
    id: page.id,
    day: dayNum,
    date,
    weight,
    sleep,
    eating,
    photos,
    checks,
  };
}

async function _getAllDays(): Promise<Day[]> {
  if (!notion) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let all: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: "date", direction: "ascending" }],
    });
    all = all.concat(res.results);
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);

  return all
    .map(parseDay)
    .filter((d): d is Day => d !== null)
    .sort((a, b) => a.day - b.day);
}

export const getAllDays = unstable_cache(_getAllDays, ["rebuilding-days"], {
  revalidate: 60,
  tags: ["rebuilding"],
});

export async function getDay(dayNum: number): Promise<Day | null> {
  const days = await getAllDays();
  return days.find((d) => d.day === dayNum) ?? null;
}

// Recursively fetch block children for a page (toggles have nested content).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _fetchBlocks(blockId: string): Promise<any[]> {
  if (!notion) return [];
  const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = res.results;
  for (const b of blocks) {
    if (b.has_children) {
      b.children = await _fetchBlocks(b.id);
    }
  }
  return blocks;
}

export const getDayBlocks = unstable_cache(_fetchBlocks, ["rebuilding-blocks"], {
  revalidate: 60,
  tags: ["rebuilding"],
});

const ROOT_PAGE_ID =
  process.env.NOTION_REBUILDING_ROOT_PAGE_ID || "3632548b-647f-80ee-bc6b-e7fc16888c25";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _getRulesBlocks(): Promise<any[]> {
  if (!notion) return [];
  const blocks = await _fetchBlocks(ROOT_PAGE_ID);

  // Find the toggle (or toggle-heading) whose title mentions "rule".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = blocks.find((b: any) => {
    const isToggle = b.type === "toggle";
    const isHeadingToggle =
      (b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3") &&
      b[b.type]?.is_toggleable;
    if (!isToggle && !isHeadingToggle) return false;
    const data = b[b.type];
    const text = (data?.rich_text || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((t: any) => t.plain_text || "")
      .join("")
      .toLowerCase();
    return text.includes("rule");
  });

  return found?.children ?? [];
}

export const getRulesBlocks = unstable_cache(_getRulesBlocks, ["rebuilding-rules"], {
  revalidate: 60,
  tags: ["rebuilding"],
});

export const TOTAL_DAYS = 50;
