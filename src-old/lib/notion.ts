/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";
import { ExtendedRecordMap } from "notion-types";
import { staticProjects, staticProjectDetails } from "@/data/staticProjects";

// ✨ NEW – simple switch
const USE_STATIC = process.env.USE_STATIC === "1";
// Toggle between live Notion data and hard‑coded static data in src/data/staticProjects

//init notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

//fetches page content through react notion x
const notionAPI = new NotionAPI();

//this is for typsecript interfaces, for type safety.
//describing the shape/format of my data
export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredImage: string;
  headerImage: string;
  tags: string[];
  link: string;
  role: string;
  tools: string[];
  timeline: string;
  published: boolean;
}

//adding full notion page data for rendering
//this is the full page content, which includes blocks, properties, etc.
export interface ProjectDetail extends ProjectSummary {
  pageContent: any;
}

//converts notion from complex format to simple format.
function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((item) => item.plain_text).join("");
}

//take out file url from notions file format
function extractFilesFromProperty(files: any[]): string[] {
  if (!files || !Array.isArray(files)) return [];
  return files
    .map((file) => {
      if (file.type === "file") {
        return file.file.url;
      } else if (file.type === "external") {
        return file.external.url;
      }
      return "";
    })
    .filter((url) => url !== "");
}

type NotionRecordMap = ExtendedRecordMap;

// Function 1: Get all published projects (for home page)
export async function getProjects(): Promise<ProjectSummary[]> {
  if (USE_STATIC) {
    return staticProjects;
  }
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    // Transform Notion's complex data format into our simple ProjectSummary format
    const projects: ProjectSummary[] = response.results.map((page: any) => {
      const properties = page.properties;

      return {
        id: page.id,
        name: extractTextFromRichText(properties.Name?.title),
        slug: extractTextFromRichText(properties.Slug?.rich_text),
        description: extractTextFromRichText(properties.Description?.rich_text),
        featuredImage: extractFilesFromProperty(
          properties["Featured Image"]?.files
        )[0],
        headerImage:
          extractFilesFromProperty(properties["Header Image"]?.files)[0] ?? "",
        tags:
          properties.Tags?.multi_select?.map(
            (tag: { name: string }) => tag.name
          ) || [],
        link: extractTextFromRichText(properties.Link?.rich_text),
        role: extractTextFromRichText(properties.Role?.rich_text),
        tools:
          properties.Tools?.multi_select?.map(
            (t: { name: string }) => t.name
          ) || [],
        timeline: extractTextFromRichText(properties.Timeline?.rich_text),
        published: properties.Published?.checkbox || false,
      };
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return []; // Return empty array if something goes wrong
  }
}

// Function 2: Get a single project with full page content
export async function getProjectBySlug(
  slug: string
): Promise<ProjectDetail | null> {
  if (USE_STATIC) {
    return staticProjectDetails[slug] ?? null;
  }
  try {
    // First, find the project in the database by slug
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null; // Project not found
    }

    const page = response.results[0] as any;
    const properties = page.properties;

    // Get the full page content (this is the magic part!)
    const recordMap = await notionAPI.getPage(page.id);

    return {
      id: page.id,
      name: extractTextFromRichText(properties.Name?.title),
      slug: extractTextFromRichText(properties.Slug?.rich_text),
      description: extractTextFromRichText(properties.Description?.rich_text),
      featuredImage: extractFilesFromProperty(
        properties["Featured Image"]?.files
      )[0],
      headerImage:
        extractFilesFromProperty(properties["Header Image"]?.files)[0] ?? "",
      tags:
        properties.Tags?.multi_select?.map(
          (tag: { name: string }) => tag.name
        ) || [],
      link: extractTextFromRichText(properties.Link?.rich_text),
      role: extractTextFromRichText(properties.Role?.rich_text),
      tools:
        properties.Tools?.multi_select?.map((t: { name: string }) => t.name) ||
        [],
      timeline: extractTextFromRichText(properties.Timeline?.rich_text),
      published: properties.Published?.checkbox || false,
      pageContent: recordMap as NotionRecordMap,
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

// Function 3: Helper for static generation (we'll use this later)
export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
    });

    return response.results
      .map((page: any) => {
        const properties = page.properties;
        return extractTextFromRichText(properties.Slug?.rich_text);
      })
      .filter((slug) => slug !== "");
  } catch (error) {
    console.error("Error fetching project slugs:", error);
    return [];
  }
}
