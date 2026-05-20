import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

const token = process.env.NOTION_REBUILDING_TOKEN;
const notion = token ? new Client({ auth: token }) : null;

/* ───── runs (data sources) ───── */

export interface RunConfig {
  label: string;
  dataSourceId: string;
  rootPageId?: string;
}

export const RUNS: Record<string, RunConfig> = {
  kyu: {
    label: "kyu",
    dataSourceId:
      process.env.NOTION_REBUILDING_DATA_SOURCE_ID ||
      "3632548b-647f-814d-9db4-000b7c4f304f",
    rootPageId:
      process.env.NOTION_REBUILDING_ROOT_PAGE_ID ||
      "3632548b-647f-80ee-bc6b-e7fc16888c25",
  },
  zaza: {
    label: "zaza",
    dataSourceId: "3632548b-647f-80b5-982d-000bd63f034f",
    rootPageId:
      process.env.NOTION_REBUILDING_ROOT_PAGE_ID ||
      "3632548b-647f-80ee-bc6b-e7fc16888c25",
  },
};

export type RunKey = keyof typeof RUNS;
export const RUN_KEYS = Object.keys(RUNS) as RunKey[];

export const TOTAL_DAYS = 50;

/* ───── schema discovery ───── */

export type PropType =
  | "checkbox"
  | "select"
  | "number"
  | "date"
  | "title"
  | "files"
  | "rich_text"
  | "other";

export interface SelectOption {
  name: string;
  color: string;
}

export interface PropDef {
  name: string;
  type: PropType;
  options?: SelectOption[];
}

export interface Schema {
  props: PropDef[];
  titleProp: string | null;
  dateProp: string | null;
  fileProp: string | null;
  weightProp: string | null;
  checkboxProps: PropDef[];
  selectProps: PropDef[];
  numberProps: PropDef[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSchema(raw: any): Schema {
  const props: PropDef[] = [];
  const rawProps = raw?.properties ?? {};
  for (const [name, def] of Object.entries(rawProps)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = def as any;
    const t = d.type as string;
    let type: PropType = "other";
    let options: SelectOption[] | undefined;
    if (t === "checkbox") type = "checkbox";
    else if (t === "select") {
      type = "select";
      options = (d.select?.options ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (o: any) => ({ name: o.name, color: o.color }),
      );
    } else if (t === "number") type = "number";
    else if (t === "date") type = "date";
    else if (t === "title") type = "title";
    else if (t === "files") type = "files";
    else if (t === "rich_text") type = "rich_text";
    props.push({ name, type, options });
  }
  const titleProp = props.find((p) => p.type === "title")?.name ?? null;
  const dateProp = props.find((p) => p.type === "date")?.name ?? null;
  const fileProp = props.find((p) => p.type === "files")?.name ?? null;
  const numberProps = props.filter((p) => p.type === "number");
  const weightProp =
    numberProps.find((p) => p.name.toLowerCase() === "weight")?.name ??
    numberProps[0]?.name ??
    null;
  return {
    props,
    titleProp,
    dateProp,
    fileProp,
    weightProp,
    checkboxProps: props.filter((p) => p.type === "checkbox"),
    selectProps: props.filter((p) => p.type === "select"),
    numberProps,
  };
}

const schemaCaches: Partial<Record<RunKey, () => Promise<Schema | null>>> = {};
export async function getSchema(run: RunKey): Promise<Schema | null> {
  if (!notion) return null;
  if (!schemaCaches[run]) {
    schemaCaches[run] = unstable_cache(
      async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any = await notion.dataSources.retrieve({
          data_source_id: RUNS[run].dataSourceId,
        });
        return parseSchema(raw);
      },
      [`rebuilding-${run}-schema`],
      { revalidate: 60, tags: [`rebuilding-${run}`] },
    );
  }
  return schemaCaches[run]!();
}

/* ───── day data ───── */

export type CellValue = boolean | number | string | null;

export interface Day {
  id: string;
  day: number;
  date: string | null;
  photos: string[];
  values: Record<string, CellValue>;
  notes: string | null; // first rich_text prop, e.g. "notes"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richText(rt: any[] | undefined): string {
  if (!rt) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rt.map((t: any) => t.plain_text || "").join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDay(page: any, schema: Schema): Day | null {
  const p = page.properties || {};
  const titleKey = schema.titleProp;
  if (!titleKey) return null;
  const titleText = richText(p[titleKey]?.title);
  const match = titleText.match(/^(\d+)/);
  if (!match) return null;
  const dayNum = parseInt(match[1], 10);

  const date = schema.dateProp ? (p[schema.dateProp]?.date?.start ?? null) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileEntries: any[] = schema.fileProp ? (p[schema.fileProp]?.files ?? []) : [];
  const photos = fileEntries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((f: any) => f.file?.url || f.external?.url)
    .filter((u: string | undefined): u is string => typeof u === "string");

  const values: Record<string, CellValue> = {};
  for (const def of schema.props) {
    const raw = p[def.name];
    if (!raw) {
      values[def.name] = null;
      continue;
    }
    switch (def.type) {
      case "checkbox":
        values[def.name] = !!raw.checkbox;
        break;
      case "select":
        values[def.name] = raw.select?.name ?? null;
        break;
      case "number":
        values[def.name] = typeof raw.number === "number" ? raw.number : null;
        break;
      case "rich_text":
        values[def.name] = richText(raw.rich_text);
        break;
      default:
        values[def.name] = null;
    }
  }

  const richProp = schema.props.find((x) => x.type === "rich_text");
  const notes = richProp ? ((values[richProp.name] as string) || null) : null;

  return { id: page.id, day: dayNum, date, photos, values, notes };
}

const dayCaches: Partial<Record<RunKey, () => Promise<Day[]>>> = {};
export async function getAllDays(run: RunKey): Promise<Day[]> {
  if (!notion) return [];
  if (!dayCaches[run]) {
    dayCaches[run] = unstable_cache(
      async () => {
        const schema = await getSchema(run);
        if (!schema) return [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let all: any[] = [];
        let cursor: string | undefined = undefined;
        do {
          const res = await notion!.dataSources.query({
            data_source_id: RUNS[run].dataSourceId,
            page_size: 100,
            start_cursor: cursor,
          });
          all = all.concat(res.results);
          cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
        } while (cursor);
        return all
          .map((page) => parseDay(page, schema))
          .filter((d): d is Day => d !== null)
          .sort((a, b) => a.day - b.day);
      },
      [`rebuilding-${run}-days`],
      { revalidate: 60, tags: [`rebuilding-${run}`] },
    );
  }
  return dayCaches[run]!();
}

export async function getDay(run: RunKey, dayNum: number): Promise<Day | null> {
  const days = await getAllDays(run);
  return days.find((d) => d.day === dayNum) ?? null;
}

/* ───── block children (for page bodies) ───── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _fetchBlocks(blockId: string): Promise<any[]> {
  if (!notion) return [];
  const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = res.results;
  for (const b of blocks) {
    if (b.has_children) b.children = await _fetchBlocks(b.id);
  }
  return blocks;
}

export const getDayBlocks = unstable_cache(_fetchBlocks, ["rebuilding-blocks"], {
  revalidate: 60,
  tags: ["rebuilding"],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function _getRulesBlocksImpl(): Promise<any[]> {
  if (!notion) return [];
  const rootPageId = RUNS.kyu.rootPageId;
  if (!rootPageId) return [];
  const blocks = await _fetchBlocks(rootPageId);
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

export const getRulesBlocks = unstable_cache(_getRulesBlocksImpl, ["rebuilding-rules"], {
  revalidate: 60,
  tags: ["rebuilding"],
});
