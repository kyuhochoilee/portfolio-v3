import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  tags?: string[];
  readingTime: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  description: string;
  featuredImage: string;
  headerImage?: string;
  tags: string[];
  link?: string;
  role?: string;
  tools?: string[];
  timeline?: string;
}

function parseMdxFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  return { data, content, readingTime: stats.text };
}

function getAllFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
}

// ── Blog ──

export function getBlogPosts(): PostMeta[] {
  const dir = path.join(CONTENT_DIR, "thoughts");
  return getAllFiles(dir)
    .map((filename) => {
      const { data, readingTime: rt } = parseMdxFile(path.join(dir, filename));
      return {
        slug: filename.replace(/\.mdx$/, ""),
        title: data.title ?? "Untitled",
        description: data.description ?? "",
        date: data.date ?? "",
        image: data.image,
        tags: data.tags,
        readingTime: rt,
        _draft: data.draft === true,
      };
    })
    .filter((post) => !post._draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, "thoughts", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content, readingTime: rt } = parseMdxFile(filePath);
  return {
    meta: {
      slug,
      title: data.title ?? "Untitled",
      description: data.description ?? "",
      date: data.date ?? "",
      image: data.image,
      tags: data.tags,
      readingTime: rt,
    } as PostMeta,
    content,
  };
}

// ── Projects ──

export function getProjects(): ProjectMeta[] {
  const dir = path.join(CONTENT_DIR, "projects");
  return getAllFiles(dir).map((filename) => {
    const { data } = parseMdxFile(path.join(dir, filename));
    return {
      slug: filename.replace(/\.mdx$/, ""),
      title: data.title ?? "Untitled",
      description: data.description ?? "",
      featuredImage: data.featuredImage ?? "",
      headerImage: data.headerImage,
      tags: data.tags ?? [],
      link: data.link,
      role: data.role,
      tools: data.tools,
      timeline: data.timeline,
    };
  });
}

export function getProject(slug: string) {
  const filePath = path.join(CONTENT_DIR, "projects", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = parseMdxFile(filePath);
  return {
    meta: {
      slug,
      title: data.title ?? "Untitled",
      description: data.description ?? "",
      featuredImage: data.featuredImage ?? "",
      headerImage: data.headerImage,
      tags: data.tags ?? [],
      link: data.link,
      role: data.role,
      tools: data.tools,
      timeline: data.timeline,
    } as ProjectMeta,
    content,
  };
}
